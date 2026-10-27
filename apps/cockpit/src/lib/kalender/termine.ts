import "server-only";
import ICAL from "ical.js";
import type { DAVCalendar, DAVCalendarObject } from "tsdav";
import { finde, verbinden } from "@/lib/kalender/caldav";
import { KALENDER, type KalenderSlug } from "@/lib/kalender/liste";
import { berlinZuDate, tagPlus, tagVon, zeitVon } from "@/lib/kalender/zeit";

// Termine lesen und schreiben. Gespeichert wird im iCalendar-Format (.ics) –
// genau so, wie Apple Kalender es auch macht. Jeder Termin ist eine Datei im Kalender.

// Deutsche Zeitzone, falls ein Termin „Europe/Berlin“ nennt, aber nicht mitliefert.
const BERLIN = `BEGIN:VTIMEZONE
TZID:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`;
if (!ICAL.TimezoneService.has("Europe/Berlin")) {
  ICAL.TimezoneService.register(new ICAL.Component(ICAL.parse(BERLIN)));
}

export type Termin = {
  kalender: KalenderSlug;
  datei: string;
  titel: string;
  ort: string;
  start: Date;
  ende: Date;
  ganztags: boolean;
  /** Erster und letzter Tag (beide einschließlich), „JJJJ-MM-TT“ */
  startTag: string;
  endeTag: string;
  /** Teil einer Serie – im Cockpit nur ansehen, bearbeiten in Apple Kalender */
  wiederholt: boolean;
};

/** Dateinamen von Terminen: nur harmlose Zeichen, kein „/“ (sonst ginge es aus dem Kalender heraus). */
export function istDatei(text: unknown): text is string {
  return typeof text === "string" && text.length < 250 && /^[\w.@%+=-]+\.ics$/i.test(text);
}

export function istKalender(text: unknown): text is KalenderSlug {
  return KALENDER.some((k) => k.slug === text);
}

/** ICAL-Zeit → Zeitpunkt. Termine ohne Zeitzone („schwebend“) gelten als deutsche Zeit. */
function zuDate(t: ICAL.Time) {
  const tag = `${t.year}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
  if (t.isDate) return berlinZuDate(tag);
  if (t.zone === ICAL.Timezone.localTimezone || !t.zone) {
    return berlinZuDate(tag, `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`);
  }
  return new Date(t.toUnixTime() * 1000);
}

function datumText(t: ICAL.Time) {
  return `${t.year}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}

function zeitzonenMerken(kalender: ICAL.Component) {
  for (const tz of kalender.getAllSubcomponents("vtimezone")) {
    const id = tz.getFirstPropertyValue("tzid");
    if (typeof id === "string" && !ICAL.TimezoneService.has(id)) ICAL.TimezoneService.register(tz);
  }
}

/** Ein .ics-Objekt in einzelne Termine im Zeitraum zerlegen (Serien werden aufgefächert). */
function zerlegen(kalender: KalenderSlug, datei: string, ics: string, von: Date, bis: Date): Termin[] {
  const vcal = new ICAL.Component(ICAL.parse(ics));
  zeitzonenMerken(vcal);
  const events = vcal.getAllSubcomponents("vevent");
  const haupt = events.find((e) => !e.hasProperty("recurrence-id")) ?? events[0];
  if (!haupt) return [];
  const event = new ICAL.Event(haupt, { exceptions: events.filter((e) => e !== haupt && e.hasProperty("recurrence-id")) });

  const termin = (start: ICAL.Time, ende: ICAL.Time, e: ICAL.Event): Termin => {
    const ganztags = start.isDate;
    const startDate = zuDate(start);
    // Ohne Ende: ganztags = 1 Tag, sonst 0 Minuten
    const endeDate = ende ? zuDate(ende) : ganztags ? berlinZuDate(tagPlus(datumText(start), 1)) : startDate;
    return {
      kalender,
      datei,
      titel: e.summary || "(ohne Titel)",
      ort: e.location || "",
      start: startDate,
      ende: endeDate,
      ganztags,
      startTag: ganztags ? datumText(start) : tagVon(startDate),
      endeTag: ganztags
        ? tagPlus(ende ? datumText(ende) : datumText(start), ende ? -1 : 0)
        : tagVon(new Date(Math.max(startDate.getTime(), endeDate.getTime() - 1))),
      wiederholt: event.isRecurring(),
    };
  };

  if (!event.isRecurring()) {
    const t = termin(event.startDate, event.endDate, event);
    return t.ende > von && t.start < bis ? [t] : [];
  }

  const liste: Termin[] = [];
  const it = event.iterator();
  for (let i = 0, naechster = it.next(); naechster && i < 5000; i++, naechster = it.next()) {
    if (zuDate(naechster) >= bis) break;
    const d = event.getOccurrenceDetails(naechster);
    const t = termin(d.startDate, d.endDate, d.item);
    if (t.ende > von && t.start < bis) liste.push(t);
  }
  return liste;
}

