// MwSt.: Gravaix ist bis Ende 2026 Kleinunternehmer (§19 UStG, keine MwSt.),
// ab 01.01.2027 gilt die Regelbesteuerung. Preise werden immer netto gespeichert,
// pro Auftrag steht dazu der Satz (leer = Kleinunternehmer).

/** Letzter Tag als Kleinunternehmer. */
export const KLEINUNTERNEHMER_BIS = "2026-12-31";
export const REGELSATZ = 19;

export const STEUER_OPTIONEN: { wert: string; name: string }[] = [
  { wert: "", name: "Kleinunternehmer (keine MwSt.)" },
  { wert: "19", name: "19 % MwSt." },
  { wert: "7", name: "7 % MwSt." },
];

/** "" → null, "19" → 19; undefined bei unbekanntem Wert. */
export function satzAusText(text: string): number | null | undefined {
  if (text === "") return null;
  const satz = Number(text);
  return STEUER_OPTIONEN.some((o) => o.wert !== "" && Number(o.wert) === satz) ? satz : undefined;
}

export function satzZuText(satz: number | null) {
  return satz === null ? "" : String(satz);
}

/** Heute als JJJJ-MM-TT in deutscher Zeit. */
export function heuteTag() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

/** Welcher Satz gilt für eine Leistung an diesem Tag (JJJJ-MM-TT)? Maßgeblich ist der Liefertag. */
export function standardSatz(tag: string): number | null {
  return tag > KLEINUNTERNEHMER_BIS ? REGELSATZ : null;
}

/** Netto, MwSt. und Brutto in Cent. */
export function preisRechnung(nettoCent: number, satz: number | null) {
  const mwst = satz === null ? 0 : Math.round((nettoCent * satz) / 100);
  return { netto: nettoCent, mwst, brutto: nettoCent + mwst };
}
