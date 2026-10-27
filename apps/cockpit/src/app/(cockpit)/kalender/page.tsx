import type { Metadata } from "next";
import { CalendarPlus, Check } from "lucide-react";
import { kalenderAnlegen } from "@/app/(cockpit)/kalender/actions";
import { KalenderFehler } from "@/components/kalender/kalender-fehler";
import { ComingSoon, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { kalenderStand } from "@/lib/kalender/caldav";

export const metadata: Metadata = { title: "Kalender" };

export default async function KalenderPage({ searchParams }: PageProps<"/kalender">) {
  const params = await searchParams;
  let kalender;
  try {
    kalender = await kalenderStand();
  } catch (fehler) {
    return (
      <>
        <PageHeader title="Kalender" />
        <KalenderFehler fehler={fehler} />
      </>
    );
  }
  const fehlen = kalender.filter((k) => !k.vorhanden);
  const angelegt = Number(params.angelegt);

  return (
    <>
      <PageHeader title="Kalender" description="Aufträge, Termine und Privates – synchron mit iPhone und Mac." />

      {angelegt > 0 && (
        <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
          {angelegt === 1 ? "1 Kalender" : `${angelegt} Kalender`} angelegt.
        </p>
      )}
      {typeof params.fehler === "string" && (
        <p role="alert" className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {params.fehler}
        </p>
      )}

      <section className="mb-8 grid max-w-2xl gap-3">
        <h2 className="text-sm font-semibold">Deine Kalender auf cal.gravaix.de</h2>
        <ul className="grid gap-2">
          {kalender.map((k) => (
            <li key={k.slug} className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: k.farbe }} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{k.name}</span>
                <span className="block text-xs text-muted-foreground">{k.zweck}</span>
              </span>
              {k.vorhanden ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check className="size-3.5" />
                  eingerichtet
                </span>
              ) : (
                <span className="text-xs font-medium text-brand">fehlt noch</span>
              )}
            </li>
          ))}
        </ul>
        {fehlen.length > 0 && (
          <form action={kalenderAnlegen}>
            <Button type="submit">
              <CalendarPlus />
              {fehlen.length === 1 ? `Kalender „${fehlen[0].name}“ anlegen` : `${fehlen.length} Kalender anlegen`}
            </Button>
          </form>
        )}
      </section>

      <ComingSoon>Als Nächstes: Kalenderansicht (Tag/Woche/Monat) und Termine anlegen, danach Sync mit iPhone und Mac.</ComingSoon>
    </>
  );
}
