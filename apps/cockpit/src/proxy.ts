import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Schnelle Vorab-Prüfung: ohne Sitzungs-Cookie direkt zum Login.
// Die echte Prüfung (gültige Sitzung, Zwei-Faktor) macht requireUser() auf jeder Seite.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest).*)"],
};
