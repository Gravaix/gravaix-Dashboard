import "server-only";
import { ImapFlow, type FetchMessageObject, type MessageStructureObject } from "imapflow";
import { simpleParser, type ParsedMail } from "mailparser";

// Zugriff aufs IONOS-Postfach. Das Postfach bleibt die Quelle der Wahrheit:
// Ordner werden zum Lesen nur lesend geöffnet (EXAMINE). Das Einzige, was das
// Cockpit ändert, sind Markierungen (gelesen, beantwortet), das Verschieben in
// andere Ordner und das Ablegen gesendeter Mails in „Gesendet“ – gelöscht wird nie etwas.

export class MailNichtEingerichtet extends Error {}

function config() {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASSWORD;
  if (!user || !pass) throw new MailNichtEingerichtet("MAIL_USER/MAIL_PASSWORD fehlen");
  return {
    host: process.env.MAIL_IMAP_HOST || "imap.ionos.de",
    port: Number(process.env.MAIL_IMAP_PORT || 993),
    secure: process.env.MAIL_IMAP_TLS !== "false",
    auth: { user, pass },
  };
}

async function mitPostfach<T>(fn: (client: ImapFlow) => Promise<T>): Promise<T> {
  const client = new ImapFlow({ ...config(), logger: false, connectionTimeout: 15_000 });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.logout().catch(() => client.close());
  }
}

async function mitOrdner<T>(pfad: string, fn: (client: ImapFlow) => Promise<T>, schreiben = false): Promise<T> {
  return mitPostfach(async (client) => {
    const lock = await client.getMailboxLock(pfad, { readOnly: !schreiben });
    try {
      return await fn(client);
    } finally {
      lock.release();
    }
  });
}

// ---------------------------------------------------------------------------
// Ordner

export type Ordner = {
  pfad: string;
  name: string;
  tiefe: number;
  ungelesen: number;
  anzahl: number;
  spezial?: string;
};

const SPEZIAL_NAMEN: Record<string, string> = {
  "\\Inbox": "Posteingang",
  "\\Sent": "Gesendet",
  "\\Drafts": "Entwürfe",
  "\\Junk": "Spam",
  "\\Trash": "Papierkorb",
  "\\Archive": "Archiv",
};
// Posteingang zuerst, dann eigene Ordner (1, 2, 3 …), System-Ordner am Ende.
const SPEZIAL_REIHENFOLGE = ["\\Inbox", "", "\\Drafts", "\\Sent", "\\Archive", "\\Junk", "\\Trash"];

export async function ordnerListe(): Promise<Ordner[]> {
  const liste = await mitPostfach((c) => c.list({ statusQuery: { messages: true, unseen: true } }));
  return liste
    .filter((o) => !o.flags.has("\\Noselect") && !o.flags.has("\\NonExistent"))
    .map((o) => ({
      pfad: o.path,
      name: (o.specialUse && SPEZIAL_NAMEN[o.specialUse]) || o.name,
      tiefe: o.parent.length,
      ungelesen: o.status?.unseen ?? 0,
      anzahl: o.status?.messages ?? 0,
      spezial: o.specialUse,
    }))
    .sort((a, b) => {
      const ra = SPEZIAL_REIHENFOLGE.indexOf(a.spezial ?? "");
      const rb = SPEZIAL_REIHENFOLGE.indexOf(b.spezial ?? "");
      if (ra !== rb) return ra - rb;
      return a.pfad.localeCompare(b.pfad, "de", { numeric: true, sensitivity: "base" });
    });
}

// ---------------------------------------------------------------------------
// Mail-Liste

export type Adresse = { name?: string; adresse?: string };

export type MailKopf = {
  uid: number;
  betreff: string;
  von: Adresse[];
  an: Adresse[];
  datum: Date | null;
  gelesen: boolean;
  markiert: boolean;
  beantwortet: boolean;
  hatAnhang: boolean;
};

export const PRO_SEITE = 50;

