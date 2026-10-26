# Mails im Cockpit

Das Cockpit zeigt das IONOS-Postfach info@gravaix.de an – Ordner, Mails, Anhänge.
Das Postfach bleibt die Quelle der Wahrheit: Das Cockpit ändert dort nur den
**Gelesen-Status**, sonst nichts. Senden und Verschieben kommen später.

## Einmalig einrichten (auf dem Server)

1. Code holen:

   ```bash
   cd ~/gravaix && git pull
   ```

2. Postfach-Zugang in `infra/.env` eintragen. Das Passwort ist dasselbe wie in
   Apple Mail für info@gravaix.de. Die Eingabe bleibt unsichtbar:

   ```bash
   cd ~/gravaix/infra
   read -rsp "Passwort von info@gravaix.de + Enter: " M; echo
   grep -v -E '^MAIL_(USER|PASSWORD)=' .env > .env.neu
   printf 'MAIL_USER=info@gravaix.de\nMAIL_PASSWORD=%s\n' "$M" >> .env.neu
   mv .env.neu .env && chmod 600 .env && unset M
   grep '^MAIL_' .env | sed -E 's/=(.+)/= ✓ gesetzt/'
   ```

3. Cockpit neu bauen und starten:

   ```bash
   docker compose up -d --build
   ```

4. Im Browser `https://cockpit.gravaix.de/mails` öffnen.

Danach die `.env` im Passwort-Manager aktualisieren (`cat ~/gravaix/infra/.env`).

## Gut zu wissen

- **Gelesen:** Öffnest du eine ungelesene Mail, wird sie als gelesen markiert –
  auch in Apple Mail und am iPhone. Mit „Als ungelesen markieren“ stellst du das zurück.
- **Suchen:** Das Suchfeld über der Liste sucht im gerade geöffneten Ordner nach
  Absender, Empfänger, Betreff und Text der Mail.

- **Bilder von außen** werden erst nach Klick auf „Bilder laden“ angezeigt. So
  erfahren Absender nicht über Tracking-Pixel, dass du die Mail geöffnet hast.
- **Skripte in Mails** laufen nie, Formulare in Mails funktionieren nicht.
- **Anhänge:** PDFs und Bilder öffnen sich im Browser, alles andere wird heruntergeladen.
- Ändert sich das Passwort von info@gravaix.de, muss es auch in `infra/.env`
  geändert werden (Schritt 2 und 3 wiederholen).
