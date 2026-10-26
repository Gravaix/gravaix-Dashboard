import type { Metadata } from "next";
import { ComingSoon, PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Mails" };

export default function MailsPage() {
  return (
    <>
      <PageHeader title="Mails" description="Hier erscheint dein IONOS-Postfach info@gravaix.de mit allen Ordnern." />
      <ComingSoon>Kommt in Schritt 1.2: Postfach anbinden, Mails lesen, suchen und beantworten.</ComingSoon>
    </>
  );
}