function adressen(liste?: { name?: string; address?: string }[]): Adresse[] {
  return (liste ?? []).map((a) => ({ name: a.name || undefined, adresse: a.address || undefined }));
}

function hatAnhang(teil?: MessageStructureObject): boolean {
  if (!teil) return false;
  if (teil.disposition === "attachment") return true;
  return (teil.childNodes ?? []).some(hatAnhang);
}

function zuKopf(m: FetchMessageObject): MailKopf {
  const datum = m.envelope?.date ?? m.internalDate;
  return {
    uid: m.uid,
    betreff: m.envelope?.subject || "(kein Betreff)",
    von: adressen(m.envelope?.from),
    an: adressen(m.envelope?.to),
    datum: datum ? new Date(datum) : null,
    gelesen: m.flags?.has("\\Seen") ?? false,
    markiert: m.flags?.has("\\Flagged") ?? false,
    beantwortet: m.flags?.has("\\Answered") ?? false,
    hatAnhang: hatAnhang(m.bodyStructure),
  };
}

const KOPF_FELDER = { uid: true, envelope: true, flags: true, internalDate: true, bodyStructure: true } as const;

function sortieren(mails: MailKopf[]) {
  return mails.sort((a, b) => (b.datum?.getTime() ?? 0) - (a.datum?.getTime() ?? 0) || b.uid - a.uid);
}

/**
 * Neueste Mails zuerst, seitenweise (Seite 1 = die neuesten 50).
 * Mit Suchbegriff: nur Mails im Ordner, die ihn in Absender, Empfänger, Betreff oder Text enthalten.
 */
export async function mailListe(pfad: string, seite = 1, suche = "") {
  return mitOrdner(pfad, async (c) => {
    if (suche) {
      const treffer = (await c.search({ text: suche }, { uid: true })) || [];
      treffer.sort((a, b) => b - a); // höhere UID = später angekommen
      const gesamt = treffer.length;
      const seiten = Math.max(1, Math.ceil(gesamt / PRO_SEITE));
      const uids = treffer.slice((seite - 1) * PRO_SEITE, seite * PRO_SEITE);
      const mails: MailKopf[] = [];
      if (uids.length) {
        for await (const m of c.fetch(uids.join(","), KOPF_FELDER, { uid: true })) mails.push(zuKopf(m));
      }
      return { mails: sortieren(mails), gesamt, seiten };
    }

    const gesamt = c.mailbox ? c.mailbox.exists : 0;
    const seiten = Math.max(1, Math.ceil(gesamt / PRO_SEITE));
    const bis = gesamt - (seite - 1) * PRO_SEITE;
    if (bis < 1) return { mails: [] as MailKopf[], gesamt, seiten };
    const von = Math.max(1, bis - PRO_SEITE + 1);
    const mails: MailKopf[] = [];
    for await (const m of c.fetch(`${von}:${bis}`, KOPF_FELDER)) mails.push(zuKopf(m));
    return { mails: sortieren(mails), gesamt, seiten };
  });
}

/** Gelesen-Status im Postfach setzen – gilt danach auch in Apple Mail und am iPhone. */
export async function gelesenSetzen(pfad: string, uid: number, gelesen: boolean) {
  await mitOrdner(
    pfad,
    async (c) => {
      if (gelesen) await c.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
      else await c.messageFlagsRemove(String(uid), ["\\Seen"], { uid: true });
    },
    true,
  );
}

// ---------------------------------------------------------------------------
// Einzelne Mail

async function ladeMail(pfad: string, uid: number): Promise<{ kopf: MailKopf; mail: ParsedMail } | null> {
  return mitOrdner(pfad, async (c) => {
    const m = await c.fetchOne(String(uid), { ...KOPF_FELDER, source: true }, { uid: true });
    if (!m || !m.source) return null;
    return { kopf: zuKopf(m), mail: await simpleParser(m.source) };
  });
}

