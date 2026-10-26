import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { getSession } from "@/lib/session";
import { SetupForm } from "./setup-form";

export const metadata: Metadata = { title: "Zwei-Faktor einrichten" };

// Einmalig nach dem ersten Login: Authenticator-App verbinden.
// Erst danach ist das Cockpit erreichbar.
export default async function EinrichtungPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.twoFactorEnabled) redirect("/");

  return (
    <AuthCard
      title="Zwei-Faktor einrichten"
      description="Einmalig: Verbinde deine Authenticator-App (z. B. Apple Passwörter, Google Authenticator oder 2FAS). Danach brauchst du beim Login immer Passwort + Code."
    >
      <SetupForm />
    </AuthCard>
  );
}
