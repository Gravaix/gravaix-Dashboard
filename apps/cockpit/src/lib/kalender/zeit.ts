// Datum und Uhrzeit in deutscher Zeit (Europe/Berlin, inkl. Sommer-/Winterzeit).
// Der Server läuft in UTC – darum wird hier immer ausdrücklich umgerechnet.
// Tage werden als Text „JJJJ-MM-TT“ weitergegeben, Zeitpunkte als Date.

export const ZONE = "Europe/Berlin";

const TEILE = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Jahr, Monat, Tag, Stunde, Minute eines Zeitpunkts in deutscher Zeit. */
export function berlinTeile(d: Date) {
  const t = Object.fromEntries(TEILE.formatToParts(d).map((p) => [p.type, p.value]));
  return {
    jahr: Number(t.year),
    monat: Number(t.month),
    tag: Number(t.day),
    stunde: Number(t.hour),
    minute: Number(t.minute),
    sekunde: Number(t.second),
  };
}

const zwei = (n: number) => String(n).padStart(2, "0");

/** Zeitpunkt → „JJJJ-MM-TT“ (deutscher Kalendertag). */
export function tagVon(d: Date) {
  const t = berlinTeile(d);
  return `${t.jahr}-${zwei(t.monat)}-${zwei(t.tag)}`;
}

/** Zeitpunkt → „HH:MM“ (deutsche Uhrzeit). */
export function zeitVon(d: Date) {
  const t = berlinTeile(d);
  return `${zwei(t.stunde)}:${zwei(t.minute)}`;
}

export function heute() {
  return tagVon(new Date());
}

export function istTag(text: unknown): text is string {
  return typeof text === "string" && /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(`${text}T00:00:00Z`));
}

export function istZeit(text: unknown): text is string {
  return typeof text === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(text);
}

/** „JJJJ-MM-TT“ + „HH:MM“ in deutscher Zeit → Zeitpunkt. */
export function berlinZuDate(tag: string, zeit = "00:00") {
  const [j, m, t] = tag.split("-").map(Number);
  const [h, min] = zeit.split(":").map(Number);
  const gewuenscht = Date.UTC(j, m - 1, t, h, min);
  // Abstand zu UTC an diesem Tag bestimmen (1 oder 2 Stunden), zweimal für die Umstellungstage.
  let wert = gewuenscht;
  for (let i = 0; i < 2; i++) {
    const b = berlinTeile(new Date(wert));
    const alsUtc = Date.UTC(b.jahr, b.monat - 1, b.tag, b.stunde, b.minute);
    wert += gewuenscht - alsUtc;
  }
  return new Date(wert);
}

/** Tag um n Tage verschieben: tagPlus("2026-10-31", 1) → "2026-11-01" */
export function tagPlus(tag: string, n: number) {
  const d = new Date(`${tag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Wochentag: 0 = Montag … 6 = Sonntag */
export function wochentag(tag: string) {
  return (new Date(`${tag}T12:00:00Z`).getUTCDay() + 6) % 7;
}

export function wochenStart(tag: string) {
  return tagPlus(tag, -wochentag(tag));
}

export function monatsStart(tag: string) {
  return `${tag.slice(0, 8)}01`;
}

/** Monat um n verschieben (Tag 1 des Monats). */
export function monatPlus(tag: string, n: number) {
  const d = new Date(`${monatsStart(tag)}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}

/** „Di., 27. Okt.“ usw. – ein Kalendertag lesbar. */
export function tagName(tag: string, optionen: Intl.DateTimeFormatOptions) {
  return new Date(`${tag}T12:00:00Z`).toLocaleDateString("de-DE", { timeZone: "UTC", ...optionen });
}
