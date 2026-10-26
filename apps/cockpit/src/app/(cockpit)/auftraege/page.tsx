import type { Metadata } from "next";
import { ComingSoon, PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Aufträge" };

export default function AuftraegePage() {
  return (
    <>
      <PageHeader title="Aufträge" description="Das Auftragsboard von der Anfrage bis zum Versand." />
      <ComingSoon>Kommt in Schritt 1.3: Kanban-Board Anfrage → Angebot → Produktion → Versand → Erledigt.</ComingSoon>
    </>
  );
}
