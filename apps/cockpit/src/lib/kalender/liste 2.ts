// Die festen Kalender (auch im Browser nutzbar, ohne Zugangsdaten).
// `slug` ist der Teil der Adresse, z. B. cal.gravaix.de/celiano/termine/

export const KALENDER = [
  { slug: "auftraege", name: "Aufträge", farbe: "#E8590C", zweck: "Deadlines aus dem Auftragsboard" },
  { slug: "termine", name: "Termine", farbe: "#1971C2", zweck: "Kundentermine, Abholungen, Lieferanten" },
  { slug: "privat", name: "Privat", farbe: "#2F9E44", zweck: "Alles Private" },
] as const;

export type KalenderSlug = (typeof KALENDER)[number]["slug"];

export function kalenderInfo(slug: KalenderSlug) {
  return KALENDER.find((k) => k.slug === slug) ?? KALENDER[1];
}
