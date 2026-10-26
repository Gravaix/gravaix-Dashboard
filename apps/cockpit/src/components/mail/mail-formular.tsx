"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Send, TriangleAlert } from "lucide-react";
import { adressVorschlaege, senden, type SendenStand } from "@/app/(cockpit)/mails/actions";
import { AdressFeld, type Vorschlag } from "@/components/mail/adress-feld";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Vorlage = { an: string; cc: string; betreff: string; text: string; ordner?: string; uid?: number };

/**
 * Mail schreiben. Senden geht nur in zwei Schritten: „Senden …“ zeigt erst eine
 * Zusammenfassung, raus geht die Mail erst mit „Ja, jetzt senden“.
 */
export function MailFormular({ vorlage }: { vorlage: Vorlage }) {
  const [stand, aktion, laeuft] = useActionState<SendenStand, FormData>(senden, {});
  const [pruefen, setPruefen] = useState<{ an: string; betreff: string } | null>(null);
  const [vorschlaege, setVorschlaege] = useState<Vorschlag[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Adressvorschläge im Hintergrund laden – das Formular ist sofort benutzbar.
  useEffect(() => {
    adressVorschlaege().then(setVorschlaege, () => {});
  }, []);

  function zurPruefung() {
    const form = formRef.current;
    if (!form?.reportValidity()) return;
    const daten = new FormData(form);
    const cc = String(daten.get("cc") ?? "").trim();
    setPruefen({
      an: [String(daten.get("an") ?? "").trim(), cc && `Cc: ${cc}`].filter(Boolean).join(" · "),
      betreff: String(daten.get("betreff") ?? ""),
    });
  }

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      // Selbst abschicken statt action={…}: sonst leert React das Formular auch dann,
      // wenn das Senden fehlschlägt, und der getippte Text wäre weg.
      onSubmit={(e) => {
        e.preventDefault();
        const daten = new FormData(e.currentTarget);
        startTransition(() => aktion(daten));
      }}
      onChange={() => setPruefen(null)}
      // Enter in einem Feld darf nie direkt senden – nur der Knopf „Ja, jetzt senden“.
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault();
      }}
    >
      {vorlage.ordner && <input type="hidden" name="ordner" value={vorlage.ordner} />}
      {vorlage.uid && <input type="hidden" name="uid" value={vorlage.uid} />}

      <div className="grid gap-1.5">
        <Label htmlFor="an">An</Label>
        <AdressFeld
          id="an"
          name="an"
          defaultValue={vorlage.an}
          required
          placeholder="Name oder Adresse eintippen …"
          vorschlaege={vorschlaege}
          onAuswahl={() => setPruefen(null)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="cc">Cc</Label>
        <AdressFeld id="cc" name="cc" defaultValue={vorlage.cc} vorschlaege={vorschlaege} onAuswahl={() => setPruefen(null)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="betreff">Betreff</Label>
        <Input id="betreff" name="betreff" defaultValue={vorlage.betreff} required className="h-10" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="text">Nachricht</Label>
        <textarea
          id="text"
          name="text"
          defaultValue={vorlage.text}
          rows={14}
          autoFocus
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>

      {stand.fehler && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {stand.fehler}
        </p>
      )}

      {pruefen ? (
        <div className="grid gap-3 rounded-xl border border-brand/40 bg-muted p-4 text-sm">
          <p className="flex items-start gap-2 font-medium">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand" />
            Diese Mail jetzt wirklich senden?
          </p>
          <dl className="grid gap-1">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-muted-foreground">An</dt>
              <dd className="min-w-0 break-words">{pruefen.an}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-muted-foreground">Betreff</dt>
              <dd className="min-w-0 break-words">{pruefen.betreff}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={laeuft}>
              <Send />
              {laeuft ? "Wird gesendet …" : "Ja, jetzt senden"}
            </Button>
            <Button type="button" variant="ghost" disabled={laeuft} onClick={() => setPruefen(null)}>
              Abbrechen
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button type="button" onClick={zurPruefung}>
            <Send />
            Senden …
          </Button>
        </div>
      )}
    </form>
  );
}
