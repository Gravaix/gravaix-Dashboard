import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MailFehler } from "@/components/mail/mail-fehler";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { nachrichtLink } from "@/lib/mail/format";
import { mailFinden } from "@/lib/mail/imap";

export const metadata: Metadata = { title: "Mail suchen" };

/**
 * Öffnet eine Mail anhand ihrer Kennung (Message-ID) – auch wenn sie inzwischen in einem
 * anderen Ordner liegt. Wird z. B. von Terminen verlinkt, die aus einer Mail entstanden sind.
 */
export default async function MailFindenPage({ searchParams }: PageProps<"/mails/finden">) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id.slice(0, 998) : "";
  if (!id) notFound();
  const uid = Number(params.uid);
  const tipp = typeof params.ordner === "string" && Number.isInteger(uid) && uid > 0 ? { pfad: params.ordner, uid } : undefined;

  let ort;
  try {
    ort = await mailFinden(id, tipp);
  } catch (fehler) {
    return <MailFehler fehler={fehler} />;
  }
  if (ort) redirect(nachrichtLink(ort.pfad, ort.uid));

  return (
    <>
      <PageHeader title="Mail nicht gefunden" />
      <p className="mb-4 max-w-xl text-sm text-muted-foreground">
        Die Mail liegt in keinem Ordner des Postfachs mehr – vielleicht wurde sie in Outlook oder am iPhone gelöscht.
      </p>
      <Button variant="outline" nativeButton={false} render={<Link href="/mails" />}>
        Zu den Mails
      </Button>
    </>
  );
}
