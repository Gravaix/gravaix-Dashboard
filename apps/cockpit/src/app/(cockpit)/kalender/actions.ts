"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { kalenderEinrichten } from "@/lib/kalender/caldav";
import { getSession } from "@/lib/session";

// Server-Aktionen sind per POST direkt erreichbar – daher hier selbst den Login prüfen.
async function angemeldet() {
  const session = await getSession();
  if (!session?.user.twoFactorEnabled) throw new Error("Nicht angemeldet");
}

/** Fehlende Kalender (Aufträge, Termine, Privat) in Radicale anlegen. */
export async function kalenderAnlegen() {
  await angemeldet();
  let ziel: string;
  try {
    const angelegt = await kalenderEinrichten();
    ziel = `/kalender?${new URLSearchParams({ angelegt: String(angelegt.length) })}`;
  } catch (fehler) {
    ziel = `/kalender?${new URLSearchParams({ fehler: fehler instanceof Error ? fehler.message.slice(0, 300) : "Unbekannter Fehler" })}`;
  }
  revalidatePath("/kalender");
  redirect(ziel);
}
