import "server-only";
import { createHash } from "node:crypto";
import ICAL from "ical.js";
import { auftragNummer, statusName } from "@/lib/auftrag/status";
import { finde, verbinden } from "@/lib/kalender/caldav";
import { KALENDER } from "@/lib/kalender/liste";
import { tagPlus } from "@/lib/kalender/zeit";
import { prisma } from "@/lib/db";

// Deadlines aus dem Auftragsboard als ganztägige Termine im Kalender „Aufträge“.
// Das Cockpit verwaltet nur seine eigenen Dateien („gravaix-auftrag-<id>.ics“) –
// Termine, die Celiano selbst in „Aufträge“ einträgt, bleiben unangetastet.
// Erledigte Aufträge und Aufträge ohne Deadline verschwinden aus dem Kalender.

const PRAEFIX = "gravaix-auftrag-";

/** „gravaix-auftrag-12.ics“ → 12, sonst null */
export function deadlineAuftrag(datei: string) {
  const treffer = new RegExp(`^${PRAEFIX}(\\d+)\\.ics$`).exec(datei);
  return treffer ? Number(treffer[1]) : null;
}

type AuftragKurz = {
  id: number;
  titel: string;
  kunde: string;
  produkt: string | null;
  menge: number | null;
  status: Parameters<typeof statusName>[0];
  deadline: Date;
};

function cockpitUrl(pfad: string) {
  return `${(process.env.BETTER_AUTH_URL || "https://cockpit.gravaix.de").replace(/\/$/, "")}${pfad}`;
}

/** Fingerabdruck der angezeigten Angaben – nur bei Änderungen wird neu geschrieben. */
function stand(a: AuftragKurz) {
  const roh = JSON.stringify([2, a.titel, a.kunde, a.produkt, a.menge, a.status, a.deadline.toISOString().slice(0, 10)]);
  return createHash("sha256").update(roh).digest("hex").slice(0, 16);
}

function deadlineIcs(a: AuftragKurz) {
  const tag = a.deadline.toISOString().slice(0, 10);
  const vcal = new ICAL.Component("vcalendar");
  vcal.updatePropertyWithValue("prodid", "-//Gravaix//Cockpit//DE");
  vcal.updatePropertyWithValue("version", "2.0");
  const v = new ICAL.Component("vevent");
  const jetzt = ICAL.Time.fromJSDate(new Date(), true);
  v.updatePropertyWithValue("uid", `${PRAEFIX}${a.id}@cockpit.gravaix.de`);
  v.updatePropertyWithValue("dtstamp", jetzt);
  v.updatePropertyWithValue("last-modified", jetzt);
  v.updatePropertyWithValue("summary", `Deadline ${auftragNummer(a.id)}: ${a.titel}`);
  v.updatePropertyWithValue("dtstart", ICAL.Time.fromDateString(tag));
  v.updatePropertyWithValue("dtend", ICAL.Time.fromDateString(tagPlus(tag, 1)));
  v.updatePropertyWithValue("transp", "TRANSPARENT"); // blockiert keine Zeit
  const produkt = [a.menge ? `${a.menge} ×` : "", a.produkt ?? ""].join(" ").trim();
  v.updatePropertyWithValue(
    "description",
    [`Kunde: ${a.kunde}`, ...(produkt ? [`Produkt: ${produkt}`] : []), `Status: ${statusName(a.status)}`, "", "Wird im Cockpit gepflegt – Änderungen bitte dort im Auftrag."].join("\n"),
  );
  v.updatePropertyWithValue("url", cockpitUrl(`/auftraege/${a.id}`));
  v.updatePropertyWithValue("x-gravaix-stand", stand(a));

  // Erinnerung am Vortag um 9 Uhr (ganztägig beginnt um 0 Uhr → 15 Stunden vorher)
  const alarm = new ICAL.Component("valarm");
  alarm.updatePropertyWithValue("action", "DISPLAY");
  alarm.updatePropertyWithValue("description", `Morgen fällig: ${a.titel}`);
  alarm.updatePropertyWithValue("trigger", ICAL.Duration.fromString("-PT15H"));
  v.addSubcomponent(alarm);

  vcal.addSubcomponent(v);
  return vcal.toString();
}

function dateiName(url: string) {
  return decodeURIComponent(url.replace(/\/$/, "").split("/").pop() ?? "");
}

/**
 * Kalender „Aufträge“ mit dem Board abgleichen: fehlende Deadlines eintragen, geänderte
 * aktualisieren, erledigte oder gelöschte entfernen. Gibt zurück, was sich geändert hat.
 */
export async function deadlinesAbgleichen() {
  const client = await verbinden();
  const cal = finde(await client.fetchCalendars(), KALENDER.find((k) => k.slug === "auftraege")!);
  if (!cal) return { eingetragen: 0, entfernt: 0, fehlt: true };

  const auftraege: AuftragKurz[] = (
    await prisma.auftrag.findMany({
      where: { deadline: { not: null }, status: { not: "ERLEDIGT" } },
      select: { id: true, titel: true, kunde: true, produkt: true, menge: true, status: true, deadline: true },
    })
  ).map((a) => ({ ...a, deadline: a.deadline! }));

  const vorhanden = new Map<number, { url: string; data: string }>();
  for (const o of await client.fetchCalendarObjects({ calendar: cal })) {
    const id = deadlineAuftrag(dateiName(o.url));
    if (id !== null) vorhanden.set(id, { url: o.url, data: typeof o.data === "string" ? o.data : "" });
  }

  let eingetragen = 0;
  let entfernt = 0;
  const basis = cal.url.replace(/\/?$/, "/");
  for (const a of auftraege) {
    const alt = vorhanden.get(a.id);
    vorhanden.delete(a.id);
    if (alt?.data.includes(`X-GRAVAIX-STAND:${stand(a)}`)) continue;
    // Ohne etag: das Cockpit ist die Quelle, Änderungen am iPhone werden überschrieben.
    const antwort = await client.updateCalendarObject({
      calendarObject: { url: alt?.url ?? new URL(`${PRAEFIX}${a.id}.ics`, basis).href, data: deadlineIcs(a) },
    });
    if (!antwort.ok) throw new Error(`Deadline ${auftragNummer(a.id)} ließ sich nicht eintragen (${antwort.status})`);
    eingetragen++;
  }
  // Übrig = Auftrag erledigt, ohne Deadline oder gelöscht
  for (const { url } of vorhanden.values()) {
    const antwort = await client.deleteCalendarObject({ calendarObject: { url } });
    if (!antwort.ok && antwort.status !== 404) throw new Error(`Alte Deadline ließ sich nicht entfernen (${antwort.status})`);
    entfernt++;
  }
  return { eingetragen, entfernt, fehlt: false };
}

/** Für die Aufträge-Aktionen: abgleichen, aber ein Kalenderproblem darf das Speichern nie verhindern. */
export async function deadlinesNachziehen() {
  try {
    await deadlinesAbgleichen();
  } catch (fehler) {
    console.error("Deadlines im Kalender:", fehler);
  }
}
