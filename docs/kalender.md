# Kalender (Radicale unter cal.gravaix.de)

Die Kalender liegen auf deinem eigenen Server (EU), nicht bei Apple oder Google.
Der Kalender-Server heißt **Radicale** und spricht **CalDAV**, die Sprache, die
Apple Kalender auf iPhone und Mac versteht. Später greift auch das Cockpit darauf zu.

## Einmalig einrichten: Login anlegen

Alle Befehle laufen **auf dem Server** (per SSH: `ssh celiano@cockpit.gravaix.de`).

1. Passwort erzeugen und **sofort im Passwort-Manager sichern**
   (Eintrag „Gravaix Kalender“, Benutzer `celiano`, Server `cal.gravaix.de`):

   ```bash
   openssl rand -hex 24
   ```

2. In `infra/.env` eintragen:

   ```bash
   nano ~/gravaix/infra/.env
   ```

   Am Ende einfügen (Passwort aus Schritt 1, ohne Anführungszeichen):

   ```
   RADICALE_USER=celiano
   RADICALE_PASSWORD=...
   ```

   Speichern: Strg+O, Enter, Strg+X.

3. Prüfen, ob beide Werte drin sind (zeigt nur die Anzahl, nicht das Passwort). Ergebnis muss `2` sein:

   ```bash
   grep -c '^RADICALE_' ~/gravaix/infra/.env
   ```

Wurde das Passwort erst **nach** dem Update eingetragen, Radicale einmal neu starten:

```bash
cd ~/gravaix/infra && docker compose up -d radicale
```

## Prüfen, ob der Kalender läuft

Im Browser `https://cal.gravaix.de` öffnen und mit `celiano` + Passwort anmelden.
Es erscheint die einfache Weboberfläche von Radicale.

Auf dem Server:

```bash
cd ~/gravaix/infra && docker compose ps radicale
docker compose logs radicale --tail 20
```

## Kalender Aufträge, Termine, Privat

Im Cockpit unter **Kalender** stehen die drei Kalender. Fehlen welche, legt sie der
Knopf **„Kalender anlegen“** auf dem Server an (mit Farbe). Vorhandene Kalender
werden nie verändert oder gelöscht.

| Kalender | Farbe | Wofür |
| --- | --- | --- |
| Aufträge | Orange | Deadlines aus dem Auftragsboard (automatisch) |
| Termine | Blau | Kundentermine, Abholungen, Lieferanten |
| Privat | Grün | Alles Private |

## Kalender im Cockpit

- **Ansichten:** Monat, Woche (Standard) und Tag. Mit ‹ › blättern, „Heute“ springt zurück.
  Am Handy zeigt der Monat farbige Punkte, ein Tipp auf den Tag öffnet die Tagesansicht.
- **Neuer Termin:** Knopf oben rechts oder das **+** an einem Tag. Kalender wählen,
  Beginn und Ende, optional ganztägig, Ort und Notizen.
- **Bearbeiten:** Auf einen Termin tippen. Wechselst du den Kalender, wird der Termin
  verschoben. Unten auf der Seite kann er gelöscht werden (mit Rückfrage).
- **Serientermine** (z. B. „jeden Donnerstag“) werden angezeigt, aber nur in Apple
  Kalender geändert. Im Cockpit steht dann ein Hinweis.
- **Termin aus einer Mail:** In der Mail oben auf **„Termin anlegen“**. Titel (Betreff) und
  Notizen (Absender + Mailtext) sind schon ausgefüllt, Datum und Uhrzeit trägst du ein.
  Der Termin merkt sich die Mail: im Cockpit über **„Mail öffnen“**, in Apple Kalender
  über den Link (URL) im Termin – auch wenn die Mail inzwischen in einen anderen Ordner
  verschoben wurde.
- Wurde ein Termin inzwischen am iPhone geändert, speichert das Cockpit nicht einfach
  drüber, sondern meldet es. Dann die Seite neu laden.

## Deadlines aus dem Auftragsboard

Hat ein Auftrag eine Deadline, steht sie automatisch als ganztägiger Termin im Kalender
**Aufträge**, z. B. „Deadline A-0007: 50 Kugelschreiber mit Logo“. Am Vortag um 9 Uhr
erinnert das iPhone daran.

