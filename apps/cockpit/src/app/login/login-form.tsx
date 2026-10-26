"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormError, handleForm } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

type Step = "password" | "totp" | "backup";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("password");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function goTo(path: string) {
    router.replace(path);
    router.refresh();
  }

  function onPassword(form: FormData) {
    setError(null);
    startTransition(async () => {
      const { data, error } = await authClient.signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (error) return setError(authErrorMessage(error));
      // Mit eingerichteter Zwei-Faktor-Anmeldung fragt der Server jetzt nach dem Code.
      if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) return setStep("totp");
      goTo("/einrichtung");
    });
  }

  function onCode(form: FormData) {
    setError(null);
    const code = String(form.get("code")).replace(/\s/g, "");
    const trustDevice = form.get("trustDevice") === "on";
    startTransition(async () => {
      const { error } =
        step === "totp"
          ? await authClient.twoFactor.verifyTotp({ code, trustDevice })
          : await authClient.twoFactor.verifyBackupCode({ code, trustDevice });
      if (error) {
        if (error.code === "INVALID_TWO_FACTOR_COOKIE") setStep("password");
        return setError(authErrorMessage(error));
      }
      goTo("/");
    });
  }

  if (step === "password") {
    return (
      <form onSubmit={handleForm(onPassword)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Passwort</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Wird geprüft …" : "Weiter"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleForm(onCode)} className="grid gap-4" key={step}>
      <div className="grid gap-2">
        <Label htmlFor="code">
          {step === "totp" ? "Code aus der Authenticator-App" : "Notfall-Code"}
        </Label>
        <Input
          id="code"
          name="code"
          required
          autoFocus
          autoComplete="one-time-code"
          {...(step === "totp"
            ? { inputMode: "numeric", pattern: "[0-9 ]{6,7}", placeholder: "123 456", maxLength: 7 }
            : { placeholder: "xxxxx-xxxxx" })}
          className="text-center text-lg tracking-widest"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="trustDevice" className="size-4 accent-current" />
        Diesem Gerät 30 Tage vertrauen
      </label>
      <FormError message={error} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Wird geprüft …" : "Anmelden"}
      </Button>
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={() => {
          setError(null);
          setStep(step === "totp" ? "backup" : "totp");
        }}
      >
        {step === "totp" ? "Handy nicht da? Notfall-Code benutzen" : "Zurück zum App-Code"}
      </Button>
    </form>
  );
}
