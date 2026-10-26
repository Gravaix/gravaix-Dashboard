"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import QRCode from "qrcode";
import { FormError, handleForm } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

type Setup = { qr: string; uri: string; secret: string; backupCodes: string[] };

export function SetupForm() {
  const router = useRouter();
  const [setup, setSetup] = useState<Setup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPassword(form: FormData) {
    setError(null);
    startTransition(async () => {
      const { data, error } = await authClient.twoFactor.enable({
        password: String(form.get("password")),
      });
      if (error || !data || !("totpURI" in data) || !data.totpURI) return setError(authErrorMessage(error));
      const uri = data.totpURI;
      setSetup({
        uri,
        qr: await QRCode.toDataURL(uri, { margin: 1, width: 240 }),
        secret: new URL(uri).searchParams.get("secret") ?? "",
        backupCodes: data.backupCodes ?? [],
      });
    });
  }

  function onCode(form: FormData) {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: String(form.get("code")).replace(/\s/g, ""),
      });
      if (error) return setError(authErrorMessage(error));
      router.replace("/");
      router.refresh();
    });
  }

  if (!setup) {
    return (
      <form onSubmit={handleForm(onPassword)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">Zur Sicherheit: dein Passwort</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
        </div>
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Wird geprüft …" : "QR-Code anzeigen"}
        </Button>
      </form>
    );
  }

  return (
    <div className="grid gap-5">
      <ol className="grid gap-5 text-sm">
        <li className="grid gap-3">
          <p>
            <strong>1.</strong> QR-Code mit der Authenticator-App scannen. Am iPhone kannst du auch direkt
            auf den Link tippen.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- lokal erzeugtes data:-Bild */}
          <img src={setup.qr} alt="QR-Code für die Authenticator-App" className="mx-auto size-48 rounded-lg bg-white p-2" />
          <a href={setup.uri} className="text-center text-sm underline underline-offset-4">
            In Authenticator-App öffnen
          </a>
          <p className="text-xs text-muted-foreground">
            Oder Schlüssel von Hand eingeben:{" "}
            <code className="break-all rounded bg-muted px-1 py-0.5 font-mono">{setup.secret}</code>
          </p>
        </li>
        <li className="grid gap-2">
          <p>
            <strong>2.</strong> Notfall-Codes sicher aufbewahren (z. B. in deinem Passwort-Manager oder
            ausgedruckt). Jeder Code funktioniert einmal, falls du dein Handy verlierst. Sie werden nur jetzt
            angezeigt.
          </p>
          <ul className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-3 font-mono text-xs">
            {setup.backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </li>
      </ol>
      <form onSubmit={handleForm(onCode)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code">
            <strong>3.</strong> Code aus der App eingeben
          </Label>
          <Input
            id="code"
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="123 456"
            className="text-center text-lg tracking-widest"
          />
        </div>
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Wird geprüft …" : "Einrichtung abschließen"}
        </Button>
      </form>
    </div>
  );
}
