"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import type { AuftragStand } from "@/app/(cockpit)/auftraege/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SPALTEN } from "@/lib/auftrag/status";

export type AuftragWerte = {
  id?: number;
  titel: string;
  kunde: string;
  kundeEmail: string;
  deadline: string; // JJJJ-MM-TT oder leer
  status: string;
  notizen: string;
};

const FELD = "h-10";

/** Formular zum Anlegen und Bearbeiten eines Auftrags. */
export function AuftragFormular({
  aktion,
  werte,
  knopf,
}: {
  aktion: (vorher: AuftragStand, form: FormData) => Promise<AuftragStand>;
  werte: AuftragWerte;
  knopf: string;
}) {
  const [stand, ausfuehren, laeuft] = useActionState(aktion, {});

  return (
    <form
      className="grid max-w-2xl gap-4"
      // Selbst abschicken statt action={…}: sonst leert React das Formular auch bei einem Fehler.
      onSubmit={(e) => {
        e.preventDefault();
        const daten = new FormData(e.currentTarget);
        startTransition(() => ausfuehren(daten));
      }}
    >
      {werte.id && <input type="hidden" name="id" value={werte.id} />}

      <div className="grid gap-1.5">
        <Label htmlFor="titel">Was?</Label>
        <Input id="titel" name="titel" defaultValue={werte.titel} required autoFocus={!werte.id} className={FELD} placeholder="z. B. 50 Kugelschreiber mit Logo" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="kunde">Kunde</Label>
          <Input id="kunde" name="kunde" defaultValue={werte.kunde} required className={FELD} placeholder="Firma oder Name" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="kundeEmail">E-Mail des Kunden</Label>
          <Input id="kundeEmail" name="kundeEmail" type="email" defaultValue={werte.kundeEmail} className={FELD} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" name="deadline" type="date" defaultValue={werte.deadline} className={FELD} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={werte.status} className="h-10 rounded-lg border bg-background px-3 text-sm">
            {SPALTEN.map((s) => (
              <option key={s.status} value={s.status}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="notizen">Notizen</Label>
        <textarea
          id="notizen"
          name="notizen"
          defaultValue={werte.notizen}
          rows={6}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          placeholder="Material, Gravurtext, Absprachen …"
        />
      </div>

      {stand.fehler && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {stand.fehler}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={laeuft}>
          {laeuft ? "Speichert …" : knopf}
        </Button>
        <Button type="button" variant="ghost" render={<Link href="/auftraege" />}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
