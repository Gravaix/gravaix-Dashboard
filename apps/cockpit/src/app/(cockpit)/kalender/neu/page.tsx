import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { ansichtLink } from "@/components/kalender/ansichten";
import { TerminFormular, type TerminWerte } from "@/components/kalender/termin-formular";
import { MailFehler } from "@/components/mail/mail-fehler";
import { PageHeader } from "@/components/page-header";
import { adresseKurz, langDatum, nachrichtLink } from "@/lib/mail/format";
import { mailLesen, vorschau } from "@/lib/mail/imap";
import { istKalender, type TerminMail } from "@/lib/kalender/termine";
import { heute, istTag } from "@/lib/kalender/zeit";

export const metadata: Metadata = { title: "Neuer Termin" };

export default async function NeuerTerminPage({ searchParams }: PageProps<"/kalender/neu">) {
  const params = await searchParams;
  const datum = istTag(params.datum) ? params.datum : heute();
  const kalender = istKalender(params.kal) ? params.kal : "termine";
  const werte: TerminWerte = { kalender, titel: "", ort: "", notizen: "", ganztags: false, startTag: datum, startZeit: "10:00", endeTag: datum, endeZeit: "11:00" };
  const pfad = typeof params.ordner === "string" ? params.ordner : "";

  if (!pfad) {
    return (
      <>
        <PageHeader title="Neuer Termin" description="Erscheint auch in Apple Kalender auf iPhone und Mac." />
        <TerminFormular zurueck={ansichtLink("woche", datum)} werte={werte} />
      </>
    );
  }

  // Aus einer Mail: Titel und Notizen vorausfüllen, Datum und Uhrzeit wählt Celiano selbst.
  const uid = Number(params.uid);
  if (!Number.isInteger(uid) || uid < 1) notFound();
  let mail;
  try {
    mail = await mailLesen(pfad, uid);
  } catch (fehler) {
    return <MailFehler fehler={fehler} />;
  }
  if (!mail) notFound();

  const von = mail.von.map(adresseKurz).join(", ");
  const titel = mail.betreff.replace(/^(\s*(re|aw|wg|fw|fwd)\s*:\s*)+/i, "").slice(0, 200);
  const terminMail: TerminMail | undefined = mail.messageId ? { messageId: mail.messageId, ordner: pfad, uid } : undefined;

  return (
    <>
      <PageHeader title="Neuer Termin aus Mail" description="Bitte Datum und Uhrzeit prüfen – sie stehen meist im Mailtext." />
      <Link
        href={nachrichtLink(pfad, uid)}
        className="mb-4 flex max-w-xl items-start gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
      >
        <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0">
          <span className="block truncate font-medium">{mail.betreff || "(ohne Betreff)"}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {von} · {langDatum(mail.datum)}
          </span>
        </span>
      </Link>
      <TerminFormular
        zurueck={nachrichtLink(pfad, uid)}
        mail={terminMail}
        werte={{
          ...werte,
          titel,
          notizen: `Aus Mail von ${von} vom ${langDatum(mail.datum)}:\n\n${vorschau(mail.text ?? "", 1500)}`.trim(),
        }}
      />
    </>
  );
}