function dateiName(url: string) {
  return decodeURIComponent(url.replace(/\/$/, "").split("/").pop() ?? "");
}

async function kalenderListe() {
  const client = await verbinden();
  const liste = await client.fetchCalendars();
  const kalender = KALENDER.map((k) => ({ slug: k.slug, cal: finde(liste, k) })).filter(
    (k): k is { slug: KalenderSlug; cal: DAVCalendar } => !!k.cal,
  );
  return { client, kalender };
}

/** Alle Termine der drei Kalender, die den Zeitraum [von, bis) berühren – nach Beginn sortiert. */
export async function termineLaden(von: Date, bis: Date): Promise<Termin[]> {
  const { client, kalender } = await kalenderListe();
  const ergebnisse = await Promise.all(
    kalender.map(async ({ slug, cal }) => {
      const objekte = await client.fetchCalendarObjects({
        calendar: cal,
        timeRange: { start: von.toISOString(), end: bis.toISOString() },
      });
      return objekte.flatMap((o) => {
        if (typeof o.data !== "string") return [];
        try {
          return zerlegen(slug, dateiName(o.url), o.data, von, bis);
        } catch {
          return []; // ein kaputter Termin soll nicht den ganzen Kalender blockieren
        }
      });
    }),
  );
  return ergebnisse.flat().sort((a, b) => a.start.getTime() - b.start.getTime() || a.titel.localeCompare(b.titel));
}

// ---------------------------------------------------------------------------
// Einzelner Termin: lesen, speichern, löschen

export type TerminDaten = {
  titel: string;
  ort: string;
  notizen: string;
  ganztags: boolean;
  startTag: string;
  startZeit: string; // „HH:MM“, bei ganztags egal
  endeTag: string; // letzter Tag (einschließlich)
  endeZeit: string;
};

async function objektLaden(kalender: KalenderSlug, datei: string) {
  const { client, kalender: liste } = await kalenderListe();
  const cal = liste.find((k) => k.slug === kalender)?.cal;
  if (!cal) throw new Error("Diesen Kalender gibt es nicht (mehr).");
  const url = new URL(encodeURIComponent(datei), cal.url.replace(/\/?$/, "/")).href;
  const [objekt] = await client.fetchCalendarObjects({ calendar: cal, objectUrls: [url] });
  return { client, cal, objekt: objekt && typeof objekt.data === "string" ? (objekt as DAVCalendarObject & { data: string }) : null };
}

