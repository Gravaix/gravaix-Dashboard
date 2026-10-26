import type { Metadata } from "next";
import { ComingSoon, PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Kalender" };

export default function KalenderPage() {
  return (
    <>
      <PageHeader title="Kalender" description="Aufträge, Termine und Privates – synchron mit iPhone und Mac." />
      <ComingSoon>Kommt in Schritt 1.4: Kalender über cal.gravaix.de, Sync mit Apple Kalender.</ComingSoon>
    </>
  );
}
