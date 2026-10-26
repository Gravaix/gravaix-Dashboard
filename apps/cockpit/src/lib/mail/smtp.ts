import "server-only";
import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { MailNichtEingerichtet, beantwortetMarkieren, gesendetAblegen, mailLesen } from "@/lib/mail/imap";

// Versand über das IONOS-Postfach (SMTP). Wird nur von der Server-Aktion „Senden“
// aufgerufen, also erst nachdem Celiano im Cockpit ausdrücklich bestätigt hat.

function config() {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASSWORD;
  if (!user || !pass) throw new MailNichtEingerichtet("MAIL_USER/MAIL_PASSWORD fehlen");
  const port = Number(process.env.MAIL_SMTP_PORT || 465);
  return {
    absender: { name: process.env.MAIL_ABSENDER_NAME || "Gravaix Lasermanufaktur", address: user },
    transport: {
      host: process.env.MAIL_SMTP_HOST || "smtp.ionos.de",
      port,
      secure: port === 465, // 465 = direkt verschlüsselt, 587 = STARTTLS
      requireTLS: true,
      auth: { user, pass },
      connectionTimeout: 15_000,
    },
  };
}

export type NeueMail = {
  an: string[];
  cc: string[];
  betreff: string;
  text: string;
  /** Antwort auf diese Mail: setzt In-Reply-To/References, damit Apple Mail den Verlauf erkennt. */
  antwortAuf?: { pfad: string; uid: number };
};

export async function mailSenden(neu: NeueMail) {
  const { absender, transport } = config();

  let bezug: { inReplyTo?: string; references?: string[] } = {};
  if (neu.antwortAuf) {
    const original = await mailLesen(neu.antwortAuf.pfad, neu.antwortAuf.uid);
    if (original?.messageId) {
      bezug = { inReplyTo: original.messageId, references: [...original.referenzen, original.messageId] };
    }
  }

  // Die Mail einmal fertig bauen: genau diese Bytes werden gesendet und in „Gesendet“ abgelegt.
  const roh = await new MailComposer({
    from: absender,
    to: neu.an,
    cc: neu.cc,
    subject: neu.betreff,
    text: neu.text,
    date: new Date(),
    ...bezug,
  })
    .compile()
    .build();

  await nodemailer.createTransport(transport).sendMail({
    envelope: { from: absender.address, to: [...neu.an, ...neu.cc] },
    raw: roh,
  });

  // Ab hier ist die Mail raus. Fehler beim Ablegen dürfen nicht so aussehen, als wäre sie nicht gesendet.
  const hinweise: string[] = [];
  await gesendetAblegen(roh).catch(() => hinweise.push("Die Mail ist gesendet, liegt aber nicht im Ordner „Gesendet“."));
  if (neu.antwortAuf) {
    await beantwortetMarkieren(neu.antwortAuf.pfad, neu.antwortAuf.uid).catch(() => {});
  }
  return { hinweise };
}
