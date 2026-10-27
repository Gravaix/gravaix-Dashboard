"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Dateien auswählen → werden sofort hochgeladen. */
export function DateiHochladen({ auftragId }: { auftragId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [laeuft, setLaeuft] = useState(false);

  return (
    <form
      ref={formRef}
      method="post"
      encType="multipart/form-data"
      action={`/api/auftraege/${auftragId}/dateien`}
      onSubmit={() => setLaeuft(true)}
    >
      <input
        ref={inputRef}
        type="file"
        name="dateien"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            setLaeuft(true);
            formRef.current?.submit();
          }
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={laeuft} onClick={() => inputRef.current?.click()}>
        <Upload />
        {laeuft ? "Lädt hoch …" : "Dateien hinzufügen"}
      </Button>
    </form>
  );
}
