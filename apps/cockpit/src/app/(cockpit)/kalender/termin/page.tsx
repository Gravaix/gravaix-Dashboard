import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Mail, Repeat } from "lucide-react";
import { ansichtLink } from "@/components/kalender/ansichten";
import { KalenderFehler } from "@/components/kalender/kalender-fehler";
import { TerminFormular } from "@/components/kalender/termin-formular";
import { TerminLoeschen } from "@/components/kalender/termin-loeschen";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { deadlineAuftrag } from "@/lib/kalender/deadlines";
import { kalenderInfo } from "@/lib/kalender/liste";
import { istDatei, istKalender, terminLesen } from "@/lib/kalender/termine";
import { tagName } from "@/lib/kalender/zeit";

export const metadata: Metadata = { title: "Termin" };

export default async function TerminPage({ searchParams }: PageProps<"/kalender/termin">) {
  const params = await searchParams;
  if (!istKalender(params.kal) || !istDatei(params.datei)) notFound();
  const kalender = params.kal;
  const datei = params.datei;
  // Deadlines gehören zum Auftrag und werden dort geändert.
  const auftragId = deadlineAuftrag(datei);
  if (auftragId !== null) redirect(`/auftraege/${auftragId}`);

  let termin;
  try {
    termin = await terminLesen(kalender, datei);
  } catch (fehler) {
    return <KalenderFehler fehler={fehler} />;
  }
  if (!termin) notFound();
  const { daten, etag, wiederholt, mail } = termin;
  const zurueck = ansichtLink("woche", daten.startTag);
  const mailKnopf = mail && (
    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={mail} />}>
      <Mail />
      Mail öffnen
    </Button>
  );

  // Serien (z. B. „jeden Donnerstag“) kommen aus Apple Kalender – dort bearbeiten.
  if (wiederholt) {
    return (
      <>
        <PageHeader title={daten.titel || "(ohne Titel)"} description={kalenderInfo(kalender).name} />
        <div className="grid max-w-xl gap-3 text-sm">
          <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2">
            <Repeat className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            Das ist ein Serientermin. Serien bitte in Apple Kalender auf iPhone oder Mac ändern.
          </p>
          <p>
            Beginn der Serie: {tagName(daten.startTag, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {!daten.ganztags && `, ${daten.startZeit}–${daten.endeZeit} Uhr`}
          </p>
          {daten.ort && <p>Ort: {daten.ort}</p>}
          {daten.notizen && <p className="whitespace-pre-wrap">{daten.notizen}</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={zurueck} />}>
              Zurück zum Kalender
            </Button>
            {mailKnopf}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Termin bearbeiten" description="Änderungen erscheinen auch in Apple Kalender auf iPhone und Mac." />
      {mailKnopf && <div className="mb-4">{mailKnopf}</div>}
      <TerminFormular zurueck={zurueck} alt={{ kalender, datei, etag }} werte={{ kalender, ...daten }} />
      <div className="mt-8 border-t pt-4">
        <TerminLoeschen kalender={kalender} datei={datei} etag={etag} datum={daten.startTag} titel={daten.titel} />
      </div>
    </>
  );
}
