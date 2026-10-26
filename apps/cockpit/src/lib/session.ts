import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Für alle Cockpit-Seiten: ohne Login → /login, ohne Zwei-Faktor → /einrichtung. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.user.twoFactorEnabled) redirect("/einrichtung");
  return session.user;
}
