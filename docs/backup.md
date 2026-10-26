# Backup der Cockpit-Datenbank

Jede Nacht um 3:30 Uhr sichert der Server die Cockpit-Datenbank nach
`~/backups/postgres/`. Es bleiben die Sicherungen der letzten 14 Tage erhalten
(mindestens 14 Stück). Zusätzlich sichert jedes automatische Update vorher die Datenbank.
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

## Externe Kopie im IONOS Object Storage (Frankfurt)

Nach jedem Backup lädt `backup.sh` die neue Sicherung zusätzlich nach Frankfurt.
Sie wird **auf dem Server verschlüsselt**, bevor sie hochgeladen wird – IONOS
kann die Daten nicht lesen. Werkzeug: rclone (läuft als Docker-Container).

### Einmalig einrichten

Voraussetzung: IONOS-Cloud-Konto, Bucket mit Objektsperre (Governance, 30 Tage)
in Frankfurt, Access Key + Secret Key (alles im Passwort-Manager).

1. Backup-Passwort erzeugen und **sofort im Passwort-Manager sichern**
   (ohne dieses Passwort sind die Backups in Frankfurt wertlos):

   ```bash
   openssl rand -base64 32
   ```

2. Werte in `infra/.env` eintragen (Vorlage: `infra/.env.example`, unterer Teil):

   ```bash
   cd ~/gravaix && git pull
   cd infra
   nano .env
   ```

   Am Ende der Datei einfügen und ausfüllen (ohne Anführungszeichen):

   ```
   BACKUP_S3_BUCKET=name-deines-buckets
   BACKUP_S3_ACCESS_KEY=...
   BACKUP_S3_SECRET_KEY=...
   BACKUP_S3_REGION=eu-central-4
   BACKUP_S3_ENDPOINT=https://s3.eu-central-4.ionoscloud.com
   BACKUP_CRYPT_PASSWORD=...
   ```

   Bucket mit Region `de` statt `eu-central-4`? Dann
   `BACKUP_S3_REGION=de` und `BACKUP_S3_ENDPOINT=https://s3.eu-central-1.ionoscloud.com`.

   Speichern: Strg+O, Enter, Strg+X.

3. Testen – Backup machen, aus Frankfurt zurückholen, wiederherstellen:

   ```bash
   ~/gravaix/infra/backup.sh
   ~/gravaix/infra/backup-holen.sh
   ~/gravaix/infra/backup-test.sh ~/backups/aus-frankfurt/DATEINAME.dump
   ```

   (`DATEINAME` zeigt `backup-holen.sh` am Ende an.)

### Wenn der Upload nicht klappt

- `InvalidAccessKeyId` oder `is a file not a directory`: Access Key und Secret Key
  sind falsch oder **vertauscht**. Bei IONOS ist der Access Key der längere
  (92 Zeichen), der Secret Key hat 64. Länge prüfen, ohne die Schlüssel anzuzeigen:

  ```bash
  awk -F= '/^BACKUP_S3_(ACCESS_KEY|SECRET_KEY)=/{print $1, "→", length($2), "Zeichen"}' ~/gravaix/infra/.env
  ```

- Werte am besten mit den Kopier-Knöpfen im DCD kopieren
  (Object Storage → Schlüsselverwaltung → „Key“ und „Secret“).

### Notfall: Server komplett weg

Auf einem neuen Server: Repo klonen, `infra/.env` aus dem Passwort-Manager
wiederherstellen, `backup-holen.sh` ausführen und die geholte Datei wie oben
unter „Notfall“ einspielen. Dabei mit Claude zusammen vorgehen.

## Wichtig

- Lokale Backups (14 Tage) liegen auf dem Server, die verschlüsselte Kopie in Frankfurt.
- Die Datei `infra/.env` (inkl. `BACKUP_CRYPT_PASSWORD`) gehört zum Backup dazu
  und liegt in deinem Passwort-Manager.
