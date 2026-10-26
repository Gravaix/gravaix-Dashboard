import Link from "next/link";
import { Inbox, MessagesSquare, Send } from "lucide-react";
import { adresseKurz, kurzDatum, nachrichtLink } from "@/lib/mail/format";
import type { VerlaufEintrag } from "@/lib/mail/imap";
import { cn } from "@/lib/utils";

/**
 * Alle Mails einer Unterhaltung untereinander, älteste zuerst – empfangene links
 * mit Posteingang-Symbol, eigene mit Senden-Symbol. Die gerade geöffnete Mail ist markiert.
 */
export function VerlaufListe({
  eintraege,
  aktuell,
  titel = "Verlauf",
}: {
  eintraege: VerlaufEintrag[];
  aktuell?: { pfad: string; uid: number };
  titel?: string;
}) {
  if (eintraege.length < 2) return null;
  const eigene = (process.env.MAIL_USER ?? "").toLowerCase();

  return (
    <section className="grid gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <MessagesSquare className="size-4 text-muted-foreground" />
        {titel} · {eintraege.length} Mails
      </h2>
      <ol className="grid gap-2">
        {eintraege.map((e) => {
          const ist = aktuell && e.pfad === aktuell.pfad && e.uid === aktuell.uid;
          const vonMir = e.von.some((a) => a.adresse?.toLowerCase() === eigene);
          const Symbol = vonMir ? Send : Inbox;
          return (
            <li
              key={`${e.pfad}/${e.uid}`}
              className={cn("rounded-xl border p-3 text-sm", vonMir && "bg-muted/60", ist && "border-brand ring-1 ring-brand/40")}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="flex min-w-0 items-center gap-2 font-medium">
                  <Symbol className="size-3.5 shrink-0 text-muted-foreground" aria-label={vonMir ? "gesendet" : "empfangen"} />
                  <span className="truncate">
                    {vonMir ? `Du an ${adresseKurz(e.an[0]) || "?"}` : adresseKurz(e.von[0]) || "(unbekannt)"}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">{kurzDatum(e.datum)}</span>
              </div>
              {ist ? (
                <p className="mt-1 text-xs font-medium text-brand">Diese Mail</p>
              ) : (
                <>
                  {e.vorschau && (
                    <p className="mt-2 line-clamp-6 whitespace-pre-wrap break-words text-muted-foreground">{e.vorschau}</p>
                  )}
                  <Link href={nachrichtLink(e.pfad, e.uid)} className="mt-2 inline-block text-xs underline underline-offset-2">
                    Ganze Mail öffnen
                  </Link>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
