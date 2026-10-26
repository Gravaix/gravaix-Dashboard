import { MailNichtEingerichtet } from "@/lib/mail/imap";

export function MailFehler({ fehler }: { fehler: unknown }) {
  if (fehler instanceof MailNichtEingerichtet) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        Das Postfach ist noch nicht verbunden. Auf dem Server fehlen in <code>infra/.env</code> die Werte{" "}
        <code>MAIL_USER</code> und <code>MAIL_PASSWORD</code> (Anleitung: <code>docs/mails.md</code>).
      </div>
    );
  }
  const text = fehler instanceof Error ? fehler.message : String(fehler);
  const login = /auth|login|credential/i.test(text);
  return (
    <div role="alert" className="rounded-xl bg-destructive/10 p-6 text-sm text-destructive">
      {login
        ? "Anmeldung am Postfach fehlgeschlagen. Stimmt das Mail-Passwort in infra/.env?"
        : "Das Postfach ist gerade nicht erreichbar. Bitte gleich nochmal versuchen."}
      <p className="mt-2 font-mono text-xs opacity-70">{text}</p>
    </div>
  );
}