/** Termin zum Bearbeiten laden. null = gibt es nicht. */
export async function terminLesen(kalender: KalenderSlug, datei: string) {
  const { objekt } = await objektLaden(kalender, datei);
  if (!objekt) return null;
  const vcal = new ICAL.Component(ICAL.parse(objekt.data));
  zeitzonenMerken(vcal);
  const haupt = vcal.getAllSubcomponents("vevent").find((e) => !e.hasProperty("recurrence-id"));
  if (!haupt) return null;
  const event = new ICAL.Event(haupt);
  const ganztags = event.startDate.isDate;
  const start = zuDate(event.startDate);
  const ende = event.endDate ? zuDate(event.endDate) : start;
  const daten: TerminDaten = {
    titel: event.summary ?? "",
    ort: event.location ?? "",
    notizen: event.description ?? "",
    ganztags,
    startTag: ganztags ? datumText(event.startDate) : tagVon(start),
    startZeit: ganztags ? "09:00" : zeitVon(start),
    endeTag: ganztags
      ? event.endDate
        ? tagPlus(datumText(event.endDate), -1)
        : datumText(event.startDate)
      : tagVon(ende),
    endeZeit: ganztags ? "10:00" : zeitVon(ende),
  };
  return { daten, etag: objekt.etag ?? "", wiederholt: event.isRecurring() };
}

/** Prüft die Eingaben. Gibt einen Fehlertext zurück oder null. */
export function terminPruefen(d: TerminDaten) {
  if (!d.titel.trim()) return "Bitte einen Titel eingeben.";
  if (d.ganztags) {
    if (d.endeTag < d.startTag) return "Das Ende liegt vor dem Beginn.";
  } else if (berlinZuDate(d.endeTag, d.endeZeit) <= berlinZuDate(d.startTag, d.startZeit)) {
    return "Das Ende muss nach dem Beginn liegen.";
  }
  return null;
}

/** Zeiten und Texte in ein VEVENT schreiben (bestehende Angaben wie Erinnerungen bleiben erhalten). */
function eintragen(vevent: ICAL.Component, d: TerminDaten) {
  const setzen = (name: string, wert: string) => {
    if (wert.trim()) vevent.updatePropertyWithValue(name, wert.trim());
    else vevent.removeAllProperties(name);
  };
  setzen("summary", d.titel);
  setzen("location", d.ort);
  setzen("description", d.notizen);

  vevent.removeAllProperties("dtstart");
  vevent.removeAllProperties("dtend");
  vevent.removeAllProperties("duration");
  if (d.ganztags) {
    vevent.addPropertyWithValue("dtstart", ICAL.Time.fromDateString(d.startTag));
    vevent.addPropertyWithValue("dtend", ICAL.Time.fromDateString(tagPlus(d.endeTag, 1)));
  } else {
    // In UTC speichern – Apple Kalender zeigt es in der eigenen Zeitzone richtig an.
    vevent.addPropertyWithValue("dtstart", ICAL.Time.fromJSDate(berlinZuDate(d.startTag, d.startZeit), true));
    vevent.addPropertyWithValue("dtend", ICAL.Time.fromJSDate(berlinZuDate(d.endeTag, d.endeZeit), true));
  }
  const jetzt = ICAL.Time.fromJSDate(new Date(), true);
  vevent.updatePropertyWithValue("dtstamp", jetzt);
  vevent.updatePropertyWithValue("last-modified", jetzt);
  const seq = Number(vevent.getFirstPropertyValue("sequence") ?? 0);
  vevent.updatePropertyWithValue("sequence", Number.isFinite(seq) ? seq + 1 : 1);
}

function neuesIcs(d: TerminDaten, uid: string) {
  const vcal = new ICAL.Component("vcalendar");
  vcal.updatePropertyWithValue("prodid", "-//Gravaix//Cockpit//DE");
  vcal.updatePropertyWithValue("version", "2.0");
  const vevent = new ICAL.Component("vevent");
  vevent.updatePropertyWithValue("uid", uid);
  vevent.updatePropertyWithValue("created", ICAL.Time.fromJSDate(new Date(), true));
  eintragen(vevent, d);
  vcal.addSubcomponent(vevent);
  return vcal.toString();
}

