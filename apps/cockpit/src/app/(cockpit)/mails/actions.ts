"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { gelesenSetzen } from "@/lib/mail/imap";

// Server-Aktionen sind per POST direkt erreichbar – daher hier selbst den Login prüfen.
export async function gelesenMarkieren(pfad: string, uid: number, gelesen: boolean) {
  const session = await getSession();
  if (!session?.user.twoFactorEnabled) throw new Error("Nicht angemeldet");
  if (typeof pfad !== "string" || !pfad || !Number.isInteger(uid) || uid < 1 || typeof gelesen !== "boolean") {
    throw new Error("Ungültige Anfrage");
  }

  await gelesenSetzen(pfad, uid, gelesen);
  revalidatePath("/mails");
}
