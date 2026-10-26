import { getSession } from "@/lib/session";
import { anhangLaden } from "@/lib/mail/imap";

// Diese Typen dürfen direkt im Browser geöffnet werden (keine Skripte möglich).
// Alles andere – vor allem HTML und SVG – wird nur heruntergeladen.
const ANZEIGBAR = /^(application\/pdf|image\/(png|jpe?g|gif|webp|heic)|text\/plain)$/i;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user.twoFactorEnabled) return new Response("Nicht angemeldet", { status: 401 });

  const url = new URL(request.url);
  const pfad = url.searchParams.get("ordner") ?? "";
  const uid = Number(url.searchParams.get("uid"));
  const nr = Number(url.searchParams.get("nr"));
  if (!pfad || !Number.isInteger(uid) || !Number.isInteger(nr) || nr < 0) {
    return new Response("Ungültige Anfrage", { status: 400 });
  }

  const anhang = await anhangLaden(pfad, uid, nr);
  if (!anhang) return new Response("Anhang nicht gefunden", { status: 404 });

  const anzeigen = ANZEIGBAR.test(anhang.typ);
  const name = encodeURIComponent(anhang.name);
  return new Response(new Uint8Array(anhang.inhalt), {
    headers: {
      "Content-Type": anzeigen ? anhang.typ : "application/octet-stream",
      "Content-Disposition": `${anzeigen ? "inline" : "attachment"}; filename*=UTF-8''${name}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
