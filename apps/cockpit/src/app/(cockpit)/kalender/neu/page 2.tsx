import type { Metadata } from "next";
import { ansichtLink } from "@/components/kalender/ansichten";
import { TerminFormular } from "@/components/kalender/termin-formular";
import { PageHeader } from "@/components/page-header";
import { istKalender } from "@/lib/kalender/termine";
import { heute, istTag } from "@/lib/kalender/zeit";

export const metadata: Metadata = { title: "Neuer Termin" };

export default async function NeuerTerminPage({ searchParams }: PageProps<"/kalender/neu">) {
  const params = await searchParams;
  const datum = istTag(params.datum) ? params.datum : heute();
  const kalender = istKalender(params.kal) ? params.kal : "termine";
  return (
    <>
      <PageHeader title="Neuer Termin" description="Erscheint auch in Apple Kalender auf iPhone und Mac." />
      <TerminFormular
        zurueck={ansichtLink("woche", datum)}
        werte={{ kalender, titel: "", ort: "", notizen: "", ganztags: false, startTag: datum, startZeit: "10:00", endeTag: datum, endeZeit: "11:00" }}
      />
    </>
  );
}
