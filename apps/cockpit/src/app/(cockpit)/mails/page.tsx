import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Info, Paperclip, PenLine, Reply, Search, X } from "lucide-react";
import { GesendetHinweis } from "@/components/mail/gesendet-hinweis";
import { MailFehler } from "@/components/mail/mail-fehler";
import { VerschobenHinweis } from "@/components/mail/verschoben-hinweis";
import { OrdnerAuswahl } from "@/components/mail/ordner-auswahl";
import { OrdnerListe } from "@/components/mail/ordner-liste";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adresseKurz, kurzDatum, mailLink, nachrichtLink } from "@/lib/mail/format";
import { mailListe, ordnerListe } from "@/lib/mail/imap";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mails" };

export default async function MailsPage({ searchParams }: PageProps<"/mails">) {
  const params = await searchParams;
  const pfad = typeof params.ordner === "string" ? params.ordner : "INBOX";
  const seite = Math.max(1, Number(params.seite) || 1);
  const suche = typeof params.suche === "string" ? params.suche.trim().slice(0, 200) : "";
  const extra: Record<string, string> = suche ? { suche } : {};

  let daten;
  try {
    const [ordner, liste] = await Promise.all([ordnerListe(), mailListe(pfad, seite, suche)]);
    daten = { ordner, ...liste };
  } catch (fehler) {
    return (
      <>
        <PageHeader title="Mails" />
        <MailFehler fehler={fehler} />
      </>
    );
  }

  const { ordner, mails, seiten, gesamt } = daten;
  const aktuell = ordner.find((o) => o.pfad === pfad);

  return (
    <>
      <PageHeader
        title="Mails"
        description={`${aktuell?.name ?? pfad} · ${suche ? `${gesamt} Treffer für „${suche}“` : `${gesamt} Mails`}`}
      />
      <div className="mb-4 md:hidden">
        <OrdnerAuswahl ordner={ordner} aktiv={pfad} />
      </div>
      <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
        <aside className="hidden md:block">
          <OrdnerListe ordner={ordner} aktiv={pfad} />
        </aside>
        <section className="min-w-0">
          <GesendetHinweis wert={params.gesendet} />
          <VerschobenHinweis ordner={ordner} ziel={params.verschoben} von={params.von} neu={params.neu} />
          <form action="/mails" role="search" className="mb-4 flex gap-2">
            <input type="hidden" name="ordner" value={pfad} />
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                key={`${pfad}|${suche}`}
                type="search"
                name="suche"
                defaultValue={suche}
                placeholder={`In „${aktuell?.name ?? pfad}“ suchen …`}
                aria-label="Mails suchen"
                className="h-10 pl-8"
              />
            </div>
            <Button type="submit" variant="outline" className="h-10">
              Suchen
            </Button>
            {suche && (
              <Button variant="ghost" className="h-10" aria-label="Suche aufheben" render={<Link href={mailLink(pfad)} />}>
                <X />
              </Button>
            )}
            <Button className="h-10" aria-label="Neue Mail" render={<Link href="/mails/neu" />}>
              <PenLine />
              <span className="hidden sm:inline">Neue Mail</span>
            </Button>
          </form>
          {mails.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              {suche ? "Keine passenden Mails in diesem Ordner." : "Keine Mails in diesem Ordner."}
            </p>
          ) : (
            <ul className="divide-y overflow-hidden rounded-xl border">
              {mails.map((m) => (
                <li key={m.uid}>
                  <Link
                    href={nachrichtLink(pfad, m.uid, extra)}
                    className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-4 py-3 hover:bg-muted/60"
                  >
                    <span className={cn("flex min-w-0 items-center gap-2 truncate text-sm", !m.gelesen && "font-semibold")}>
                      {!m.gelesen && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="ungelesen" />}
                      <span className="truncate">{adresseKurz(aktuell?.spezial === "\\Sent" ? m.an[0] : m.von[0]) || "(unbekannt)"}</span>
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">{kurzDatum(m.datum)}</span>
                    <span className={cn("truncate text-sm", m.gelesen ? "text-muted-foreground" : "text-foreground")}>
                      {m.betreff}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {m.beantwortet && <Reply className="size-3.5" aria-label="beantwortet" />}
                      {m.markiert && <Flag className="size-3.5 text-brand" aria-label="markiert" />}
                      {m.hatAnhang && <Paperclip className="size-3.5" aria-label="mit Anhang" />}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {seiten > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              {seite > 1 ? (
                <Button variant="outline" size="sm" render={<Link href={mailLink(pfad, { ...extra, seite: seite - 1 })} />}>
                  Neuere
                </Button>
              ) : (
                <span />
              )}
              <span>
                Seite {seite} von {seiten}
              </span>
              {seite < seiten ? (
                <Button variant="outline" size="sm" render={<Link href={mailLink(pfad, { ...extra, seite: seite + 1 })} />}>
                  Ältere
                </Button>
              ) : (
                <span />
              )}
            </div>
          )}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-3.5" />
            Geöffnete Mails gelten als gelesen, auch in Apple Mail. Gesendet wird nur nach deiner Bestätigung, gelöscht wird nie etwas – auch nicht beim Verschieben.
          </p>
        </section>
      </div>
    </>
  );
}
