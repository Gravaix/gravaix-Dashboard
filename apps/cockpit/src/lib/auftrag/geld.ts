// Beträge werden als ganze Cent gespeichert – so gibt es keine Rundungsfehler.

/** „1.234,50“, „1234.5“, „12 €“ → 123450 / 1235 / 1200; null bei leer, NaN bei Unsinn. */
export function euroZuCent(text: string): number | null {
  const sauber = text.replace(/[€\s]/g, "");
  if (!sauber) return null;
  // Deutsch: Punkt = Tausender, Komma = Dezimal. Nur Punkt mit 1–2 Nachkommastellen = Dezimal.
  const normal = sauber.includes(",") ? sauber.replace(/\./g, "").replace(",", ".") : /\.\d{1,2}$/.test(sauber) ? sauber : sauber.replace(/\./g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normal)) return NaN;
  return Math.round(Number(normal) * 100);
}

/** 123450 → „1.234,50 €“ */
export function centZuEuro(cent: number) {
  return (cent / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

/** 123450 → „1234,50“ (für Eingabefelder) */
export function centZuEingabe(cent: number | null) {
  return cent === null ? "" : (cent / 100).toFixed(2).replace(".", ",");
}
