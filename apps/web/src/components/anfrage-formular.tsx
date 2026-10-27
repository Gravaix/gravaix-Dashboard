"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { anfrageSenden, type AnfrageStand } from "@/app/kontakt/actions";
import { cn } from "@/lib/cn";

const FELD =
  "h-12 w-full rounded-xl border bg-card px-4 text-base outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand/20";

function Auswahl({ name, titel, optionen, wert }: { name: string; titel: string; optionen: string[]; wert?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{titel}</legend>
      <div className="flex flex-wrap gap-2">
        {optionen.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="radio" name={name} value={o} defaultChecked={wert === o} className="peer sr-only" />
            <span className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm transition-colors peer-checked:border-dunkel peer-checked:bg-dunkel peer-checked:text-white peer-focus-visible:ring-3 peer-focus-visible:ring-brand/40 hover:border-foreground/40">
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function AnfrageFormular() {
  const [stand, senden, laeuft] = useActionState<AnfrageStand, FormData>(anfrageSenden, {});
  // Zeitpunkt, ab dem das Formular sichtbar war (Spam-Schutz, siehe actions.ts)
  const start = useRef(0);
  useEffect(() => {
    start.current = Date.now();
  }, []);
  const w = stand.felder ?? {};

  if (stand.ok) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center sm:p-12" role="status">
        <CheckCircle2 className="mx-auto size-10 text-brand-dunkel" />
        <h2 className="mt-4 font-display text-2xl">Vielen Dank für Ihre Anfrage!</h2>
        <p className="mt-3 text-muted-foreground">Wir melden uns innerhalb von 24 Stunden mit einem individuellen Angebot bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-6 rounded-3xl border bg-card p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const daten = new FormData(e.currentTarget);
        daten.set("t", String(start.current));
        startTransition(() => senden(daten));
      }}
    >
      {/* Falle für Bots: für Menschen unsichtbar */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Name *
          <input name="name" required autoComplete="name" defaultValue={w.name} className={FELD} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Firma
          <input name="firma" autoComplete="organization" defaultValue={w.firma} className={FELD} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          E-Mail *
          <input name="email" type="email" required autoComplete="email" defaultValue={w.email} className={FELD} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Telefon
          <input name="telefon" type="tel" autoComplete="tel" defaultValue={w.telefon} className={FELD} />
        </label>
      </div>

      <Auswahl name="art" titel="Ich frage an als" optionen={["Unternehmen", "Verein / Organisation", "Privatkunde"]} wert={w.art} />
      <Auswahl name="leistung" titel="Gewünschte Leistung" optionen={["Lasergravur", "Zuschnitt", "Druck", "Stick", "Noch offen"]} wert={w.leistung} />
      <Auswahl name="stueckzahl" titel="Stückzahl (ca.)" optionen={["Einzelstück", "10–50", "50–200", "200+", "Noch offen"]} wert={w.stueckzahl} />

      <label className="grid gap-1.5 text-sm font-medium">
        Ihr Vorhaben *
        <textarea
          name="nachricht"
          required
          rows={5}
          defaultValue={w.nachricht}
          placeholder="z. B. 50 Kugelschreiber mit unserem Logo, gebraucht bis Ende November"
          className={cn(FELD, "h-auto py-3 font-normal")}
        />
      </label>

      <div className="grid gap-3 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="vorschau" defaultChecked className="mt-0.5 size-4 accent-[var(--brand-dunkel)]" />
          Ich wünsche eine digitale Vorschau vor der Produktion
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="einwilligung" required className="mt-0.5 size-4 accent-[var(--brand-dunkel)]" />
          <span className="text-muted-foreground">
            Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden. Mehr dazu in der{" "}
            <Link href="/datenschutz" className="underline underline-offset-2 hover:text-foreground">
              Datenschutzerklärung
            </Link>
            . *
          </span>
        </label>
      </div>

      {stand.fehler && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {stand.fehler}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">* Pflichtfelder</span>
        <button
          type="submit"
          disabled={laeuft}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-dunkel px-7 text-sm font-medium text-white hover:bg-brand-dunkel disabled:opacity-60"
        >
          {laeuft ? "Wird gesendet …" : "Anfrage senden"}
          <Send className="size-4" />
        </button>
      </div>
    </form>
  );
}