export class TerminGeaendert extends Error {}

function pruefeAntwort(antwort: Response, was: string) {
  if (antwort.status === 412) throw new TerminGeaendert("Der Termin wurde inzwischen woanders geändert (z. B. am iPhone).");
  if (!antwort.ok) throw new Error(`${was} fehlgeschlagen (${antwort.status})`);
}

/** Neuen Termin anlegen. Gibt den Dateinamen zurück. */
export async function terminAnlegen(kalender: KalenderSlug, d: TerminDaten) {
  const { client, kalender: liste } = await kalenderListe();
  const cal = liste.find((k) => k.slug === kalender)?.cal;
  if (!cal) throw new Error("Diesen Kalender gibt es nicht (mehr).");
  const uid = crypto.randomUUID().toUpperCase();
  const datei = `${uid}.ics`;
  pruefeAntwort(await client.createCalendarObject({ calendar: cal, filename: datei, iCalString: neuesIcs(d, uid) }), "Anlegen");
  return datei;
}

/**
 * Bestehenden Termin ändern. `etag` sorgt dafür, dass eine Änderung vom iPhone
 * nicht unbemerkt überschrieben wird. Wechselt der Kalender, wird der Termin verschoben.
 */
export async function terminAendern(kalender: KalenderSlug, datei: string, etag: string, neuerKalender: KalenderSlug, d: TerminDaten) {
  const { client, objekt } = await objektLaden(kalender, datei);
  if (!objekt) throw new TerminGeaendert("Den Termin gibt es nicht mehr – vielleicht wurde er am iPhone gelöscht.");
  if (etag && objekt.etag && etag !== objekt.etag) {
    throw new TerminGeaendert("Der Termin wurde inzwischen woanders geändert (z. B. am iPhone).");
  }
  const vcal = new ICAL.Component(ICAL.parse(objekt.data));
  const haupt = vcal.getAllSubcomponents("vevent").find((e) => !e.hasProperty("recurrence-id"));
  if (!haupt) throw new Error("Termin ist beschädigt.");
  if (haupt.hasProperty("rrule")) throw new Error("Serientermine bitte in Apple Kalender bearbeiten.");
  eintragen(haupt, d);

  if (neuerKalender === kalender) {
    pruefeAntwort(
      await client.updateCalendarObject({ calendarObject: { url: objekt.url, data: vcal.toString(), etag: objekt.etag } }),
      "Speichern",
    );
    return datei;
  }
  // In anderen Kalender verschieben: erst neu anlegen, dann das Original entfernen.
  const neu = await terminAnlegenRoh(neuerKalender, datei, vcal.toString());
  pruefeAntwort(await client.deleteCalendarObject({ calendarObject: { url: objekt.url, etag: objekt.etag } }), "Verschieben");
  return neu;
}

async function terminAnlegenRoh(kalender: KalenderSlug, datei: string, ics: string) {
  const { client, kalender: liste } = await kalenderListe();
  const cal = liste.find((k) => k.slug === kalender)?.cal;
  if (!cal) throw new Error("Diesen Kalender gibt es nicht (mehr).");
  pruefeAntwort(await client.createCalendarObject({ calendar: cal, filename: datei, iCalString: ics }), "Verschieben");
  return datei;
}

/** Termin löschen (nur nach Rückfrage im Browser). */
export async function terminLoeschen(kalender: KalenderSlug, datei: string, etag: string) {
  const { client, objekt } = await objektLaden(kalender, datei);
  if (!objekt) return; // schon weg
  if (etag && objekt.etag && etag !== objekt.etag) {
    throw new TerminGeaendert("Der Termin wurde inzwischen woanders geändert (z. B. am iPhone). Bitte erst neu laden.");
  }
  pruefeAntwort(await client.deleteCalendarObject({ calendarObject: { url: objekt.url, etag: objekt.etag } }), "Löschen");
}
