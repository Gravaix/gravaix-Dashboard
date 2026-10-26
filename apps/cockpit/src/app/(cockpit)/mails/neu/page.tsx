import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MailFehler } from "@/components/mail/mail-fehler";
import { VerlaufListe } from "@/components/mail/verlauf-liste";
import { MailFormular, type Vorlage } from "@/components/mail/mail-formular";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { adresseLang, langDatum, mailLink, nachrichtLink } from "@/lib/mail/format";
import { mailLesen, verlauf, type Adresse } from "@/lib/mail/imap";

export const metadata: Metadata = { title: "Neue Mail" };

/** Empfänger ohne doppelte und ohne die eigene Adresse. */
function empfaenger(liste: Adresse[]) {
  const eigene = (process.env.MAIL_USER ?? "").toLowerCase();
  const gesehen = new Set<string>();
  return liste
    .filter((a) => {
      const adr = a.adresse?.toLowerCase();
      if (!adr || adr === eigene || gesehen.has(adr)) return false;
      gesehen.add(adr);
      return true;
    })
    .map(adresseLang)
    .join(", ");
}

export default async function NeueMailPage({ searchParams }: PageProps<"/mails/neu">) {
  const params = await searchParams;
  const pfad = typeof params.ordner === "string" ? params.ordner : "";
  const uid = Number(params.uid);
  const allen = params.art === "allen";

  // Neue Mail ohne Bezug
  if (!pfad || !uid) {
    return (
      <>
        <PageHeader title="Neue Mail" />
        <MailFormular vorlage={{ an: "", cc: "", betreff: "", text: "" }} />
      </>
    );
  }

  if (!Number.isInteger(uid) || uid < 1) notFound();
  let mail, gespraech;
  try {
    // Verlauf ist eine Zugabe: klappt die Suche nicht, wird die Mail trotzdem angezeigt.
    [mail, gespraech] = await Promise.all([mailLesen(pfad, uid), verlauf(pfad, uid).catch(() => [])]);
  } catch (fehler) {
    return <MailFehler fehler={fehler} />;
  }
  if (!mail) notFound();

  const absender = mail.antwortAn.length ? mail.antwortAn : mail.von;
  const zitat = (mail.text ?? "").trimEnd().split("\n").map((z) => `> ${z}`).join("\n");
  const vorlage: Vorlage = {
    ordner: pfad,
    uid,
    an: empfaenger(allen ? [...absender, ...mail.an] : absender),
    cc: allen ? empfaenger(mail.cc.filter((c) => !absender.some((a) => a.adresse === c.adresse))) : "",
    betreff: /^(re|aw):/i.test(mail.betreff) ? mail.betreff : `Re: ${mail.betreff}`,
    text: `\n\nAm ${langDatum(mail.datum)} schrieb ${adresseLang(mail.von[0] ?? {})}:\n${zitat}\n`,
  };

  return (
    <>
      <div className="mb-2">
        <Button variant="ghost" size="sm" render={<Link href={nachrichtLink(pfad, uid)} />}>
          <ArrowLeft />
          Zurück zur Mail
        </Button>
      </div>
      <PageHeader title={allen ? "Allen antworten" : "Antworten"} />
      <MailFormular vorlage={vorlage} />
      <div className="mt-8">
        <VerlaufListe eintraege={gespraech} aktuell={{ pfad, uid }} titel="Worum es geht" />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Die Antwort landet auch im Ordner „Gesendet“ und die ursprüngliche Mail wird als beantwortet markiert.{" "}
        <Link href={mailLink(pfad)} className="underline">
          Zur Liste
        </Link>
      </p>
    </>
  );
}
