// Fehlermeldungen von Better Auth auf Deutsch.
const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-Mail oder Passwort stimmt nicht.",
  INVALID_PASSWORD: "Das Passwort stimmt nicht.",
  INVALID_CODE: "Der Code stimmt nicht. Bitte den aktuellen Code aus der App eingeben.",
  INVALID_BACKUP_CODE: "Dieser Notfall-Code ist ungültig oder wurde schon benutzt.",
  INVALID_TWO_FACTOR_COOKIE: "Die Anmeldung ist abgelaufen. Bitte noch einmal mit Passwort anmelden.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Zu viele Versuche. Bitte noch einmal mit Passwort anmelden.",
  TOTP_ALREADY_ENABLED: "Die Zwei-Faktor-Anmeldung ist schon eingerichtet.",
};

export function authErrorMessage(error: { code?: string; status?: number } | null | undefined) {
  if (!error) return "Unbekannter Fehler.";
  if (error.status === 429) return "Zu viele Versuche. Bitte eine Minute warten.";
  if (error.status === 423) return "Zu viele falsche Codes. Die Anmeldung ist für 15 Minuten gesperrt.";
  return (error.code && messages[error.code]) || "Das hat nicht geklappt. Bitte noch einmal versuchen.";
}
