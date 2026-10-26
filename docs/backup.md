# Backup der Cockpit-Datenbank

Jede Nacht um 3:30 Uhr sichert der Server die Cockpit-Datenbank nach
`~/backups/postgres/`. Es bleiben immer die letzten 14 Sicherungen erhalten.
Alle Befehle laufen **auf dem Server** (per SSH).

## Einmalig einrichten

Skripte holen und ein erstes Backup von Hand machen:

```bash
cd ~/gravaix && git pull
~/gravaix/infra/backup.sh
```

Testen, ob sich das Backup wiederherstellen lässt (in einer Wegwerf-Datenbank,
die echte Datenbank wird nicht angefasst):

```bash
~/gravaix/infra/backup-test.sh
```

Nächtlichen Automatismus (Cronjob) einrichten:

```bash
(crontab -l 2>/dev/null | grep -v gravaix/infra/backup.sh; echo "30 3 * * * $HOME/gravaix/infra/backup.sh >> $HOME/backups/backup.log 2>&1") | crontab -
crontab -l
```

## Regelmäßig prüfen (z. B. einmal im Monat)

```bash
tail -n 5 ~/backups/backup.log
ls -lh ~/backups/postgres/
~/gravaix/infra/backup-test.sh
```

## Notfall: Datenbank aus einem Backup zurückholen

**Achtung: überschreibt die aktuelle Datenbank.** Vorher mit Claude absprechen.

```bash
cd ~/gravaix/infra
docker compose stop cockpit
docker compose exec -T postgres pg_restore -U cockpit -d cockpit --clean --if-exists --no-owner < ~/backups/postgres/DATEINAME.dump
docker compose start cockpit
```

## Wichtig

- Die Backups liegen auf demselben Server. Gegen Bedienfehler oder kaputte Daten
  hilft das, gegen einen Totalausfall des Servers nicht. Eine Kopie außerhalb
  des Servers ist der nächste Schritt.
- Die Datei `infra/.env` gehört zum Backup dazu, sie liegt in deinem Passwort-Manager.
