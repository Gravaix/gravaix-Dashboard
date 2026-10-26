import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";
import { prisma } from "@/lib/db";

// Login fürs Cockpit: E-Mail + Passwort, danach Code aus der Authenticator-App.
// Es gibt genau einen Nutzer (Celiano). Selbst registrieren ist abgeschaltet,
// der Nutzer wird einmalig per `npm run nutzer:anlegen` auf dem Server angelegt.
export const auth = betterAuth({
  appName: "Gravaix Cockpit",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14, // 14 Tage angemeldet bleiben
    updateAge: 60 * 60 * 24, // Sitzung täglich verlängern, solange benutzt
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/two-factor/verify-backup-code": { window: 60, max: 5 },
    },
  },
  advanced: {
    // Caddy setzt die echte Besucher-IP in diesen Header (für die Login-Bremse).
    ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
  },
  plugins: [
    twoFactor({ issuer: "Gravaix Cockpit" }),
    nextCookies(), // muss als letztes Plugin stehen
  ],
});
