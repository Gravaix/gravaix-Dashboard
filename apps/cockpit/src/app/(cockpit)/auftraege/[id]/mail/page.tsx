import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MailFehler } from "@/components/mail/mail-fehler";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { auftragNummer } from "@/lib/auftrag/status";
import { prisma } from "@/lib/db";
import { nachrichtLink } from "@/lib/mail/format";
import { mailFinden } from "@/lib/mail/imap";

export const metadata: Metadata = { title: "Verknüpfte Mail" };

/** Öffnet die mit dem Auftrag verknüpfte Mail – auch wenn sie inzwischen in einem anderen Ordner liegt. */
export default async function AuftragMailPage({ params }: PageProps<"/auftraege/[id]/mail">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const a = await prisma.auftrag.findUnique({
    where: { id },
    select: { mailMessageId: true, mailOrdner: true, mailUid: true },
  });
  if (!a?.mailMessageId) notFound();

  let ort;
  try {
    const tipp = a.mailOrdner && a.mailUid ? { pfad: a.mailOrdner, uid: a.mailUid } : undefined;
    ort = await mailFinden(a.mailMessageId, tipp);
  } catch (fehler) {
    return <MailFehler fehler={fehler} />;
  }

  if (ort) {
    // Neuen Ort merken, damit es beim nächsten Mal schneller geht.
    if (ort.pfad !== a.mailOrdner || ort.uid !== a.mailUid) {
      await prisma.auftrag.update({ where: { id }, data: { mailOrdner: ort.pfad, mailUid: ort.uid } });
    }
    redirect(nachrichtLink(ort.pfad, ort.uid));
  }

  return (
    <>
      <PageHeader title="Mail nicht gefunden" />
      <p className="mb-4 max-w-xl text-sm text-muted-foreground">
        Die Mail zu {auftragNummer(id)} liegt in keinem Ordner des Postfachs mehr – vielleicht wurde sie in Outlook oder am
        iPhone gelöscht. Der Auftrag selbst ist davon nicht betroffen.
      </p>
      <Button variant="outline" render={<Link href={`/auftraege/${id}`} />}>
        Zurück zum Auftrag
      </Button>
    </>
  );
}
