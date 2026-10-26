import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AuftragKarte } from "@/components/auftrag/auftrag-karte";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SPALTEN } from "@/lib/auftrag/status";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Aufträge" };

// Von „Erledigt“ nur die letzten paar zeigen, sonst wird die Spalte endlos.
const ERLEDIGT_ANZAHL = 15;

export default async function AuftraegePage() {
  const [offen, erledigt] = await Promise.all([
    prisma.auftrag.findMany({
      where: { status: { not: "ERLEDIGT" } },
      // Dringendes zuerst: nach Deadline, Aufträge ohne Deadline danach
      orderBy: [{ deadline: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
    }),
    prisma.auftrag.findMany({
      where: { status: "ERLEDIGT" },
      orderBy: { erledigtAm: { sort: "desc", nulls: "last" } },
      take: ERLEDIGT_ANZAHL,
    }),
  ]);
  const alle = [...offen, ...erledigt];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Aufträge" description={`${offen.length} offen`} />
        <Button render={<Link href="/auftraege/neu" />}>
          <Plus />
          Neuer Auftrag
        </Button>
      </div>

      {/* Am Handy nebeneinander zum Wischen, am Mac fünf Spalten */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {SPALTEN.map((spalte) => {
          const karten = alle.filter((a) => a.status === spalte.status);
          return (
            <section key={spalte.status} className="w-[78%] shrink-0 snap-start rounded-xl bg-muted/50 p-2 md:w-auto">
              <h2 className="flex items-center justify-between px-1.5 pt-1 pb-2 text-sm font-semibold">
                {spalte.name}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">{karten.length}</span>
              </h2>
              {karten.length === 0 ? (
                <p className="px-1.5 pb-2 text-xs text-muted-foreground">Leer</p>
              ) : (
                <ul className="grid gap-2">
                  {karten.map((a) => (
                    <AuftragKarte key={a.id} auftrag={a} />
                  ))}
                </ul>
              )}
              {spalte.status === "ERLEDIGT" && karten.length === ERLEDIGT_ANZAHL && (
                <p className="px-1.5 pt-2 text-xs text-muted-foreground">Die letzten {ERLEDIGT_ANZAHL}.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
