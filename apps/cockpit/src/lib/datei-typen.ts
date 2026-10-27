// Diese Typen dürfen direkt im Browser geöffnet werden (keine Skripte möglich).
// Alles andere – vor allem HTML und SVG – wird nur heruntergeladen.
export const ANZEIGBAR = /^(application\/pdf|image\/(png|jpe?g|gif|webp|heic)|text\/plain)$/i;

/** Als kleines Vorschaubild im <img> zeigen (dort laufen auch in SVGs keine Skripte). */
export const VORSCHAU = /^image\/(png|jpe?g|gif|webp|svg\+xml)$/i;

/** Antwort-Kopfzeilen für eine ausgelieferte Datei. */
export function dateiHeader(name: string, typ: string) {
  const anzeigen = ANZEIGBAR.test(typ);
  const svg = /^image\/svg\+xml$/i.test(typ);
  return {
    // SVG behält seinen Typ (für die Vorschau), wird beim direkten Öffnen aber heruntergeladen.
    "Content-Type": anzeigen || svg ? typ : "application/octet-stream",
    "Content-Disposition": `${anzeigen ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(name)}`,
    // Falls ein SVG doch direkt geöffnet wird: keine Skripte, nichts nachladen.
    ...(svg ? { "Content-Security-Policy": "sandbox; default-src 'none'; img-src data:; style-src 'unsafe-inline'" } : {}),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  };
}
