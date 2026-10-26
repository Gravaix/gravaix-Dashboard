// Zugang zum Cockpit anlegen oder zurücksetzen. Läuft nur auf dem Server (per SSH):
//   docker compose exec cockpit npm run nutzer
//
// - Gibt es noch keinen Nutzer: legt ihn an (E-Mail + Passwort).
// - Gibt es ihn schon: Passwort neu setzen und/oder Zwei-Faktor zurücksetzen
//   (Notfall, z. B. wenn das Handy weg ist).
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";

let muted = false;
const output = new Writable({
  write(chunk, _enc, done) {
    if (!muted) process.stdout.write(chunk);
    done();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: Boolean(process.stdin.isTTY) });

async function ask(question: string) {
  return (await rl.question(question)).trim();
}

async function askPassword(question: string) {
  process.stdout.write(question);
  muted = true;
  const answer = await rl.question("");
  muted = false;
  process.stdout.write("\n");
  return answer;
}

async function newPassword(min: number) {
  for (;;) {
    const pw = await askPassword(`Neues Passwort (mind. ${min} Zeichen, wird nicht angezeigt): `);
    if (pw.length < min) {
      console.log(`Zu kurz, bitte mindestens ${min} Zeichen.`);
      continue;
    }
    if ((await askPassword("Passwort wiederholen: ")) !== pw) {
      console.log("Die Passwörter sind nicht gleich, nochmal.");
      continue;
    }
    return pw;
  }
}

async function main() {
  const ctx = await auth.$context;
  const min = ctx.password.config.minPasswordLength;
  const existing = await prisma.user.findFirst();

  if (!existing) {
    console.log("Noch kein Zugang vorhanden – wir legen ihn jetzt an.\n");
    const name = (await ask("Name [Celiano]: ")) || "Celiano";
    const email = (await ask("E-Mail [info@gravaix.de]: ")).toLowerCase() || "info@gravaix.de";
    const password = await newPassword(min);

    const user = await ctx.internalAdapter.createUser(
      { name, email, emailVerified: true },
      { method: "admin" },
    );
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: await ctx.password.hash(password),
    });
    console.log(`\nFertig! Melde dich jetzt mit ${email} auf dem Cockpit an.`);
    console.log("Beim ersten Login richtest du die Authenticator-App ein.");
    return;
  }

  console.log(`Zugang vorhanden: ${existing.email}\n`);
  let changed = false;

  if ((await ask("Passwort neu setzen? (ja/nein): ")).toLowerCase() === "ja") {
    const password = await newPassword(min);
    await prisma.account.updateMany({
      where: { userId: existing.id, providerId: "credential" },
      data: { password: await ctx.password.hash(password) },
    });
    console.log("Passwort geändert.");
    changed = true;
  }

  if ((await ask("Zwei-Faktor zurücksetzen, z. B. bei neuem Handy? (ja/nein): ")).toLowerCase() === "ja") {
    await prisma.twoFactor.deleteMany({ where: { userId: existing.id } });
    await prisma.user.update({ where: { id: existing.id }, data: { twoFactorEnabled: false } });
    console.log("Zwei-Faktor zurückgesetzt. Beim nächsten Login richtest du die App neu ein.");
    changed = true;
  }

  if (!changed) return console.log("Nichts geändert.");
  // Nach jeder Änderung überall abmelden.
  await prisma.session.deleteMany({ where: { userId: existing.id } });
  console.log("Alle Geräte wurden abgemeldet.");
}

main()
  .catch((err) => {
    console.error("Fehler:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
