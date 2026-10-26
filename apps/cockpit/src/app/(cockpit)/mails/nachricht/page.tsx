import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff, Paperclip, Reply, ReplyAll } from "lucide-react";
import { MailFehler } from "@/components/mail/mail-fehler";
import { GelesenKnopf } from "@/components/mail/gelesen-knopf";
import { GesendetHinweis } from "@/components/mail/gesendet-hinweis";
import { MailFrame } from "@/components/mail/mail-frame";
import { Button } from "@/components/ui/button";
import { adresseLang, groesse, langDatum, mailLink, nachrichtLink } from "@/lib/mail/format";
import { mailLesen } from "@/lib/mail/imap";

export const metadata: Metadata = { title: "Mail" };

function Zeile({ label, wert }: { label: string; wert: string }) {
  if (!wert) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-12 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{wert}</dd>
    </div>
  );
}

export default async function NachrichtPage({ searchParams }: PageProps<"/mails/nachricht">) {
  const params = await searchParams;
  const pfad = typeof params.ordner === "string" ? params.ordner : "INBOX";
  const uid = Number(params.uid);
  const bilder = params.bilder === "1";
  const suche = typeof params.suche === "string" ? params.suche : "";
  if (!Number.isInteger(uid) || uid < 1) notFound();

  let mail;
  try {
    mail = await mailLesen(pfad, uid);
  } catch (fehler) {
    return <MailFehler fehler={fehler} />;
  }
  if (!mail) notFound();

  const hatBilder = !!mail.html && /<img\b[^>]*\bsrc\s*=\s*["']?https?:/i.test(mail.html);

  return (
    <article className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" render={<Link href={mailLink(pfad, suche ? { suche } : {})} />}>
          <ArrowLeft />
          Zurück
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" render={<Link href={`/mails/neu?${new URLSearchParams({ ordner: pfad, uid: String(uid) })}`} />}>
            <Reply />
            Antworten
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/mails/neu?${new URLSearchParams({ ordner: pfad, uid: String(uid), art: "allen" })}`} />}
          >
            <ReplyAll />
            Allen antworten
          </Button>
          <GelesenKnopf key={uid} pfad={pfad} uid={uid} gelesen={mail.gelesen} />
        </div>
      </div>
      <GesendetHinweis wert={params.gesendet} />

      <header className="grid gap-3">
        <h1 className="text-xl font-semibold tracking-tight break-words">{mail.betreff}</h1>
        <dl className="grid gap-1 text-sm">
          <Zeile label="Von" wert={mail.von.map(adresseLang).join(", ")} />
          <Zeile label="An" wert={mail.an.map(adresseLang).join(", ")} />
          <Zeile label="Cc" wert={mail.cc.map(adresseLang).join(", ")} />
          <Zeile label="Datum" wert={langDatum(mail.datum)} />
        </dl>
      </header>

      {mail.anhaenge.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {mail.anhaenge.map((a) => (
            <li key={a.nr}>
              <a
                href={`/api/mail/anhang?${new URLSearchParams({ ordner: pfad, uid: String(uid), nr: String(a.nr) })}`}
                target="_blank"
                rel="noopener"
                className="flex max-w-72 items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{a.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{groesse(a.groesse)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {hatBilder && !bilder && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <ImageOff className="size-4" />
            Bilder von außen sind blockiert (Schutz vor Tracking).
          </span>
          <Button variant="outline" size="sm" render={<Link href={nachrichtLink(pfad, uid, { bilder: "1", ...(suche ? { suche } : {}) })} />}>
            Bilder laden
          </Button>
        </div>
      )}

      {mail.html ? (
        <MailFrame html={mail.html} bilderErlaubt={bilder} />
      ) : (
        <div className="rounded-lg border p-4 text-sm whitespace-pre-wrap break-words">{mail.text || "(leer)"}</div>
      )}
    </article>
  );
}
