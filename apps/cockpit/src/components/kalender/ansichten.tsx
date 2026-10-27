import Link from "next/link";
import { Plus, Repeat } from "lucide-react";
import type { Termin } from "@/lib/kalender/termine";
import { kalenderInfo } from "@/lib/kalender/liste";
import { heute, tagName, tagPlus, zeitVon } from "@/lib/kalender/zeit";
import { cn } from "@/lib/utils";

// Kalenderansichten Monat / Woche / Tag (Server-Komponenten, ohne JavaScript im Browser).

export function terminLink(t: Pick<Termin, "kalender" | "datei">) {
  return `/kalender/termin?${new URLSearchParams({ kal: t.kalender, datei: t.datei })}`;
}

export function neuLink(tag: string) {
  return `/kalender/neu?${new URLSearchParams({ datum: tag })}`;
}

export function ansichtLink(ansicht: string, datum: string) {
  return `/kalender?${new URLSearchParams({ ansicht, datum })}`;
}

/** Termine je Tag: mehrtägige erscheinen an jedem ihrer Tage. Ganztägige zuerst. */
export function nachTagen(termine: Termin[], tage: string[]) {
  const karte = new Map<string, Termin[]>(tage.map((t) => [t, []]));
  for (const t of termine) {
    for (let tag = t.startTag; tag <= t.endeTag; tag = tagPlus(tag, 1)) {
      karte.get(tag)?.push(t);
      if (tag >= tage[tage.length - 1]) break;
    }
  }
  for (const liste of karte.values()) {
    liste.sort((a, b) => Number(b.ganztags) - Number(a.ganztags) || a.start.getTime() - b.start.getTime());
  }
  return karte;
}

/** Uhrzeit für die Anzeige an einem bestimmten Tag. */
function zeitText(t: Termin, tag: string) {
  if (t.ganztags) return "";
  if (tag === t.startTag) return zeitVon(t.start);
  if (tag === t.endeTag) return `bis ${zeitVon(t.ende)}`;
  return "";
}

