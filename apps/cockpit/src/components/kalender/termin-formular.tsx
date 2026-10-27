"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { terminSpeichern, type TerminStand } from "@/app/(cockpit)/kalender/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KALENDER } from "@/lib/kalender/liste";
import type { TerminMail } from "@/lib/kalender/termine";

export type TerminWerte = {
  kalender: string;
  titel: string;
  ort: string;
  notizen: string;
  ganztags: boolean;
  startTag: string;
  startZeit: string;
  endeTag: string;
  endeZeit: string;
};

const FELD = "h-10";

/** „10:30“ + 60 Minuten → „11:30“ (höchstens 23:59) */
function plusMinuten(zeit: string, minuten: number) {
  const [h, m] = zeit.split(":").map(Number);
  const gesamt = Math.min(h * 60 + m + minuten, 23 * 60 + 59);
  return `${String(Math.floor(gesamt / 60)).padStart(2, "0")}:${String(gesamt % 60).padStart(2, "0")}`;
}

/**
 * Termin anlegen oder bearbeiten. `alt` = bestehender Termin (Kalender, Datei, Versionsstand),
 * `mail` = neuer Termin aus einer Mail (wird im Termin verlinkt).
 */
export function TerminFormular({
  werte,
  alt,
  mail,
  zurueck,
}: {
  werte: TerminWerte;
  alt?: { kalender: string; datei: string; etag: string };
  mail?: TerminMail;
  zurueck: string;
}) {
  const [stand, ausfuehren, laeuft] = useActionState<TerminStand, FormData>(terminSpeichern, {});
  const [ganztags, setGanztags] = useState(werte.ganztags);
  const [startTag, setStartTag] = useState(werte.startTag);
  const [endeTag, setEndeTag] = useState(werte.endeTag);
  const [startZeit, setStartZeit] = useState(werte.startZeit);
  const [endeZeit, setEndeZeit] = useState(werte.endeZeit);

  return (
    <form
      className="grid max-w-xl gap-4"
      // Selbst abschicken statt action={…}: sonst leert React das Formular auch bei einem Fehler.
      onSubmit={(e) => {
        e.preventDefault();
        const daten = new FormData(e.currentTarget);
        startTransition(() => ausfuehren(daten));
      }}
    >
      {alt && (
        <>
          <input type="hidden" name="altKalender" value={alt.kalender} />
          <input type="hidden" name="altDatei" value={alt.datei} />
          <input type="hidden" name="etag" value={alt.etag} />
        </>
      )}
      {mail && !alt && (
        <>
          <input type="hidden" name="mailId" value={mail.messageId} />
          <input type="hidden" name="mailOrdner" value={mail.ordner} />
          <input type="hidden" name="mailUid" value={mail.uid} />
        </>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="titel">Was?</Label>
        <Input id="titel" name="titel" defaultValue={werte.titel} required autoFocus={!alt} className={FELD} placeholder="z. B. Abholung Firma Müller" />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="kalender">Kalender</Label>
        <select id="kalender" name="kalender" defaultValue={werte.kalender} className="h-10 rounded-lg border bg-background px-3 text-sm">
          {KALENDER.map((k) => (
            <option key={k.slug} value={k.slug}>
              {k.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="ganztags" checked={ganztags} onChange={(e) => setGanztags(e.target.checked)} className="size-4" />
        Ganztägig
      </label>

      <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1.5">
        <Label htmlFor="startTag" className="col-span-2">
          Beginn
        </Label>
        <Input
          id="startTag"
          name="startTag"
          type="date"
          required
          value={startTag}
          onChange={(e) => {
            const neu = e.target.value;
            // Ende mitziehen, damit es nie vor dem Beginn liegt
            if (neu && (!endeTag || endeTag < neu || endeTag === startTag)) setEndeTag(neu);
            setStartTag(neu);
          }}
          className={FELD}
        />
        {!ganztags && (
          <Input
            name="startZeit"
            type="time"
            aria-label="Beginn Uhrzeit"
            required
            value={startZeit}
            onChange={(e) => {
              const neu = e.target.value;
              if (neu && startTag === endeTag && endeZeit <= neu) setEndeZeit(plusMinuten(neu, 60));
              setStartZeit(neu);
            }}
            className={`${FELD} w-28`}
          />
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1.5">
        <Label htmlFor="endeTag" className="col-span-2">
          Ende
        </Label>
        <Input id="endeTag" name="endeTag" type="date" required min={startTag} value={endeTag} onChange={(e) => setEndeTag(e.target.value)} className={FELD} />
        {!ganztags && (
          <Input
            name="endeZeit"
            type="time"
            aria-label="Ende Uhrzeit"
            required
            value={endeZeit}
            onChange={(e) => setEndeZeit(e.target.value)}
            className={`${FELD} w-28`}
          />
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="ort">Ort</Label>
        <Input id="ort" name="ort" defaultValue={werte.ort} className={FELD} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="notizen">Notizen</Label>
        <textarea
          id="notizen"
          name="notizen"
          defaultValue={werte.notizen}
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>

      {stand.fehler && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {stand.fehler}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={laeuft}>
          {laeuft ? "Speichert …" : alt ? "Speichern" : "Termin anlegen"}
        </Button>
        <Button type="button" variant="ghost" nativeButton={false} render={<Link href={zurueck} />}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
