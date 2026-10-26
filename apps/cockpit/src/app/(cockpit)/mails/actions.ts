"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { adressbuchLaden, gelesenSetzen, type Kontakt } from "@/lib/mail/imap";
import { mailSenden } from "@/lib/mail/smtp";
import { mailLink, nachrichtLink } from "@/lib/mail/format";

// Server-Aktionen sind per POST direkt erreichbar – daher hier selbst den Login prüfen.
async function angemeldet() {
  const session = await getSession();
  if (!session?.user.twoFactorEnabled) throw new Error("Nicht angemeldet");
}

export async function gelesenMarkieren(pfad: string, uid: number, gelesen: boolean) {
  await angemeldet();
  if (typeof pfad !== "string" || !pfad || !Number.isInteger(uid) || uid < 1 || typeof gelesen !== "boolean") {
    throw new Error("Ungültige Anfrage");
  }

  await gelesenSetzen(pfad, uid, gelesen);
  revalidatePath("/mails");
}

/** Bekannte Adressen für die Vorschläge im An/Cc-Feld (höchstens 1000). */
export async function adressVorschlaege(): Promise<Pick<Kontakt, "name" | "adresse">[]> {
  await angemeldet();
  const kontakte = await adressbuchLaden();
  return kontakte.slice(0, 1000).map(({ name, adresse }) => ({ name, adresse }));
}

export type SendenStand = { fehler?: string };

const ADRESSE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

/** „Max <max@firma.de>, anna@firma.de“ → ["Max <max@firma.de>", "anna@firma.de"]; null bei ungültiger Adresse. */
function adressListe(wert: FormDataEntryValue | null): string[] | null {
  const teile = String(wert ?? "")
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
  for (const t of teile) {
    const adresse = t.match(/<([^>]+)>\s*$/)?.[1] ?? t;
    if (!ADRESSE.test(adresse)) return null;
  }
  return teile;
}

/** Wird nur über den Knopf „Ja, jetzt senden“ ausgelöst – nie automatisch. */
export async function senden(_vorher: SendenStand, form: FormData): Promise<SendenStand> {
  await angemeldet();

  const an = adressListe(form.get("an"));
  const cc = adressListe(form.get("cc"));
  const betreff = String(form.get("betreff") ?? "").trim().slice(0, 500);
  const text = String(form.get("text") ?? "").slice(0, 200_000);
  const pfad = String(form.get("ordner") ?? "");
  const uid = Number(form.get("uid"));
  const antwortAuf = pfad && Number.isInteger(uid) && uid > 0 ? { pfad, uid } : undefined;

  if (!an || !cc) return { fehler: "Eine Adresse sieht ungültig aus. Bitte prüfen (mehrere mit Komma trennen)." };
  if (an.length === 0) return { fehler: "Bitte mindestens einen Empfänger angeben." };
  if (an.length + cc.length > 20) return { fehler: "Höchstens 20 Empfänger auf einmal." };
  if (!betreff) return { fehler: "Bitte einen Betreff eingeben." };

  let hinweise: string[];
  try {
    ({ hinweise } = await mailSenden({ an, cc, betreff, text, antwortAuf }));
  } catch (fehler) {
    const meldung = fehler instanceof Error ? fehler.message : String(fehler);
    return { fehler: `Senden fehlgeschlagen, die Mail ist nicht raus. (${meldung})` };
  }

  revalidatePath("/mails");
  const extra = { gesendet: hinweise.length ? "teilweise" : "1" };
  redirect(antwortAuf ? nachrichtLink(antwortAuf.pfad, antwortAuf.uid, extra) : mailLink("INBOX", extra));
}
