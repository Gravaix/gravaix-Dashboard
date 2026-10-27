"use server";

import { headers } from "next/headers";

// Kontaktformular: prüft die Eingaben, wehrt Spam ab und gibt die Anfrage an das Cockpit weiter
// (dort wird daraus ein Auftrag in der Spalte „Anfrage“). Es wird keine Mail verschickt.

export type AnfrageStand = { ok?: boolean; fehler?: string; felder?: Record<string, string> };

const STUECKZAHLEN = ["Noch offen", "Einzelstück", "10–50", "50–200", "200+"];
const ARTEN = ["Unternehmen", "Verein / Organisation", "Privatkunde"];
const LEISTUNGEN = ["Lasergravur", "Zuschnitt", "Druck", "Stick", "Noch offen"];

// Einfache Bremse gegen massenhaftes Absenden: höchstens 5 Anfragen pro Stunde und Adresse.
const verlauf = new Map<string, number[]>();
function zuOft(ip: string) {
  const jetzt = Date.now();
  const liste = (verlauf.get(ip) ?? []).filter((t) => jetzt - t < 60 * 60 * 1000);
  liste.push(jetzt);
  verlauf.set(ip, liste);
  if (verlauf.size > 5000) verlauf.clear();
  return liste.length > 5;
}

export async function anfrageSenden(_vorher: AnfrageStand, form: FormData): Promise<AnfrageStand> {
  const text = (name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);
  const felder = {
    name: text("name", 200),
    firma: text("firma", 200),
    email: text("email", 200),
    telefon: text("telefon", 50),
    stueckzahl: text("stueckzahl", 30),
    art: text("art", 40),
    leistung: text("leistung", 40),
    nachricht: text("nachricht", 5000),
  };

  // Spam-Fallen: unsichtbares Feld muss leer bleiben, Formular nicht schneller als 3 Sekunden ausgefüllt.
  const gestartet = Number(form.get("t"));
  if (text("website", 200) || !Number.isFinite(gestartet) || Date.now() - gestartet < 3000) {
    return { ok: true }; // so tun, als ob – Bots bekommen keinen Hinweis
  }

  if (!felder.name) return { fehler: "Bitte Ihren Namen angeben.", felder };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(felder.email)) return { fehler: "Bitte eine gültige E-Mail-Adresse angeben.", felder };
  if (felder.nachricht.length < 10) return { fehler: "Bitte beschreiben Sie Ihr Vorhaben kurz.", felder };
  if (form.get("einwilligung") !== "on") return { fehler: "Bitte bestätigen Sie den Hinweis zum Datenschutz.", felder };
  if (felder.stueckzahl && !STUECKZAHLEN.includes(felder.stueckzahl)) felder.stueckzahl = "";
  if (felder.art && !ARTEN.includes(felder.art)) felder.art = "";
  if (felder.leistung && !LEISTUNGEN.includes(felder.leistung)) felder.leistung = "";

  const kopf = await headers();
  const ip = kopf.get("x-forwarded-for")?.split(",")[0]?.trim() || "unbekannt";
  if (zuOft(ip)) return { fehler: "Zu viele Anfragen in kurzer Zeit. Bitte rufen Sie uns an oder schreiben Sie eine E-Mail.", felder };

  try {
    const antwort = await fetch(`${process.env.COCKPIT_INTERN_URL || "http://cockpit:3000"}/api/anfrage`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.ANFRAGE_TOKEN ?? ""}` },
      body: JSON.stringify({ ...felder, vorschau: form.get("vorschau") === "on" }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!antwort.ok) throw new Error(`Cockpit antwortet mit ${antwort.status}`);
  } catch (fehler) {
    console.error("Anfrage konnte nicht weitergegeben werden:", fehler);
    return {
      fehler: "Ihre Anfrage konnte gerade nicht übermittelt werden. Bitte versuchen Sie es später erneut oder schreiben Sie an info@gravaix.de.",
      felder,
    };
  }
  return { ok: true };
}
