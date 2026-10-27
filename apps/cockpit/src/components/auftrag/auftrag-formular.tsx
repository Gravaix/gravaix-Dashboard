"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { Mail, Paperclip } from "lucide-react";
import type { AuftragStand } from "@/app/(cockpit)/auftraege/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centZuEuro, euroZuCent } from "@/lib/auftrag/geld";
import { SPALTEN } from "@/lib/auftrag/status";
import { KLEINUNTERNEHMER_BIS, STEUER_OPTIONEN, heuteTag, preisRechnung, satzAusText, satzZuText, standardSatz } from "@/lib/auftrag/steuer";
import { groesse } from "@/lib/mail/format";
import type { Anhang } from "@/lib/mail/imap";

export type AuftragWerte = {
  id?: number;
  titel: string;
  kunde: string;
  kundeEmail: string;
  produkt: string;
  menge: string;
  gravur: string;
  preis: string; // netto, „249,90“ oder leer
  steuer: string; // "" = Kleinunternehmer, sonst Satz in Prozent
  deadline: string; // JJJJ-MM-TT oder leer
  status: string;
  notizen: string;
};

/** Mail, aus der der Auftrag angelegt wird. */
export type AuftragMail = { ordner: string; uid: number; betreff: string; anhaenge: Anhang[] };

const MAX_ANHANG = 25 * 1024 * 1024;

const FELD = "h-10";
const TEXTFELD =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

/** Formular zum Anlegen und Bearbeiten eines Auftrags. */
export function AuftragFormular({
  aktion,
  werte,
  knopf,
  mail,
}: {
  aktion: (vorher: AuftragStand, form: FormData) => Promise<AuftragStand>;
  werte: AuftragWerte;
  knopf: string;
  mail?: AuftragMail;
}) {
  const [stand, ausfuehren, laeuft] = useActionState(aktion, {});
  const [preis, setPreis] = useState(werte.preis);
  const [steuer, setSteuer] = useState(werte.steuer);
  // Neue Aufträge: Satz folgt der Deadline, bis er von Hand geändert wird.
  const [steuerVonHand, setSteuerVonHand] = useState(!!werte.id);

  const nettoCent = euroZuCent(preis);
  const satz = satzAusText(steuer) ?? null;
  const rechnung = nettoCent !== null && !Number.isNaN(nettoCent) ? preisRechnung(nettoCent, satz) : null;

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
      {mail && (
        <>
          <input type="hidden" name="mailOrdner" value={mail.ordner} />
          <input type="hidden" name="mailUid" value={mail.uid} />
          <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 break-words">
              Aus der Mail „{mail.betreff}“ – die Mail bleibt mit dem Auftrag verknüpft.
            </span>
          </p>
        </>
      )}

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
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="grid gap-1.5">
          <Label htmlFor="produkt">Produkt</Label>
          <Input id="produkt" name="produkt" defaultValue={werte.produkt} className={FELD} placeholder="z. B. Kugelschreiber Metall, blau" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="menge">Menge</Label>
          <Input id="menge" name="menge" type="number" min={1} step={1} inputMode="numeric" defaultValue={werte.menge} className={FELD} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="gravur">Gravur / Druck</Label>
        <textarea
          id="gravur"
          name="gravur"
          defaultValue={werte.gravur}
          rows={3}
          className={TEXTFELD}
          placeholder="Text, Schrift, Position, Größe, Farbe …"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="preis">Preis gesamt (netto, €)</Label>
          <Input
            id="preis"
            name="preis"
            inputMode="decimal"
            value={preis}
            onChange={(e) => setPreis(e.target.value)}
            className={FELD}
            placeholder="249,90"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="steuer">MwSt.</Label>
          <select
            id="steuer"
            name="steuer"
            value={steuer}
            onChange={(e) => {
              setSteuer(e.target.value);
              setSteuerVonHand(true);
            }}
            className="h-10 rounded-lg border bg-background px-3 text-sm"
          >
            {STEUER_OPTIONEN.map((o) => (
              <option key={o.wert} value={o.wert}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {rechnung && (
        <p className="-mt-2 text-sm tabular-nums text-muted-foreground">
          {satz === null ? (
            <>
              Endpreis <span className="font-medium text-foreground">{centZuEuro(rechnung.brutto)}</span> · keine MwSt.
              (Kleinunternehmer, §19 UStG)
            </>
          ) : (
            <>
              {centZuEuro(rechnung.netto)} netto + {centZuEuro(rechnung.mwst)} MwSt. ({satz} %) ={" "}
              <span className="font-medium text-foreground">{centZuEuro(rechnung.brutto)} brutto</span>
            </>
          )}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={werte.deadline}
            onChange={(e) => {
              if (!steuerVonHand) setSteuer(satzZuText(standardSatz(e.target.value || heuteTag())));
            }}
            className={FELD}
          />
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
          className={TEXTFELD}
          placeholder="Absprachen, Material, Lieferadresse …"
        />
      </div>

      {mail && mail.anhaenge.length > 0 && (
        <fieldset className="grid gap-2">
          <legend className="mb-1.5 text-sm font-medium">Anhänge aus der Mail übernehmen</legend>
          {mail.anhaenge.map((a) => {
            const zuGross = a.groesse > MAX_ANHANG;
            return (
              <label key={a.nr} className="flex items-center gap-2 text-sm has-disabled:text-muted-foreground">
                <input type="checkbox" name="anhang" value={a.nr} defaultChecked={!zuGross} disabled={zuGross} className="size-4" />
                <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate">{a.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {groesse(a.groesse)}
                  {zuGross && " · zu groß (max. 25 MB)"}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      <p className="-mt-2 text-xs text-muted-foreground">
        Bis {new Date(`${KLEINUNTERNEHMER_BIS}T12:00:00Z`).toLocaleDateString("de-DE")} Kleinunternehmer (§19 UStG), danach 19 %
        MwSt. Maßgeblich ist der Liefertag – bei neuen Aufträgen stellt sich die MwSt. nach der Deadline ein.
      </p>

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