- Abgeglichen wird bei jeder Änderung am Auftrag (anlegen, speichern, Status-Pfeile).
- **Erledigt** oder Deadline gelöscht → der Termin verschwindet aus dem Kalender.
- Ändern bitte **im Auftrag**, nicht im Kalender: Änderungen am iPhone werden beim
  nächsten Abgleich wieder überschrieben. Ein Klick auf die Deadline im Cockpit-Kalender
  öffnet den Auftrag.
- Eigene Termine im Kalender „Aufträge“ (z. B. „Material bestellen“) bleiben unberührt.
- Knopf **„Deadlines abgleichen“** unten auf der Kalender-Seite: holt alles sofort nach,
  z. B. beim ersten Mal für die schon vorhandenen Aufträge.

## iPhone und Mac verbinden

Voraussetzung: Im Cockpit unter **Kalender** sind die drei Kalender angelegt
(oben darf kein Hinweis „Noch nicht eingerichtet“ stehen).

Du brauchst:

| Feld | Eintrag |
| --- | --- |
| Server | `cal.gravaix.de` |
| Benutzername | `celiano` |
| Passwort | Kalender-Passwort aus dem Passwort-Manager („Gravaix Kalender“) |
| Beschreibung | `Gravaix` |

### iPhone

1. **Einstellungen** → **Apps** → **Kalender** → **Kalender-Accounts** → **Account hinzufügen**
   (bei älteren iOS-Versionen: Einstellungen → Kalender → Accounts).
2. **Andere** → **CalDAV-Account hinzufügen**.
3. Server, Benutzername, Passwort und Beschreibung wie oben eintragen → **Weiter**.
4. „Kalender“ eingeschaltet lassen → **Sichern**.
5. In der Kalender-App unten auf **Kalender** tippen: Unter „GRAVAIX“ stehen
   Aufträge, Termine und Privat.
6. Empfohlen: **Einstellungen** → **Apps** → **Kalender** → **Standardkalender** →
   „Termine“ (Gravaix). Dann landen neue Termine automatisch auf deinem Server.

### Mac

1. App **Kalender** öffnen → Menü **Kalender** → **Account hinzufügen …**
2. **Anderer CalDAV-Account …** wählen → **Fortfahren**.
3. Accounttyp **Manuell**, dann Benutzername, Passwort und als Serveradresse
   `cal.gravaix.de` eintragen → **Anmelden**.
4. Links in der Seitenleiste erscheint „cal.gravaix.de“ mit den drei Kalendern.
5. Empfohlen: **Kalender** → **Einstellungen** → **Allgemein** → **Standardkalender**:
   „Termine“. Unter **Accounts** → cal.gravaix.de → **Aktualisieren: Alle 5 Minuten**.

### Gut zu wissen

- Änderungen kommen nicht sofort, sondern beim nächsten Abgleich: am Mac alle paar
  Minuten, am iPhone beim Öffnen der Kalender-App bzw. nach der Einstellung unter
  „Datenabgleich“ (Einstellungen → Apps → Mail → Mail-Accounts → Datenabgleich).
- Termine im Cockpit, am iPhone und am Mac sind dieselben – gelöscht ist überall gelöscht.
- Bestehende iCloud-Kalender bleiben, wie sie sind. Sie liegen bei Apple, nicht auf
  deinem Server, und erscheinen deshalb nicht im Cockpit.
- **Fehler „Kann Account nicht überprüfen“:** Passwort prüfen (Groß-/Kleinschreibung,
  kein Leerzeichen am Ende). Am Mac sonst Accounttyp „Erweitert“ wählen: Server
  `cal.gravaix.de`, Serverpfad `/celiano/`, Port 443, SSL an.

## Backup

Die Kalender werden mit dem Datenbank-Backup gesichert (jede Nacht und vor jedem
Update) nach `~/backups/radicale/` und verschlüsselt nach Frankfurt (siehe `docs/backup.md`).

## Kommt als Nächstes

Die Übersicht mit Anfragen, offenen Aufträgen, Terminen und fälligen Deadlines
(siehe `ROADMAP.md`, Abschnitt 1.5).
