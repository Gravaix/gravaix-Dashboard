import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user.twoFactorEnabled) redirect("/");

  return (
    <AuthCard title="Anmelden">
      <LoginForm />
    </AuthCard>
  );
}
