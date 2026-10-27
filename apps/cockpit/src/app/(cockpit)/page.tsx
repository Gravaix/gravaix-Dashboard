import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, ClipboardList, Mail, TimerReset } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { terminLink } from "@/components/kalender/ansichten";
import { auftragNummer, SPALTEN } from "@/lib/auftrag/status";
import { heuteTag } from "@/lib/auftrag/steuer";
import { prisma } from "@/lib/db";
import { kalenderInfo } from "@/lib/kalender/liste";
import { termineLaden } from "@/lib/kalender/termine";
import { berlinZuDate, heute, tagName, tagPlus, zeitVon } from "@/lib/kalender/zeit";
import { adresseKurz, kurzDatum, nachrichtLink } from "@/lib/mail/format";
import { neueAnfragen } from "@/lib/mail/imap";
import { cn } from "@/lib/utils";

// Übersicht: jede Karte lädt für sich (Mails brauchen etwas länger) – die anderen
// erscheinen sofort, und fällt das Postfach oder der Kalender aus, bleibt der Rest sichtbar.

const VORSCHAU = 5;

function Karte({
  titel,
  icon: Icon,
  zahl,
  href,
  children,
}: {
  titel: string;
  icon: typeof Mail;
  zahl?: number | string;
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border bg-card p-3 md:p-4">
      <Link href={href} className="mb-2 flex items-center justify-between gap-2 hover:underline">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" />
          {titel}
        </h2>
        <span className="text-2xl font-semibold tabular-nums">{zahl ?? "–"}</span>
      </Link>
      {children}
    </section>
  );
}