export type Anhang = { nr: number; name: string; typ: string; groesse: number };

export type MailInhalt = MailKopf & {
  messageId?: string;
  referenzen: string[];
  cc: Adresse[];
  antwortAn: Adresse[];
  html: string | null;
  text: string | null;
  anhaenge: Anhang[];
};

function zuAdressen(feld: ParsedMail["to"]): Adresse[] {
  const liste = Array.isArray(feld) ? feld : feld ? [feld] : [];
  return liste.flatMap((a) => a.value.map((v) => ({ name: v.name || undefined, adresse: v.address || undefined })));
}

export async function mailLesen(pfad: string, uid: number): Promise<MailInhalt | null> {
  const geladen = await ladeMail(pfad, uid);
  if (!geladen) return null;
  const { kopf, mail } = geladen;

  // Eingebettete Bilder (cid:) direkt ins HTML legen, damit nichts von außen nachgeladen werden muss.
  let html = typeof mail.html === "string" ? mail.html : null;
  if (html) {
    for (const a of mail.attachments) {
      if (a.cid && a.contentType.startsWith("image/") && a.size < 5_000_000) {
        const data = `data:${a.contentType};base64,${a.content.toString("base64")}`;
        html = html.replaceAll(`cid:${a.cid}`, data);
      }
    }
  }

  return {
    ...kopf,
    messageId: mail.messageId,
    referenzen: typeof mail.references === "string" ? [mail.references] : (mail.references ?? []),
    cc: zuAdressen(mail.cc),
    antwortAn: zuAdressen(mail.replyTo),
    html,
    text: mail.text ?? null,
    anhaenge: mail.attachments
      .map((a, nr) => ({ a, nr }))
      .filter(({ a }) => !(a.related && a.cid)) // eingebettete Bilder nicht als Anhang zeigen
      .map(({ a, nr }) => ({ nr, name: a.filename || `anhang-${nr + 1}`, typ: a.contentType, groesse: a.size })),
  };
}

export async function anhangLaden(pfad: string, uid: number, nr: number) {
  const geladen = await ladeMail(pfad, uid);
  const a = geladen?.mail.attachments[nr];
  if (!a) return null;
  return { name: a.filename || `anhang-${nr + 1}`, typ: a.contentType, inhalt: a.content };
}

/** Ziele fürs Verschieben: alle Ordner außer Papierkorb (Löschen gibt es im Cockpit nicht). */
export function verschiebeZiele(ordner: Ordner[], aktuell: string) {
  return ordner.filter((o) => o.pfad !== aktuell && o.spezial !== "\\Trash");
}

/** Der Ordner „Erledigt“ (bei Gravaix: 1 Kunden & Anfragen/Erledigt). */
export function erledigtOrdner(ordner: Ordner[]) {
  return ordner.find((o) => /(^|\/)erledigt$/i.test(o.pfad));
}

/** Mail in einen anderen Ordner verschieben. Gibt die neue UID im Zielordner zurück (falls der Server sie meldet). */
export async function verschieben(pfad: string, uid: number, ziel: string): Promise<number | undefined> {
  return mitOrdner(
    pfad,
    async (c) => {
      const ergebnis = await c.messageMove(String(uid), ziel, { uid: true });
      if (!ergebnis) throw new Error("Mail nicht gefunden – vielleicht schon verschoben?");
      return ergebnis.uidMap?.get(uid);
    },
    true,
  );
}

// ---------------------------------------------------------------------------
// Verlauf (wie die Unterhaltungsansicht in Outlook)

async function gesendetPfad(c: ImapFlow) {
  const liste = await c.list();
  return (
    liste.find((o) => o.specialUse === "\\Sent")?.path ??
    liste.find((o) => /^(gesendet|gesendete objekte|sent|sent items)$/i.test(o.name))?.path
  );
}

export type VerlaufEintrag = MailKopf & { pfad: string; vorschau: string };

const MAX_VERLAUF = 30;

