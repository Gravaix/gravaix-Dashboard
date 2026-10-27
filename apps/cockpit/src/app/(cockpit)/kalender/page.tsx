import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight, Plus, Smartphone } from "lucide-react";
import { kalenderAnlegen } from "@/app/(cockpit)/kalender/actions";
import { MonatAnsicht, TagAnsicht, WocheAnsicht, ansichtLink, neuLink } from "@/components/kalender/ansichten";
import { KalenderFehler } from "@/components/kalender/kalender-fehler";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { kalenderStand } from "@/lib/kalender/caldav";
import { KALENDER } from "@/lib/kalender/liste";
import { termineLaden } from "@/lib/kalender/termine";
import { berlinZuDate, heute, istTag, monatPlus, monatsStart, tagName, tagPlus, wochenStart } from "@/lib/kalender/zeit";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Kalender" };

const ANSICHTEN = [
  { wert: "monat", name: "Monat" },
  { wert: "woche", name: "Woche" },
  { wert: "tag", name: "Tag" },
] as const;
type Ansicht = (typeof ANSICHTEN)[number]["wert"];

/** Sichtbare Tage, Titel und Vor/Zurück-Ziele je Ansicht. */
function zeitraum(ansicht: Ansicht, datum: string) {
  if (ansicht === "monat") {
    const erster = monatsStart(datum);
    const von = wochenStart(erster);
    const bis = tagPlus(wochenStart(tagPlus(monatPlus(erster, 1), -1)), 7);
    return {
      von,
      bis,
      titel: tagName(erster, { month: "long", year: "numeric" }),
      zurueck: monatPlus(erster, -1),
      vor: monatPlus(erster, 1),
    };
  }
  if (ansicht === "woche") {
    const von = wochenStart(datum);
    const bis = tagPlus(von, 7);
    const letzter = tagPlus(von, 6);
    return {
      von,
      bis,
      titel: `${tagName(von, { day: "numeric", month: "short" })} – ${tagName(letzter, { day: "numeric", month: "short", year: "numeric" })}`,
      zurueck: tagPlus(von, -7),
      vor: tagPlus(von, 7),
    };
  }
  return {
    von: datum,
    bis: tagPlus(datum, 1),
    titel: tagName(datum, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    zurueck: tagPlus(datum, -1),
    vor: tagPlus(datum, 1),
  };
}

export default async function KalenderPage({ searchParams }: PageProps<"/kalender">) {
  const params = await searchParams;
  const ansicht: Ansicht = ANSICHTEN.some((a) => a.wert === params.ansicht) ? (params.ansicht as Ansicht) : "woche";
  const datum = istTag(params.datum) ? params.datum : heute();
  const z = zeitraum(ansicht, datum);
  const tage: string[] = [];
  for (let t = z.von; t < z.bis; t = tagPlus(t, 1)) tage.push(t);

  let kalender, termine;
  try {
    [kalender, termine] = await Promise.all([kalenderStand(), termineLaden(berlinZuDate(z.von), berlinZuDate(z.bis))]);
  } catch (fehler) {
    return (
      <>
        <PageHeader title="Kalender" />
        <KalenderFehler fehler={fehler} />
      </>
    );
  }
  const fehlen = kalender.filter((k) => !k.vorhanden);
  const angelegt = Number(params.angelegt);

  return (
    <>
      {fehlen.length > 0 && (
        <form action={kalenderAnlegen} className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand/40 p-3 text-sm">
          <span>
            Noch nicht eingerichtet: {fehlen.map((k) => k.name).join(", ")}. Erst danach lassen sich dort Termine eintragen.
          </span>
          <Button type="submit" size="sm">
            <CalendarPlus />
            {fehlen.length === 1 ? `„${fehlen[0].name}“ anlegen` : `${fehlen.length} Kalender anlegen`}
          </Button>
        </form>
      )}
      {angelegt > 0 && (
        <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">{angelegt === 1 ? "1 Kalender" : `${angelegt} Kalender`} angelegt.</p>
      )}
      {params.geloescht === "1" && <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">Termin gelöscht.</p>}
      {typeof params.fehler === "string" && (
        <p role="alert" className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {params.fehler}
        </p>
      )}

      <header className="mb-4 grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{z.titel}</h1>
          <Button size="sm" nativeButton={false} render={<Link href={neuLink(ansicht === "tag" ? datum : heute())} />}>
            <Plus />
            Neuer Termin
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" aria-label="Zurück" nativeButton={false} render={<Link href={ansichtLink(ansicht, z.zurueck)} />}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={ansichtLink(ansicht, heute())} />}>
              Heute
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Weiter" nativeButton={false} render={<Link href={ansichtLink(ansicht, z.vor)} />}>
              <ChevronRight />
            </Button>
          </div>
          <nav className="flex rounded-lg border p-0.5 text-sm" aria-label="Ansicht">
            {ANSICHTEN.map((a) => (
              <Link
                key={a.wert}
                href={ansichtLink(a.wert, datum)}
                aria-current={a.wert === ansicht ? "page" : undefined}
                className={cn("rounded-md px-3 py-1", a.wert === ansicht ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}
              >
                {a.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {ansicht === "monat" && <MonatAnsicht termine={termine} tage={tage} monat={datum} />}
      {ansicht === "woche" && <WocheAnsicht termine={termine} tage={tage} />}
      {ansicht === "tag" && <TagAnsicht termine={termine} tag={datum} />}

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {KALENDER.map((k) => (
          <li key={k.slug} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: k.farbe }} aria-hidden />
            {k.name}
          </li>
        ))}
      </ul>

      <details className="mt-6 max-w-xl rounded-xl border p-3 text-sm">
        <summary className="flex cursor-pointer items-center gap-2 font-medium">
          <Smartphone className="size-4 text-muted-foreground" />
          Auf iPhone und Mac einrichten
        </summary>
        <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-1">
          <dt className="text-muted-foreground">Accounttyp</dt>
          <dd>CalDAV (bei „Andere“)</dd>
          <dt className="text-muted-foreground">Server</dt>
          <dd className="font-mono">cal.gravaix.de</dd>
          <dt className="text-muted-foreground">Benutzername</dt>
          <dd className="font-mono">celiano</dd>
          <dt className="text-muted-foreground">Passwort</dt>
          <dd>Kalender-Passwort aus dem Passwort-Manager</dd>
        </dl>
        <p className="mt-3 text-muted-foreground">
          iPhone: Einstellungen → Apps → Kalender → Kalender-Accounts → Account hinzufügen → Andere. Mac: App Kalender →
          Kalender → Account hinzufügen → Anderer CalDAV-Account (Manuell). Ausführlich in <code>docs/kalender.md</code>.
        </p>
      </details>
    </>
  );
}
