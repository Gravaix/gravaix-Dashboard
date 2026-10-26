import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Ordner } from "@/lib/mail/imap";
import { mailLink } from "@/lib/mail/format";

/** Ordner am Mac als Spalte links. */
export function OrdnerListe({ ordner, aktiv }: { ordner: Ordner[]; aktiv: string }) {
  return (
    <nav className="grid gap-0.5 text-sm">
      {ordner.map((o) => (
        <Link
          key={o.pfad}
          href={mailLink(o.pfad)}
          aria-current={o.pfad === aktiv ? "page" : undefined}
          style={{ paddingLeft: `${0.75 + o.tiefe * 0.9}rem` }}
          className={cn(
            "flex items-center justify-between gap-2 rounded-lg py-1.5 pr-2 text-muted-foreground hover:bg-muted hover:text-foreground",
            "aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground",
          )}
        >
          <span className="truncate">{o.name}</span>
          {o.ungelesen > 0 && <span className="shrink-0 text-xs font-semibold text-foreground">{o.ungelesen}</span>}
        </Link>
      ))}
    </nav>
  );
}
