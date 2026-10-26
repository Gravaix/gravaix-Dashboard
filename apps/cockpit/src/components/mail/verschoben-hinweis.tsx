import Link from "next/link";
import { FolderInput } from "lucide-react";
import { verschiebenAktion } from "@/app/(cockpit)/mails/actions";
import { nachrichtLink } from "@/lib/mail/format";
import type { Ordner } from "@/lib/mail/imap";

/** Nach dem Verschieben: wohin, mit „Ansehen“ und „Rückgängig“. */
export function VerschobenHinweis({
  ordner,
  ziel,
  von,
  neu,
}: {
  ordner: Ordner[];
  ziel: unknown;
  von: unknown;
  neu: unknown;
}) {
  if (typeof ziel !== "string" || typeof von !== "string") return null;
  const name = ordner.find((o) => o.pfad === ziel)?.name ?? ziel;
  const neueUid = Number(neu);
  const bekannt = Number.isInteger(neueUid) && neueUid > 0;

  return (
    <div role="status" className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-muted px-3 py-2 text-sm">
      <span className="flex items-center gap-2">
        <FolderInput className="size-4 text-brand" />
        Mail nach „{name}“ verschoben.
      </span>
      {bekannt && (
        <>
          <Link href={nachrichtLink(ziel, neueUid)} className="underline underline-offset-2">
            Ansehen
          </Link>
          <form action={verschiebenAktion}>
            <input type="hidden" name="ordner" value={ziel} />
            <input type="hidden" name="uid" value={neueUid} />
            <input type="hidden" name="ziel" value={von} />
            <input type="hidden" name="danach" value={von} />
            <button type="submit" className="underline underline-offset-2">
              Rückgängig
            </button>
          </form>
        </>
      )}
    </div>
  );
}
