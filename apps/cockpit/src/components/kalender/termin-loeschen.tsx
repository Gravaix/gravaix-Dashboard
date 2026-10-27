"use client";

import { Trash2 } from "lucide-react";
import { terminLoeschenAktion } from "@/app/(cockpit)/kalender/actions";
import { Button } from "@/components/ui/button";

export function TerminLoeschen({ kalender, datei, etag, datum, titel }: { kalender: string; datei: string; etag: string; datum: string; titel: string }) {
  return (
    <form
      action={terminLoeschenAktion}
      onSubmit={(e) => {
        if (!confirm(`Termin „${titel}“ wirklich löschen? Er verschwindet auch auf iPhone und Mac.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="kalender" value={kalender} />
      <input type="hidden" name="datei" value={datei} />
      <input type="hidden" name="etag" value={etag} />
      <input type="hidden" name="datum" value={datum} />
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
        <Trash2 />
        Termin löschen
      </Button>
    </form>
  );
}
