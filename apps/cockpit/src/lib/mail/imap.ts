import "server-only";
import { ImapFlow, type FetchMessageObject, type MessageStructureObject } from "imapflow";
import { simpleParser, type ParsedMail } from "mailparser";

// Zugriff aufs IONOS-Postfach. Das Postfach bleibt die Quelle der Wahrheit:
// Ordner werden nur lesend geöffnet (EXAMINE), dabei ändert sich nichts –
// auch der Gelesen-Status bleibt, wie er ist.

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

async function mitOrdner<T>(pfad: string, fn: (client: ImapFlow) => Promise<T>): Promise<T> {
  return mitPostfach(async (client) => {
    const lock = await client.getMailboxLock(pfad, { readOnly: true });
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

/** Neueste Mails zuerst, seitenweise (Seite 1 = die neuesten 50). */
export async function mailListe(pfad: string, seite = 1) {
  return mitOrdner(pfad, async (c) => {
    const gesamt = c.mailbox ? c.mailbox.exists : 0;
    const bis = gesamt - (seite - 1) * PRO_SEITE;
    if (bis < 1) return { mails: [] as MailKopf[], gesamt, seiten: Math.max(1, Math.ceil(gesamt / PRO_SEITE)) };
    const von = Math.max(1, bis - PRO_SEITE + 1);
    const mails: MailKopf[] = [];
    for await (const m of c.fetch(`${von}:${bis}`, { uid: true, envelope: true, flags: true, internalDate: true, bodyStructure: true })) {
      mails.push(zuKopf(m));
    }
    mails.sort((a, b) => (b.datum?.getTime() ?? 0) - (a.datum?.getTime() ?? 0) || b.uid - a.uid);
    return { mails, gesamt, seiten: Math.max(1, Math.ceil(gesamt / PRO_SEITE)) };
  });
}

// ---------------------------------------------------------------------------
// Einzelne Mail

async function ladeMail(pfad: string, uid: number): Promise<{ kopf: MailKopf; mail: ParsedMail } | null> {
  return mitOrdner(pfad, async (c) => {
    const m = await c.fetchOne(String(uid), { uid: true, envelope: true, flags: true, internalDate: true, bodyStructure: true, source: true }, { uid: true });
    if (!m || !m.source) return null;
    return { kopf: zuKopf(m), mail: await simpleParser(m.source) };
  });
}

export type Anhang = { nr: number; name: string; typ: string; groesse: number };

export type MailInhalt = MailKopf & {
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