/** Nur den neuen Teil einer Mail: ohne Zitate („> …“) und ohne das, was ab „Am … schrieb“ / „Von:“ folgt. */
function vorschau(text: string) {
  const zeilen: string[] = [];
  for (const z of text.split("\n")) {
    if (/^\s*(Am .+ schrieb|On .+ wrote|-{2,}\s*(Original|Ursprüngliche)|Von:\s|From:\s)/i.test(z)) break;
    if (/^\s*>/.test(z)) continue;
    zeilen.push(z);
  }
  const kurz = zeilen.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return kurz.length > 600 ? `${kurz.slice(0, 600)} …` : kurz;
}

/**
 * Alle Mails, die zu dieser Mail gehören – aus dem aktuellen Ordner, dem Posteingang
 * und „Gesendet“. Zusammengehörig sind Mails über ihre Message-ID: Antworten verweisen
 * mit In-Reply-To/References auf frühere Mails. Älteste zuerst.
 */
export async function verlauf(pfad: string, uid: number): Promise<VerlaufEintrag[]> {
  return mitPostfach(async (c) => {
    // 1. Kennungen dieser Mail und aller Mails, auf die sie sich bezieht
    let ids: string[] = [];
    {
      const lock = await c.getMailboxLock(pfad, { readOnly: true });
      try {
        const m = await c.fetchOne(String(uid), { envelope: true, headers: ["references"] }, { uid: true });
        if (!m) return [];
        const bezuege = m.headers?.toString().match(/<[^<>\s]+>/g) ?? [];
        ids = [m.envelope?.messageId, m.envelope?.inReplyTo, ...bezuege].filter((x): x is string => !!x);
      } finally {
        lock.release();
      }
    }
    ids = [...new Set(ids)].slice(-20);
    if (ids.length === 0) return [];

    // 2. In den Ordnern nach diesen Mails und nach Antworten darauf suchen
    const ordner = [...new Set([pfad, "INBOX", await gesendetPfad(c)].filter((x): x is string => !!x))];
    const kopfzeile = (name: string, id: string) => ({ header: { [name]: id } });
    const suche = { or: ids.flatMap((id) => [kopfzeile("message-id", id), kopfzeile("references", id)]) };
    const gefunden = new Map<string, VerlaufEintrag>();

    for (const ordnerPfad of ordner) {
      const lock = await c.getMailboxLock(ordnerPfad, { readOnly: true });
      try {
        const treffer = ((await c.search(suche, { uid: true })) || []).sort((a, b) => b - a).slice(0, MAX_VERLAUF);
        if (treffer.length === 0) continue;
        const koepfe: { kopf: MailKopf; id: string; groesse: number }[] = [];
        for await (const m of c.fetch(treffer.join(","), { ...KOPF_FELDER, size: true }, { uid: true })) {
          const id = m.envelope?.messageId ?? `${ordnerPfad}/${m.uid}`;
          if (!gefunden.has(id)) koepfe.push({ kopf: zuKopf(m), id, groesse: m.size ?? 0 });
        }
        for (const { kopf, id, groesse } of koepfe) {
          let text = "";
          if (groesse < 3_000_000) {
            const roh = await c.fetchOne(String(kopf.uid), { source: true }, { uid: true });
            if (roh && roh.source) text = (await simpleParser(roh.source)).text ?? "";
          }
          gefunden.set(id, { ...kopf, pfad: ordnerPfad, vorschau: vorschau(text) });
        }
      } finally {
        lock.release();
      }
    }

    return [...gefunden.values()]
      .sort((a, b) => (a.datum?.getTime() ?? 0) - (b.datum?.getTime() ?? 0))
      .slice(-MAX_VERLAUF);
  });
}

// ---------------------------------------------------------------------------
// Adressbuch für Vorschläge beim Schreiben

export type Kontakt = { name?: string; adresse: string; anzahl: number; zuletzt: number };

