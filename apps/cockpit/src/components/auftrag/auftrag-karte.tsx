import Link from "next/link";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import { statusSetzen } from "@/app/(cockpit)/auftraege/actions";
import type { Auftrag } from "@/generated/prisma/client";
import { auftragNummer, nachbar, statusName } from "@/lib/auftrag/status";
import { cn } from "@/lib/utils";

/** Heute als JJJJ-MM-TT in deutscher Zeit – Deadlines sind reine Kalendertage. */
export function heuteTag() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

function deadlineAnzeige(deadline: Date, erledigt: boolean) {
  const tag = deadline.toISOString().slice(0, 10);
  const heute = heuteTag();
  const text = deadline.toLocaleDateString("de-DE", { timeZone: "UTC", day: "numeric", month: "short" });
  if (erledigt) return { text, klasse: "text-muted-foreground" };
  if (tag < heute) return { text: `${text} · überfällig`, klasse: "text-destructive font-medium" };
  if (tag === heute) return { text: `${text} · heute`, klasse: "text-brand font-medium" };
  return { text, klasse: "text-muted-foreground" };
}

function PfeilKnopf({ id, status, richtung }: { id: number; status: Auftrag["status"]; richtung: 1 | -1 }) {
  const ziel = nachbar(status, richtung);
  if (!ziel) return <span className="size-7" />;
  const Symbol = richtung === 1 ? ChevronRight : ChevronLeft;
  return (
    <form action={statusSetzen}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={ziel} />
      <button
        type="submit"
        title={`Nach „${statusName(ziel)}“`}
        aria-label={`Nach „${statusName(ziel)}“ schieben`}
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Symbol className="size-4" />
      </button>
    </form>
  );
}

export function AuftragKarte({ auftrag }: { auftrag: Auftrag }) {
  const erledigt = auftrag.status === "ERLEDIGT";
  const deadline = auftrag.deadline && deadlineAnzeige(auftrag.deadline, erledigt);

  return (
    <li className={cn("rounded-xl border bg-background shadow-xs", erledigt && "opacity-70")}>
      <Link href={`/auftraege/${auftrag.id}`} className="block px-3 pt-2.5 pb-1 hover:bg-muted/50">
        <span className="text-xs text-muted-foreground tabular-nums">{auftragNummer(auftrag.id)}</span>
        <span className="block text-sm font-medium break-words">{auftrag.titel}</span>
        <span className="block truncate text-sm text-muted-foreground">{auftrag.kunde}</span>
        {deadline && (
          <span className={cn("mt-1 flex items-center gap-1 text-xs", deadline.klasse)}>
            <CalendarClock className="size-3.5" />
            {deadline.text}
          </span>
        )}
      </Link>
      <div className="flex items-center justify-between px-1.5 pb-1.5">
        <PfeilKnopf id={auftrag.id} status={auftrag.status} richtung={-1} />
        <PfeilKnopf id={auftrag.id} status={auftrag.status} richtung={1} />
      </div>
    </li>
  );
}
