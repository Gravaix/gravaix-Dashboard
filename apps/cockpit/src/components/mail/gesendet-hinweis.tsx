import { CircleCheck, TriangleAlert } from "lucide-react";

/** Rückmeldung nach dem Senden (über ?gesendet=1 bzw. ?gesendet=teilweise). */
export function GesendetHinweis({ wert }: { wert: unknown }) {
  if (wert === "1") {
    return (
      <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
        <CircleCheck className="size-4 text-brand" />
        Mail gesendet und im Ordner „Gesendet“ abgelegt.
      </p>
    );
  }
  if (wert === "teilweise") {
    return (
      <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <TriangleAlert className="size-4" />
        Mail gesendet, konnte aber nicht im Ordner „Gesendet“ abgelegt werden.
      </p>
    );
  }
  return null;
}
