import type { Adresse } from "@/lib/mail/imap";

const ZONE = "Europe/Berlin";

/** Heute: Uhrzeit, dieses Jahr: „12. Okt.“, sonst „12.10.24“. */
export function kurzDatum(d: Date | null, jetzt = new Date()) {
  if (!d) return "";
  const tag = (x: Date) => x.toLocaleDateString("de-DE", { timeZone: ZONE });
  if (tag(d) === tag(jetzt)) return d.toLocaleTimeString("de-DE", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" });
  const jahr = (x: Date) => x.toLocaleDateString("de-DE", { timeZone: ZONE, year: "numeric" });
  if (jahr(d) === jahr(jetzt)) return d.toLocaleDateString("de-DE", { timeZone: ZONE, day: "numeric", month: "short" });
  return d.toLocaleDateString("de-DE", { timeZone: ZONE, day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function langDatum(d: Date | null) {
  if (!d) return "";
  return d.toLocaleString("de-DE", { timeZone: ZONE, dateStyle: "full", timeStyle: "short" });
}

export function adresseKurz(a?: Adresse) {
  return a ? a.name || a.adresse || "" : "";
}

export function adresseLang(a: Adresse) {
  // Manche Absender tragen ihre Adresse auch als Namen ein – dann nur einmal zeigen.
  const name = a.name && a.name.toLowerCase() !== a.adresse?.toLowerCase() ? a.name : undefined;
  return name && a.adresse ? `${name} <${a.adresse}>` : name || a.adresse || "";
}

export function groesse(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

export function mailLink(ordner: string, extra: Record<string, string | number> = {}) {
  const p = new URLSearchParams({ ordner, ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])) });
  return `/mails?${p}`;
}

export function nachrichtLink(ordner: string, uid: number, extra: Record<string, string> = {}) {
  return `/mails/nachricht?${new URLSearchParams({ ordner, uid: String(uid), ...extra })}`;
}
