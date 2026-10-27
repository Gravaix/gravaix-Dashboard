/** Klassen zusammensetzen, leere Werte überspringen. */
export function cn(...klassen: (string | false | null | undefined)[]) {
  return klassen.filter(Boolean).join(" ");
}