function Leer({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function Laedt({ titel, icon, href }: { titel: string; icon: typeof Mail; href: string }) {
  return (
    <Karte titel={titel} icon={icon} href={href}>
      <div className="grid gap-2" aria-label="Lädt …">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </Karte>
  );
}

const zeile = "flex min-w-0 items-baseline gap-2 rounded-lg px-2 py-1.5 -mx-2 text-sm hover:bg-muted";

// ---------------------------------------------------------------------------

async function Anfragen() {
  const titel = "Neue Anfragen";
  const href = "/mails";
  let daten;
  try {
    daten = await neueAnfragen(VORSCHAU);
  } catch {
    return (
      <Karte titel={titel} icon={Mail} href={href}>
        <Leer>Postfach gerade nicht erreichbar.</Leer>
      </Karte>
    );
  }
  return (
    <Karte titel={titel} icon={Mail} zahl={daten.anzahl} href={href}>
      {daten.mails.length === 0 ? (
        <Leer>Keine ungelesenen Mails im Posteingang und in „Kunden & Anfragen“.</Leer>
      ) : (
        <ul className="grid">
          {daten.mails.map((m) => (
            <li key={`${m.pfad}-${m.uid}`}>
              <Link href={nachrichtLink(m.pfad, m.uid)} className={cn(zeile, "flex-col gap-0")}>
                <span className="flex w-full min-w-0 items-baseline justify-between gap-2">
                  <span className="truncate font-medium">{adresseKurz(m.von[0]) || "(unbekannt)"}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{kurzDatum(m.datum)}</span>
                </span>
                <span className="w-full truncate text-muted-foreground">{m.betreff}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {daten.anzahl > daten.mails.length && (
        <p className="mt-1 text-xs text-muted-foreground">und {daten.anzahl - daten.mails.length} weitere</p>
      )}
    </Karte>
  );
}

async function OffeneAuftraege() {
  const gruppen = await prisma.auftrag.groupBy({ by: ["status"], where: { status: { not: "ERLEDIGT" } }, _count: true });
  const anzahl = (status: string) => gruppen.find((g) => g.status === status)?._count ?? 0;
  const gesamt = gruppen.reduce((summe, g) => summe + g._count, 0);
  return (
    <Karte titel="Offene Aufträge" icon={ClipboardList} zahl={gesamt} href="/auftraege">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SPALTEN.filter((s) => s.status !== "ERLEDIGT").map((s) => (
          <li key={s.status}>
            <Link href="/auftraege" className="block rounded-lg bg-muted/60 px-2 py-2 text-center hover:bg-muted">
              <span className="block text-lg font-semibold tabular-nums">{anzahl(s.status)}</span>
              <span className="block truncate text-xs text-muted-foreground">{s.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Karte>
  );
}

function tagLabel(tag: string, jetzt: string) {
  if (tag <= jetzt) return "Heute";
  if (tag === tagPlus(jetzt, 1)) return "Morgen";
  return tagName(tag, { weekday: "short", day: "numeric", month: "short" });
}

async function Termine() {
  const titel = "Termine diese Woche";
  const href = "/kalender";
  const jetzt = heute();
  let termine;
  try {
    termine = await termineLaden(new Date(), berlinZuDate(tagPlus(jetzt, 7)));
  } catch {
    return (
      <Karte titel={titel} icon={CalendarDays} href={href}>
        <Leer>Kalender gerade nicht erreichbar.</Leer>
      </Karte>
    );
  }
  const heuteAnzahl = termine.filter((t) => t.startTag <= jetzt).length;
  return (
    <Karte titel={titel} icon={CalendarDays} zahl={termine.length} href={href}>
      <p className="-mt-1 mb-2 text-xs text-muted-foreground">
        {heuteAnzahl === 0 ? "Heute nichts mehr" : heuteAnzahl === 1 ? "1 Termin heute" : `${heuteAnzahl} Termine heute`}
      </p>
      {termine.length === 0 ? (
        <Leer>Keine Termine in den nächsten 7 Tagen.</Leer>
      ) : (
        <ul className="grid">
          {termine.slice(0, 8).map((t) => (
            <li key={`${t.datei}-${t.start.getTime()}`}>
              <Link href={terminLink(t)} className={zeile}>
                <span className="size-2 shrink-0 self-center rounded-full" style={{ backgroundColor: kalenderInfo(t.kalender).farbe }} aria-hidden />
                <span className="w-28 shrink-0 text-xs text-muted-foreground tabular-nums">
                  {tagLabel(t.startTag, jetzt)}
                  {!t.ganztags && t.startTag >= jetzt && ` ${zeitVon(t.start)}`}
                </span>
                <span className="truncate">{t.titel}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {termine.length > 8 && <p className="mt-1 text-xs text-muted-foreground">und {termine.length - 8} weitere</p>}
    </Karte>
  );
}

function faellig(tag: string, jetzt: string) {
  const tage = Math.round((Date.parse(`${tag}T00:00:00Z`) - Date.parse(`${jetzt}T00:00:00Z`)) / 86_400_000);
  if (tage < 0) return { text: tage === -1 ? "seit gestern" : `seit ${-tage} Tagen`, klasse: "text-destructive font-medium" };
  if (tage === 0) return { text: "heute", klasse: "text-brand font-medium" };
  if (tage === 1) return { text: "morgen", klasse: "text-foreground" };
  return { text: `in ${tage} Tagen`, klasse: "text-muted-foreground" };
}

async function Deadlines() {
  const jetzt = heuteTag();
  const auftraege = await prisma.auftrag.findMany({
    where: { status: { not: "ERLEDIGT" }, deadline: { lte: new Date(`${tagPlus(jetzt, 7)}T00:00:00Z`) } },
    orderBy: [{ deadline: "asc" }, { id: "asc" }],
    select: { id: true, titel: true, kunde: true, deadline: true },
  });
  const ueberfaellig = auftraege.filter((a) => a.deadline!.toISOString().slice(0, 10) < jetzt).length;
  return (
    <Karte titel="Fällige Deadlines" icon={TimerReset} zahl={auftraege.length} href="/auftraege">
      <p className={cn("-mt-1 mb-2 text-xs", ueberfaellig ? "font-medium text-destructive" : "text-muted-foreground")}>
        {ueberfaellig ? `${ueberfaellig} überfällig` : "Nichts überfällig"} · nächste 7 Tage
      </p>
      {auftraege.length === 0 ? (
        <Leer>Keine Deadlines in den nächsten 7 Tagen.</Leer>
      ) : (
        <ul className="grid">
          {auftraege.slice(0, 8).map((a) => {
            const f = faellig(a.deadline!.toISOString().slice(0, 10), jetzt);
            return (
              <li key={a.id}>
                <Link href={`/auftraege/${a.id}`} className={zeile}>
                  <span className={cn("w-24 shrink-0 text-xs tabular-nums", f.klasse)}>{f.text}</span>
                  <span className="min-w-0 truncate">
                    <span className="text-xs text-muted-foreground tabular-nums">{auftragNummer(a.id)}</span> {a.titel}
                    <span className="hidden text-muted-foreground sm:inline"> · {a.kunde}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {auftraege.length > 8 && <p className="mt-1 text-xs text-muted-foreground">und {auftraege.length - 8} weitere</p>}
    </Karte>
  );
}

export default function UebersichtPage() {
  return (
    <>
      <PageHeader title="Übersicht" description={tagName(heute(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
      <div className="grid gap-3 md:grid-cols-2">
        <Suspense fallback={<Laedt titel="Neue Anfragen" icon={Mail} href="/mails" />}>
          <Anfragen />
        </Suspense>
        <Suspense fallback={<Laedt titel="Fällige Deadlines" icon={TimerReset} href="/auftraege" />}>
          <Deadlines />
        </Suspense>
        <Suspense fallback={<Laedt titel="Termine diese Woche" icon={CalendarDays} href="/kalender" />}>
          <Termine />
        </Suspense>
        <Suspense fallback={<Laedt titel="Offene Aufträge" icon={ClipboardList} href="/auftraege" />}>
          <OffeneAuftraege />
        </Suspense>
      </div>
    </>
  );
}
