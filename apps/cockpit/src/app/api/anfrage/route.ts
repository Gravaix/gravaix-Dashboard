import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

// Eingang für Anfragen aus dem Kontaktformular der Webseite (gravaix.de).
// Nur die Webseite kennt den Schlüssel ANFRAGE_TOKEN (steht in infra/.env).
// Jede Anfrage wird ein Auftrag in der Spalte „Anfrage“ – es wird keine Mail verschickt.

export const dynamic = "force-dynamic";

function berechtigt(request: Request) {
  const erwartet = process.env.ANFRAGE_TOKEN ?? "";
  const kopf = request.headers.get("authorization") ?? "";
  const gesendet = kopf.startsWith("Bearer ") ? kopf.slice(7) : "";
  if (erwartet.length < 32 || gesendet.length !== erwartet.length) return false;
  return timingSafeEqual(Buffer.from(gesendet), Buffer.from(erwartet));
}

const text = (wert: unknown, max: number) => (typeof wert === "string" ? wert.trim().slice(0, max) : "");

export async function POST(request: Request) {
  if (!berechtigt(request)) return Response.json({ fehler: "Nicht berechtigt" }, { status: 401 });

  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage" }, { status: 400 });
  }

  const name = text(daten.name, 200);
  const firma = text(daten.firma, 200);
  const email = text(daten.email, 200);
  const telefon = text(daten.telefon, 50);
  const nachricht = text(daten.nachricht, 5000);
  const stueckzahl = text(daten.stueckzahl, 30);
  const art = text(daten.art, 40);
  const leistung = text(daten.leistung, 40);
  const vorschau = daten.vorschau === true;

  if (!name || !nachricht || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ fehler: "Name, gültige E-Mail und Nachricht fehlen" }, { status: 400 });
  }

  const angaben: [string, string][] = [
    ["Name", name],
    ["Firma", firma],
    ["E-Mail", email],
    ["Telefon", telefon],
    ["Fragt an als", art],
    ["Leistung", leistung],
    ["Stückzahl", stueckzahl],
  ];
  const details = [
    "Anfrage über das Kontaktformular auf gravaix.de",
    "",
    ...angaben.filter(([, wert]) => wert).map(([feld, wert]) => `${feld}: ${wert}`),
    ...(vorschau ? ["Wünscht eine digitale Vorschau vor der Produktion"] : []),
    "",
    nachricht,
  ];

  const auftrag = await prisma.auftrag.create({
    data: {
      titel: `Webanfrage${leistung ? `: ${leistung}` : ""}`.slice(0, 200),
      kunde: firma ? `${firma} (${name})`.slice(0, 200) : name,
      kundeEmail: email,
      notizen: details.join("\n"),
      status: "ANFRAGE",
    },
    select: { id: true },
  });
  return Response.json({ ok: true, id: auftrag.id });
}
