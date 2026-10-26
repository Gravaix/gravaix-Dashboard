import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auftragSpeichern } from "@/app/(cockpit)/auftraege/actions";
import { AuftragFormular } from "@/components/auftrag/auftrag-formular";
import { PageHeader } from "@/components/page-header";
import { centZuEingabe } from "@/lib/auftrag/geld";
import { auftragNummer } from "@/lib/auftrag/status";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Auftrag" };

const DATUM = { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" } as const;

export default async function AuftragPage({ params }: PageProps<"/auftraege/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const a = await prisma.auftrag.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <>
      <PageHeader
        title={`${auftragNummer(a.id)} · ${a.titel}`}
        description={`Angelegt ${a.createdAt.toLocaleString("de-DE", DATUM)} · zuletzt geändert ${a.updatedAt.toLocaleString("de-DE", DATUM)}`}
      />
      <AuftragFormular
        aktion={auftragSpeichern}
        knopf="Speichern"
        werte={{
          id: a.id,
          titel: a.titel,
          kunde: a.kunde,
          kundeEmail: a.kundeEmail ?? "",
          produkt: a.produkt ?? "",
          menge: a.menge ? String(a.menge) : "",
          gravur: a.gravur ?? "",
          preis: centZuEingabe(a.preisCent),
          deadline: a.deadline ? a.deadline.toISOString().slice(0, 10) : "",
          status: a.status,
          notizen: a.notizen ?? "",
        }}
      />
    </>
  );
}
