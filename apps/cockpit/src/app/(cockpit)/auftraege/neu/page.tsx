import type { Metadata } from "next";
import { auftragAnlegen } from "@/app/(cockpit)/auftraege/actions";
import { AuftragFormular } from "@/components/auftrag/auftrag-formular";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Neuer Auftrag" };

export default function NeuerAuftragPage() {
  return (
    <>
      <PageHeader title="Neuer Auftrag" />
      <AuftragFormular
        aktion={auftragAnlegen}
        knopf="Auftrag anlegen"
        werte={{
          titel: "",
          kunde: "",
          kundeEmail: "",
          produkt: "",
          menge: "",
          gravur: "",
          preis: "",
          deadline: "",
          status: "ANFRAGE",
          notizen: "",
        }}
      />
    </>
  );
}