// Automatische Absender nicht vorschlagen.
const KEIN_KONTAKT = /(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notification|benachrichtigung)/i;
const ADRESSBUCH_GUELTIG = 30 * 60_000;
let adressbuch: { stand: number; kontakte: Kontakt[]; laden?: Promise<Kontakt[]> } | null = null;

/**
 * Alle Adressen, mit denen Mails ausgetauscht wurden (Absender, Empfänger, Cc aus allen
 * Ordnern außer Spam/Papierkorb). Häufige und kürzliche zuerst. Wird 30 Minuten im
 * Speicher gehalten, das Zusammensuchen dauert ein paar Sekunden.
 */
export async function adressbuchLaden(): Promise<Kontakt[]> {
  if (adressbuch && Date.now() - adressbuch.stand < ADRESSBUCH_GUELTIG) return adressbuch.kontakte;
  if (adressbuch?.laden) return adressbuch.laden;

  const laden = mitPostfach(async (c) => {
    const eigene = (process.env.MAIL_USER ?? "").toLowerCase();
    const sammlung = new Map<string, Kontakt>();
    const ordner = (await c.list()).filter(
      (o) => !o.flags.has("\\Noselect") && !o.flags.has("\\NonExistent") && o.specialUse !== "\\Junk" && o.specialUse !== "\\Trash",
    );
    for (const o of ordner) {
      const lock = await c.getMailboxLock(o.path, { readOnly: true });
      try {
        if (!c.mailbox || !c.mailbox.exists) continue;
        for await (const m of c.fetch("1:*", { envelope: true, internalDate: true })) {
          const zeit = new Date(m.envelope?.date ?? m.internalDate ?? 0).getTime() || 0;
          for (const a of [...(m.envelope?.from ?? []), ...(m.envelope?.to ?? []), ...(m.envelope?.cc ?? [])]) {
            const adresse = a.address?.trim().toLowerCase();
            if (!adresse || adresse === eigene || KEIN_KONTAKT.test(adresse)) continue;
            const k = sammlung.get(adresse) ?? { adresse, anzahl: 0, zuletzt: 0 };
            k.anzahl++;
            if (zeit >= k.zuletzt) {
              k.zuletzt = zeit;
              if (a.name && a.name !== a.address) k.name = a.name;
            }
            sammlung.set(adresse, k);
          }
        }
      } finally {
        lock.release();
      }
    }
    return [...sammlung.values()].sort((a, b) => b.anzahl - a.anzahl || b.zuletzt - a.zuletzt);
  });

  adressbuch = { stand: adressbuch?.stand ?? 0, kontakte: adressbuch?.kontakte ?? [], laden };
  try {
    const kontakte = await laden;
    adressbuch = { stand: Date.now(), kontakte };
    return kontakte;
  } catch (fehler) {
    adressbuch = adressbuch.kontakte.length ? { stand: adressbuch.stand, kontakte: adressbuch.kontakte } : null;
    throw fehler;
  }
}

/** Nach dem Senden neu laden, damit neue Empfänger gleich vorgeschlagen werden. */
export function adressbuchVeraltet() {
  if (adressbuch) adressbuch.stand = 0;
}

// ---------------------------------------------------------------------------
// Nach dem Senden

/** Selbst gesendete Mail im Ordner „Gesendet“ ablegen (IONOS macht das beim Senden nicht von selbst). */
export async function gesendetAblegen(roh: Buffer) {
  await mitPostfach(async (c) => {
    const gesendet = await gesendetPfad(c);
    if (!gesendet) throw new Error("Ordner „Gesendet“ nicht gefunden");
    await c.append(gesendet, roh, ["\\Seen"]);
  });
}

/** Ursprüngliche Mail als beantwortet markieren (wie Apple Mail, Pfeil-Symbol). */
export async function beantwortetMarkieren(pfad: string, uid: number) {
  await mitOrdner(pfad, (c) => c.messageFlagsAdd(String(uid), ["\\Answered"], { uid: true }), true);
}
