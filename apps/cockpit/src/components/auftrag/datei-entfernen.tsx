"use client";

import { X } from "lucide-react";
import { dateiEntfernen } from "@/app/(cockpit)/auftraege/actions";

export function DateiEntfernen({ dateiId, name }: { dateiId: number; name: string }) {
  return (
    <form
      action={dateiEntfernen}
      onSubmit={(e) => {
        if (!confirm(`„${name}“ wirklich vom Auftrag entfernen?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="dateiId" value={dateiId} />
      <button
        type="submit"
        title="Entfernen"
        aria-label={`„${name}“ entfernen`}
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="size-4" />
      </button>
    </form>
  );
}
