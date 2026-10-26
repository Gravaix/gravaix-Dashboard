import type { AuftragStatus } from "@/generated/prisma/client";

// Die Spalten des Boards, in dieser Reihenfolge.
export const SPALTEN: { status: AuftragStatus; name: string }[] = [
  { status: "ANFRAGE", name: "Anfrage" },
  { status: "ANGEBOT", name: "Angebot" },
  { status: "PRODUKTION", name: "Produktion" },
  { status: "VERSAND", name: "Versand" },
  { status: "ERLEDIGT", name: "Erledigt" },
];

export const STATUS_WERTE = SPALTEN.map((s) => s.status);

export function statusName(status: AuftragStatus) {
  return SPALTEN.find((s) => s.status === status)?.name ?? status;
}

/** Nächste bzw. vorige Spalte, oder undefined am Rand. */
export function nachbar(status: AuftragStatus, schritt: 1 | -1) {
  return SPALTEN[STATUS_WERTE.indexOf(status) + schritt]?.status;
}

/** „A-0007“ – kurze Nummer zum Nennen am Telefon oder im Betreff. */
export function auftragNummer(id: number) {
  return `A-${String(id).padStart(4, "0")}`;
}
