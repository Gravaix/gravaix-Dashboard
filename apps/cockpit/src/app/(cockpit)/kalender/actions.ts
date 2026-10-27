"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { kalenderEinrichten } from "@/lib/kalender/caldav";
import {
  TerminGeaendert,
  istDatei,
  istKalender,
  terminAendern,
  terminAnlegen,
  terminLoeschen,
  terminPruefen,
  type TerminDaten,
  type TerminMail,
} from "@/lib/kalender/termine";
import { istTag, istZeit } from "@/lib/kalender/zeit";
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

export type TerminStand = { fehler?: string };

/** Termin anlegen oder ändern (Formular „Termin“). */
export async function terminSpeichern(_vorher: TerminStand, form: FormData): Promise<TerminStand> {
  await angemeldet();
  const text = (name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);
  const kalender = text("kalender", 20);
  const daten: TerminDaten = {
    titel: text("titel", 300),
    ort: text("ort", 300),
    notizen: text("notizen", 10_000),
    ganztags: form.get("ganztags") === "on",
    startTag: text("startTag", 10),
    startZeit: text("startZeit", 5) || "00:00",
    endeTag: text("endeTag", 10),
    endeZeit: text("endeZeit", 5) || "00:00",
  };
  if (!istKalender(kalender)) return { fehler: "Bitte einen Kalender wählen." };
  if (!istTag(daten.startTag) || !istTag(daten.endeTag)) return { fehler: "Bitte Beginn und Ende als Datum angeben." };
  if (!daten.ganztags && (!istZeit(daten.startZeit) || !istZeit(daten.endeZeit))) {
    return { fehler: "Bitte die Uhrzeiten angeben, z. B. 10:00." };
  }
  const fehler = terminPruefen(daten);
  if (fehler) return { fehler };

  // Bearbeiten: bisheriger Kalender + Datei + Versionsstand (etag)
  const altKal = form.get("altKalender");
  const altDatei = form.get("altDatei");
  try {
    if (altDatei) {
      if (!istKalender(altKal) || !istDatei(altDatei)) return { fehler: "Ungültiger Termin." };
      await terminAendern(altKal, altDatei, String(form.get("etag") ?? ""), kalender, daten);
    } else {
      // Aus einer Mail: Verweis auf die Mail im Termin speichern
      const mailId = text("mailId", 998);
      const mailUid = Number(form.get("mailUid"));
      const mail: TerminMail | undefined =
        mailId && Number.isInteger(mailUid) && mailUid > 0 ? { messageId: mailId, ordner: text("mailOrdner", 500), uid: mailUid } : undefined;
      await terminAnlegen(kalender, daten, mail);
    }
  } catch (e) {
    return { fehler: e instanceof TerminGeaendert ? `${e.message} Bitte die Seite neu laden.` : `Speichern fehlgeschlagen: ${e instanceof Error ? e.message : e}` };
  }
  revalidatePath("/kalender");
  redirect(`/kalender?${new URLSearchParams({ ansicht: "woche", datum: daten.startTag })}`);
}

/** Termin löschen (nach Rückfrage im Browser). */
export async function terminLoeschenAktion(form: FormData) {
  await angemeldet();
  const kalender = form.get("kalender");
  const datei = form.get("datei");
  const datum = form.get("datum");
  if (!istKalender(kalender) || !istDatei(datei)) throw new Error("Ungültiger Termin");
  const zurueck = { ansicht: "woche", ...(istTag(datum) ? { datum } : {}) };
  let fehler = "";
  try {
    await terminLoeschen(kalender, datei, String(form.get("etag") ?? ""));
  } catch (e) {
    fehler = e instanceof Error ? e.message : String(e);
  }
  revalidatePath("/kalender");
  redirect(`/kalender?${new URLSearchParams(fehler ? { ...zurueck, fehler } : { ...zurueck, geloescht: "1" })}`);
}
