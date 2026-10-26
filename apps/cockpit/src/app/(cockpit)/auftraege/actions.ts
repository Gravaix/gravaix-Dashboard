"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AuftragStatus } from "@/generated/prisma/client";
import { STATUS_WERTE } from "@/lib/auftrag/status";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Server-Aktionen sind per POST direkt erreichbar – daher hier selbst den Login prüfen.
async function angemeldet() {
  const session = await getSession();
  if (!session?.user.twoFactorEnabled) throw new Error("Nicht angemeldet");
}

function istStatus(wert: unknown): wert is AuftragStatus {
  return typeof wert === "string" && (STATUS_WERTE as string[]).includes(wert);
}

export type AuftragStand = { fehler?: string };

/** Formularfelder lesen und prüfen. */
function felder(form: FormData) {
  const text = (name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);
  const titel = text("titel", 200);
  const kunde = text("kunde", 200);
  const kundeEmail = text("kundeEmail", 200) || null;
  const notizen = text("notizen", 20_000) || null;
  const deadlineText = text("deadline", 10);
  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(deadlineText) ? new Date(`${deadlineText}T00:00:00Z`) : null;
  const status = form.get("status");

  if (!titel) return { fehler: "Bitte einen Titel eingeben, z. B. „50 Kugelschreiber mit Logo“." };
  if (!kunde) return { fehler: "Bitte den Kunden eingeben." };
  if (kundeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kundeEmail)) return { fehler: "Die E-Mail-Adresse sieht ungültig aus." };
  if (deadlineText && !deadline) return { fehler: "Das Datum ist ungültig." };
  if (status !== null && !istStatus(status)) return { fehler: "Unbekannter Status." };

  return { daten: { titel, kunde, kundeEmail, notizen, deadline, ...(status ? { status } : {}) } };
}

export async function auftragAnlegen(_vorher: AuftragStand, form: FormData): Promise<AuftragStand> {
  await angemeldet();
  const { daten, fehler } = felder(form);
  if (!daten) return { fehler };
  await prisma.auftrag.create({
    data: { ...daten, erledigtAm: daten.status === "ERLEDIGT" ? new Date() : null },
  });
  revalidatePath("/auftraege");
  redirect("/auftraege");
}

export async function auftragSpeichern(_vorher: AuftragStand, form: FormData): Promise<AuftragStand> {
  await angemeldet();
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id < 1) return { fehler: "Ungültiger Auftrag." };
  const { daten, fehler } = felder(form);
  if (!daten) return { fehler };

  const vorher = await prisma.auftrag.findUnique({ where: { id }, select: { status: true, erledigtAm: true } });
  if (!vorher) return { fehler: "Diesen Auftrag gibt es nicht mehr." };
  await prisma.auftrag.update({
    where: { id },
    data: { ...daten, erledigtAm: erledigtAm(vorher, daten.status ?? vorher.status) },
  });
  revalidatePath("/auftraege");
  redirect("/auftraege");
}

/** Karte eine Spalte weiter oder zurück (Pfeile auf dem Board). */
export async function statusSetzen(form: FormData) {
  await angemeldet();
  const id = Number(form.get("id"));
  const status = form.get("status");
  if (!Number.isInteger(id) || id < 1 || !istStatus(status)) throw new Error("Ungültige Anfrage");

  const vorher = await prisma.auftrag.findUnique({ where: { id }, select: { status: true, erledigtAm: true } });
  if (!vorher) return;
  await prisma.auftrag.update({ where: { id }, data: { status, erledigtAm: erledigtAm(vorher, status) } });
  revalidatePath("/auftraege");
}

/** Zeitpunkt merken, wann ein Auftrag erledigt wurde (für „zuletzt erledigt“). */
function erledigtAm(vorher: { status: AuftragStatus; erledigtAm: Date | null }, neu: AuftragStatus) {
  if (neu !== "ERLEDIGT") return null;
  return vorher.status === "ERLEDIGT" ? vorher.erledigtAm : new Date();
}
