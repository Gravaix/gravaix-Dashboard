import { CheckCircle2, FolderInput } from "lucide-react";
import { verschiebenAktion } from "@/app/(cockpit)/mails/actions";
import { Button } from "@/components/ui/button";
import { erledigtOrdner, verschiebeZiele, type Ordner } from "@/lib/mail/imap";

/** „Erledigt“ und „Verschieben nach …“ für eine geöffnete Mail. Funktioniert auch ohne JavaScript. */
export function VerschiebenLeiste({ ordner, pfad, uid }: { ordner: Ordner[]; pfad: string; uid: number }) {
  const erledigt = erledigtOrdner(ordner);
  const ziele = verschiebeZiele(ordner, pfad);
  if (ziele.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {erledigt && erledigt.pfad !== pfad && (
        <form action={verschiebenAktion}>
          <input type="hidden" name="ordner" value={pfad} />
          <input type="hidden" name="uid" value={uid} />
          <input type="hidden" name="ziel" value={erledigt.pfad} />
          <Button type="submit" variant="outline" size="sm">
            <CheckCircle2 />
            Erledigt
          </Button>
        </form>
      )}
      <form action={verschiebenAktion} className="flex items-center gap-2">
        <input type="hidden" name="ordner" value={pfad} />
        <input type="hidden" name="uid" value={uid} />
        <select
          name="ziel"
          required
          defaultValue=""
          aria-label="Zielordner"
          className="h-8 max-w-56 rounded-lg border bg-background px-2 text-sm"
        >
          <option value="" disabled>
            Verschieben nach …
          </option>
          {ziele.map((o) => (
            <option key={o.pfad} value={o.pfad}>
              {" ".repeat(o.tiefe)}
              {o.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm" aria-label="Verschieben">
          <FolderInput />
          <span className="hidden sm:inline">Verschieben</span>
        </Button>
      </form>
    </div>
  );
}
