import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auftragAnlegen } from "@/app/(cockpit)/auftraege/actions";
import { AuftragFormular, type AuftragMail, type AuftragWerte } from "@/components/auftrag/auftrag-formular";
import { MailFehler } from "@/components/mail/mail-fehler";
import { PageHeader } from "@/components/page-header";
import { auftragNummer } from "@/lib/auftrag/status";
import { prisma } from "@/lib/db";
import { langDatum } from "@/lib/mail/format";
import { mailLesen, vorschau } from "@/lib/mail/imap";

export const metadata: Metadata = { title: "Neuer Auftrag" };

const LEER: AuftragWerte = {
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
};

export default async function NeuerAuftragPage({ searchParams }: PageProps<"/auftraege/neu">) {
  const params = await searchParams;
  const pfad = typeof params.ordner === "string" ? params.ordner : "";
  const uid = Number(params.uid);

  // Neuer Auftrag ohne Mail
  if (!pfad) {
    return (
      <>
        <PageHeader title="Neuer Auftrag" />
        <AuftragFormular aktion={auftragAnlegen} knopf="Auftrag anlegen" werte={LEER} />
      </>
    );
  }

  // Aus einer Mail: Formular mit Absender, Betreff und Text vorausfüllen
  if (!Number.isInteger(uid) || uid < 1) notFound();
  let mail;
  try {
    mail = await mailLesen(pfad, uid);
  } catch (fehler) {
    return <MailFehler fehler={fehler} />;
  }
  if (!mail) notFound();

  // Bei eigenen Mails (z. B. aus „Gesendet“) ist der Kunde der Empfänger.
  const eigene = (process.env.MAIL_USER ?? "").toLowerCase();
  const vonMir = mail.von.some((a) => a.adresse?.toLowerCase() === eigene);
  const kunde = (vonMir ? mail.an : mail.antwortAn.length ? mail.antwortAn : mail.von)[0] ?? {};
  const text = vorschau(mail.text ?? "", 3000);
  const vorhanden = mail.messageId
    ? await prisma.auftrag.findMany({ where: { mailMessageId: mail.messageId }, select: { id: true, titel: true } })
    : [];

  const werte: AuftragWerte = {
    ...LEER,
    titel: mail.betreff.replace(/^(\s*(re|aw|wg|fw|fwd)\s*:\s*)+/i, "").slice(0, 200),
    kunde: kunde.name || kunde.adresse || "",
    kundeEmail: kunde.adresse ?? "",
    notizen: `Aus Mail vom ${langDatum(mail.datum)}:\n\n${text}`.trim(),
  };
  const auftragMail: AuftragMail = { ordner: pfad, uid, betreff: mail.betreff, anhaenge: mail.anhaenge };

  return (
    <>
      <PageHeader title="Neuer Auftrag aus Mail" description="Bitte kurz prüfen und ergänzen – Produkt, Menge und Preis stehen meist im Text." />
      {vorhanden.length > 0 && (
        <p className="mb-4 max-w-2xl rounded-lg border border-brand/40 px-3 py-2 text-sm">
          Zu dieser Mail gibt es schon:{" "}
          {vorhanden.map((a, i) => (
            <span key={a.id}>
              {i > 0 && ", "}
              <Link href={`/auftraege/${a.id}`} className="underline underline-offset-2">
                {auftragNummer(a.id)} · {a.titel}
              </Link>
            </span>
          ))}
        </p>
      )}
      <AuftragFormular aktion={auftragAnlegen} knopf="Auftrag anlegen" werte={werte} mail={auftragMail} />
    </>
  );
}
