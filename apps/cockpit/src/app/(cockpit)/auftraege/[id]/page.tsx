import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { auftragSpeichern } from "@/app/(cockpit)/auftraege/actions";
import { AuftragDateien } from "@/components/auftrag/auftrag-dateien";
import { AuftragFormular } from "@/components/auftrag/auftrag-formular";
import { PageHeader } from "@/components/page-header";
import { centZuEingabe } from "@/lib/auftrag/geld";
import { auftragNummer } from "@/lib/auftrag/status";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Auftrag" };

const DATUM = { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" } as const;

export default async function AuftragPage({ params, searchParams }: PageProps<"/auftraege/[id]">) {
  const id = Number((await params).id);
  const suche = await searchParams;
  if (!Number.isInteger(id) || id < 1) notFound();
  const a = await prisma.auftrag.findUnique({
    where: { id },
    // Ohne den Dateiinhalt – der wird erst beim Öffnen geladen.
    include: { dateien: { select: { id: true, name: true, typ: true, groesse: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!a) notFound();
  const hochgeladen = Number(suche.hochgeladen);

  return (
    <>
      <PageHeader
        title={`${auftragNummer(a.id)} · ${a.titel}`}
        description={`Angelegt ${a.createdAt.toLocaleString("de-DE", DATUM)} · zuletzt geändert ${a.updatedAt.toLocaleString("de-DE", DATUM)}`}
      />
      {a.mailMessageId && (
        <Link
          href={`/auftraege/${a.id}/mail`}
          className="mb-4 flex max-w-2xl items-start gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 break-words">
            <span className="text-muted-foreground">Verknüpfte Mail: </span>
            <span className="underline underline-offset-2">{a.mailBetreff || "Mail öffnen"}</span>
          </span>
        </Link>
      )}
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
      <AuftragDateien
        auftragId={a.id}
        dateien={a.dateien}
        hinweis={hochgeladen > 0 ? `${hochgeladen === 1 ? "1 Datei" : `${hochgeladen} Dateien`} hochgeladen.` : undefined}
        fehler={typeof suche.fehler === "string" ? suche.fehler : undefined}
      />
    </>
  );
}
