import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Schnelle Vorab-Prüfung: ohne Sitzungs-Cookie direkt zum Login.
// Die echte Prüfung (gültige Sitzung, Zwei-Faktor) macht requireUser() auf jeder Seite.
// api/auftraege ist ausgenommen, weil der Proxy sonst große Uploads (> 10 MB) abschneidet –
// die Routen dort prüfen die Anmeldung selbst. api/anfrage prüft den Schlüssel der Webseite.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|api/auftraege|api/anfrage|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest).*)"],
};
