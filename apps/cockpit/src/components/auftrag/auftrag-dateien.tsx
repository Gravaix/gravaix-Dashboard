import { FileText } from "lucide-react";
import { DateiEntfernen } from "@/components/auftrag/datei-entfernen";
import { DateiHochladen } from "@/components/auftrag/datei-hochladen";
import { groesse } from "@/lib/mail/format";
import { VORSCHAU } from "@/lib/datei-typen";

type Datei = { id: number; name: string; typ: string; groesse: number };

/** Logos, Druckvorlagen und Fotos zum Auftrag. */
export function AuftragDateien({
  auftragId,
  dateien,
  hinweis,
  fehler,
}: {
  auftragId: number;
  dateien: Datei[];
  hinweis?: string;
  fehler?: string;
}) {
  return (
    <section id="dateien" className="mt-10 grid max-w-2xl scroll-mt-20 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Dateien</h2>
        <DateiHochladen auftragId={auftragId} />
      </div>
      <p className="-mt-1 text-xs text-muted-foreground">
        Logos, Druckvorlagen (SVG, PDF, AI, EPS …), Fotos – bis 25 MB pro Datei.
      </p>

      {hinweis && <p className="rounded-lg bg-muted px-3 py-2 text-sm">{hinweis}</p>}
      {fehler && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fehler}
        </p>
      )}

      {dateien.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Noch keine Dateien.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {dateien.map((d) => {
            const link = `/api/auftraege/dateien/${d.id}`;
            return (
              <li key={d.id} className="flex items-center gap-3 rounded-xl border p-2">
                <a href={link} target="_blank" rel="noopener" className="flex min-w-0 flex-1 items-center gap-3">
                  {VORSCHAU.test(d.typ) ? (
                    // eslint-disable-next-line @next/next/no-img-element -- privat, ohne Bild-Optimierung
                    <img src={link} alt="" className="size-12 shrink-0 rounded-md border bg-white object-contain" />
                  ) : (
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <FileText className="size-5 text-muted-foreground" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{d.name}</span>
                    <span className="text-xs text-muted-foreground">{groesse(d.groesse)}</span>
                  </span>
                </a>
                <DateiEntfernen dateiId={d.id} name={d.name} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
