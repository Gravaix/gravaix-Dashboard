import { KalenderNichtEingerichtet } from "@/lib/kalender/caldav";

export function KalenderFehler({ fehler }: { fehler: unknown }) {
  if (fehler instanceof KalenderNichtEingerichtet) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        Der Kalender ist noch nicht verbunden. Auf dem Server fehlen in <code>infra/.env</code> die Werte{" "}
        <code>RADICALE_USER</code> und <code>RADICALE_PASSWORD</code> (Anleitung: <code>docs/kalender.md</code>).
      </div>
    );
  }
  const text = fehler instanceof Error ? fehler.message : String(fehler);
  const login = /401|unauthori[sz]ed|auth/i.test(text);
  return (
    <div role="alert" className="rounded-xl bg-destructive/10 p-6 text-sm text-destructive">
      {login
        ? "Anmeldung am Kalender fehlgeschlagen. Stimmt das Kalender-Passwort in infra/.env?"
        : "Der Kalender-Server ist gerade nicht erreichbar. Bitte gleich nochmal versuchen."}
      <p className="mt-2 font-mono text-xs opacity-70">{text}</p>
    </div>
  );
}