function TerminChip({ t, tag, klein }: { t: Termin; tag: string; klein?: boolean }) {
  const farbe = kalenderInfo(t.kalender).farbe;
  const zeit = zeitText(t, tag);
  return (
    <Link
      href={terminLink(t)}
      title={`${zeit ? `${zeit} ` : ""}${t.titel}${t.ort ? ` · ${t.ort}` : ""}`}
      className={cn(
        "flex min-w-0 gap-1 rounded-md border-l-[3px] px-1.5 hover:brightness-95",
        klein ? "items-center py-0 text-[11px] leading-5" : "items-start py-1 text-xs",
      )}
      style={{ borderLeftColor: farbe, backgroundColor: `${farbe}1F` }}
    >
      {zeit && <span className="shrink-0 tabular-nums text-muted-foreground">{zeit}</span>}
      <span className={cn("min-w-0 font-medium", klein ? "truncate" : "line-clamp-3 break-words")}>{t.titel}</span>
      {t.wiederholt && !klein && <Repeat className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-label="Serie" />}
    </Link>
  );
}

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function MonatAnsicht({ termine, tage, monat }: { termine: Termin[]; tage: string[]; monat: string }) {
  const proTag = nachTagen(termine, tage);
  const jetzt = heute();
  const MAX = 3;
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-xs font-medium text-muted-foreground">
        {WOCHENTAGE.map((w) => (
          <div key={w} className="py-1.5">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {tage.map((tag, i) => {
          const liste = proTag.get(tag) ?? [];
          const fremd = tag.slice(0, 7) !== monat.slice(0, 7);
          return (
            <div
              key={tag}
              className={cn(
                "min-h-20 min-w-0 border-b p-1 sm:min-h-28",
                i % 7 !== 6 && "border-r",
                fremd && "bg-muted/30",
              )}
            >
              <Link
                href={ansichtLink("tag", tag)}
                className={cn(
                  "mb-0.5 flex size-6 items-center justify-center rounded-full text-xs tabular-nums hover:bg-muted",
                  fremd && "text-muted-foreground",
                  tag === jetzt && "bg-brand font-semibold text-white hover:bg-brand",
                )}
              >
                {Number(tag.slice(8))}
              </Link>
              {/* Handy: nur farbige Punkte, ab Tablet: Titel */}
              <div className="flex flex-wrap gap-0.5 sm:hidden">
                {liste.slice(0, 6).map((t) => (
                  <Link
                    key={`${t.datei}-${t.start.getTime()}`}
                    href={ansichtLink("tag", tag)}
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: kalenderInfo(t.kalender).farbe }}
                    aria-label={t.titel}
                  />
                ))}
              </div>
              <div className="hidden gap-0.5 sm:grid">
                {liste.slice(0, MAX).map((t) => (
                  <TerminChip key={`${t.datei}-${t.start.getTime()}`} t={t} tag={tag} klein />
                ))}
                {liste.length > MAX && (
                  <Link href={ansichtLink("tag", tag)} className="px-1.5 text-[11px] text-muted-foreground hover:underline">
                    +{liste.length - MAX} weitere
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WocheAnsicht({ termine, tage }: { termine: Termin[]; tage: string[] }) {
  const proTag = nachTagen(termine, tage);
  const jetzt = heute();
  return (
    <div className="grid gap-2 md:grid-cols-7 md:gap-0 md:overflow-hidden md:rounded-xl md:border">
      {tage.map((tag, i) => {
        const liste = proTag.get(tag) ?? [];
        return (
          <section
            key={tag}
            className={cn(
              "min-w-0 rounded-xl border p-2 md:min-h-64 md:rounded-none md:border-0",
              i < 6 && "md:border-r",
              tag === jetzt && "bg-brand/5",
            )}
          >
            <div className="mb-1.5 flex items-center justify-between gap-1">
              <Link href={ansichtLink("tag", tag)} className="text-xs hover:underline">
                <span className={cn("font-medium", tag === jetzt && "text-brand")}>{WOCHENTAGE[i]}</span>{" "}
                <span className="text-muted-foreground tabular-nums">{tagName(tag, { day: "numeric", month: "short" })}</span>
              </Link>
              <Link
                href={neuLink(tag)}
                title="Termin an diesem Tag"
                aria-label={`Termin am ${tagName(tag, { day: "numeric", month: "long" })} anlegen`}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-3.5" />
              </Link>
            </div>
            <div className="grid gap-1">
              {liste.map((t) => (
                <TerminChip key={`${t.datei}-${t.start.getTime()}`} t={t} tag={tag} />
              ))}
              {liste.length === 0 && <p className="text-xs text-muted-foreground/60 md:hidden">–</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function TagAnsicht({ termine, tag }: { termine: Termin[]; tag: string }) {
  const liste = nachTagen(termine, [tag]).get(tag) ?? [];
  return (
    <div className="grid max-w-2xl gap-2">
      {liste.length === 0 && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Keine Termine an diesem Tag.</p>
      )}
      {liste.map((t) => {
        const k = kalenderInfo(t.kalender);
        const zeit = t.ganztags
          ? "ganztags"
          : `${tag === t.startTag ? zeitVon(t.start) : "…"} – ${tag === t.endeTag ? zeitVon(t.ende) : "…"}`;
        return (
          <Link
            key={`${t.datei}-${t.start.getTime()}`}
            href={terminLink(t)}
            className="flex gap-3 rounded-xl border border-l-4 p-3 text-sm hover:bg-muted/50"
            style={{ borderLeftColor: k.farbe }}
          >
            <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{zeit}</span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 font-medium break-words">
                {t.titel}
                {t.wiederholt && <Repeat className="size-3.5 shrink-0 text-muted-foreground" aria-label="Serie" />}
              </span>
              <span className="block text-xs text-muted-foreground">
                {k.name}
                {t.ort && ` · ${t.ort}`}
              </span>
            </span>
          </Link>
        );
      })}
      <Link href={neuLink(tag)} className="flex items-center gap-1.5 px-1 text-sm text-muted-foreground hover:text-foreground">
        <Plus className="size-4" />
        Termin an diesem Tag
      </Link>
    </div>
  );
}
