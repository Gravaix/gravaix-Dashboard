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
| Aufträge | Orange | Deadlines aus dem Auftragsboard (kommen später automatisch) |
| Termine | Blau | Kundentermine, Abholungen, Lieferanten |
| Privat | Grün | Alles Private |

## Backup

Die Kalender werden mit dem Datenbank-Backup gesichert (jede Nacht und vor jedem
Update) nach `~/backups/radicale/` und verschlüsselt nach Frankfurt (siehe `docs/backup.md`).

## Kommt als Nächstes

Kalenderansicht im Cockpit und Anleitung für iPhone und Mac (siehe `ROADMAP.md`, Abschnitt 1.4).
