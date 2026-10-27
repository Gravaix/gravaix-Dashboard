import "server-only";
import { DAVClient, type DAVCalendar } from "tsdav";
import { KALENDER } from "@/lib/kalender/liste";

// Zugriff auf die Kalender in Radicale (cal.gravaix.de) per CalDAV – dieselben
// Kalender, die Apple Kalender auf iPhone und Mac anzeigt. Das Cockpit spricht
// Radicale direkt im Docker-Netz an (http://radicale:5232), nicht übers Internet.

export class KalenderNichtEingerichtet extends Error {}

export { KALENDER, type KalenderSlug } from "@/lib/kalender/liste";

function config() {
  const username = process.env.RADICALE_USER;
  const password = process.env.RADICALE_PASSWORD;
  if (!username || !password) throw new KalenderNichtEingerichtet("RADICALE_USER/RADICALE_PASSWORD fehlen");
  return { serverUrl: process.env.RADICALE_URL || "http://radicale:5232", credentials: { username, password } };
}

export async function verbinden() {
  const { serverUrl, credentials } = config();
  const client = new DAVClient({ serverUrl, credentials, authMethod: "Basic", defaultAccountType: "caldav" });
  await client.login();
  return client;
}

/** Passt ein Kalender auf dem Server zu einem der festen Kalender? Erst über die Adresse, sonst über den Namen. */
export function finde(liste: DAVCalendar[], k: (typeof KALENDER)[number]) {
  return (
    liste.find((c) => c.url.replace(/\/$/, "").endsWith(`/${k.slug}`)) ??
    liste.find((c) => typeof c.displayName === "string" && c.displayName.trim().toLowerCase() === k.name.toLowerCase())
  );
}

export type KalenderEintrag = (typeof KALENDER)[number] & { vorhanden: boolean; url?: string };

/** Welche der festen Kalender gibt es schon auf dem Server? */
export async function kalenderStand(): Promise<KalenderEintrag[]> {
  const client = await verbinden();
  const liste = await client.fetchCalendars();
  return KALENDER.map((k) => {
    const gefunden = finde(liste, k);
    return { ...k, vorhanden: !!gefunden, url: gefunden?.url };
  });
}

/** Fehlende Kalender anlegen. Vorhandene bleiben unangetastet – es wird nie etwas gelöscht. */
export async function kalenderEinrichten() {
  const client = await verbinden();
  const liste = await client.fetchCalendars();
  const home = client.account?.homeUrl;
  if (!home) throw new Error("Kalender-Ordner des Nutzers nicht gefunden");

  const angelegt: string[] = [];
  for (const k of KALENDER) {
    if (finde(liste, k)) continue;
    const antwort = await client.makeCalendar({
      url: `${home.replace(/\/?$/, "/")}${k.slug}/`,
      props: {
        "d:displayname": k.name,
        "ca:calendar-color": `${k.farbe}FF`, // Apple erwartet #RRGGBBAA
        "c:calendar-description": k.zweck,
        "c:supported-calendar-component-set": { "c:comp": { _attributes: { name: "VEVENT" } } },
      },
    });
    if (antwort.some((r) => !r.ok)) {
      throw new Error(`Kalender „${k.name}“ ließ sich nicht anlegen (${antwort.map((r) => r.status).join(", ")})`);
    }
    angelegt.push(k.name);
  }
  return angelegt;
}
