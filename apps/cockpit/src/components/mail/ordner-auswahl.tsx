"use client";

import { useRouter } from "next/navigation";
import type { Ordner } from "@/lib/mail/imap";
import { mailLink } from "@/lib/mail/format";

/** Ordner am Handy als Auswahlfeld. */
export function OrdnerAuswahl({ ordner, aktiv }: { ordner: Ordner[]; aktiv: string }) {
  const router = useRouter();
  return (
    <select
      aria-label="Ordner"
      value={aktiv}
      onChange={(e) => router.push(mailLink(e.target.value))}
      className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
    >
      {ordner.map((o) => (
        <option key={o.pfad} value={o.pfad}>
          {" ".repeat(o.tiefe)}
          {o.name}
          {o.ungelesen > 0 ? ` (${o.ungelesen})` : ""}
        </option>
      ))}
    </select>
  );
}
