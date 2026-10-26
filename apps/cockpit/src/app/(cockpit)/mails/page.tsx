import type { Metadata } from "next";
import Link from "next/link";
import { CheckCheck, Flag, Paperclip, Reply } from "lucide-react";
import { MailFehler } from "@/components/mail/mail-fehler";
import { OrdnerAuswahl } from "@/components/mail/ordner-auswahl";
import { OrdnerListe } from "@/components/mail/ordner-liste";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { adresseKurz, kurzDatum, mailLink, nachrichtLink } from "@/lib/mail/format";
import { mailListe, ordnerListe } from "@/lib/mail/imap";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mails" };

export default async function MailsPage({ searchParams }: PageProps<"/mails">) {
  const params = await searchParams;
  const pfad = typeof params.ordner === "string" ? params.ordner : "INBOX";
  const seite = Math.max(1, Number(params.seite) || 1);

  let daten;
  try {
    const [ordner, liste] = await Promise.all([ordnerListe(), mailListe(pfad, seite)]);
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
      <PageHeader title="Mails" description={`${aktuell?.name ?? pfad} · ${gesamt} Mails`} />
      <div className="mb-4 md:hidden">
        <OrdnerAuswahl ordner={ordner} aktiv={pfad} />
      </div>
      <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
        <aside className="hidden md:block">
          <OrdnerListe ordner={ordner} aktiv={pfad} />
        </aside>
        <section className="min-w-0">
          {mails.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Keine Mails in diesem Ordner.
            </p>
          ) : (
            <ul className="divide-y overflow-hidden rounded-xl border">
              {mails.map((m) => (
                <li key={m.uid}>
                  <Link
                    href={nachrichtLink(pfad, m.uid)}
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
                <Button variant="outline" size="sm" render={<Link href={mailLink(pfad, { seite: seite - 1 })} />}>
                  Neuere
                </Button>
              ) : (
                <span />
              )}
              <span>
                Seite {seite} von {seiten}
              </span>
              {seite < seiten ? (
                <Button variant="outline" size="sm" render={<Link href={mailLink(pfad, { seite: seite + 1 })} />}>
                  Ältere
                </Button>
              ) : (
                <span />
              )}
            </div>
          )}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCheck className="size-3.5" />
            Nur lesen: Das Cockpit ändert im Postfach nichts, auch nicht den Gelesen-Status.
          </p>
        </section>
      </div>
    </>
  );
}
