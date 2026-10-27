#!/usr/bin/env bash
# Gravaix – tägliches Backup der Cockpit-Datenbank
#
# Läuft automatisch jede Nacht (Cronjob, siehe docs/backup.md).
# Von Hand starten (auf dem Server):  ~/gravaix/infra/backup.sh
#
# Legt eine Sicherung in ~/backups/postgres/ ab und behält die der letzten 14 Tage
# (mindestens 14 Stück). Ältere werden erst gelöscht, NACHDEM die neue Sicherung geklappt hat.
# Ist in infra/.env der Object Storage eingetragen (BACKUP_S3_*), wird jede
# Sicherung zusätzlich verschlüsselt nach Frankfurt hochgeladen (siehe docs/backup.md).
# Außerdem werden die Kalender (Radicale) nach ~/backups/radicale/ gesichert.

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
BEHALTEN=14

cd "$(dirname "$0")"
source ./backup-lib.sh
lade_backup_env "$PWD"
umask 077
mkdir -p "$BACKUP_DIR/postgres" "$BACKUP_DIR/radicale"

ZEIT="$(date +%Y-%m-%d_%H%M)"
DATEI="$BACKUP_DIR/postgres/cockpit_$ZEIT.dump"
KALENDER="$BACKUP_DIR/radicale/radicale_$ZEIT.tar.gz"
trap 'rm -f "$DATEI.tmp" "$KALENDER.tmp"' EXIT

echo "[$(date '+%F %T')] Backup startet → $DATEI"

# pg_dump im Datenbank-Container; erst in .tmp schreiben, damit nie eine
# halbe Datei wie ein fertiges Backup aussieht.
docker compose exec -T postgres pg_dump -U cockpit -d cockpit --format=custom > "$DATEI.tmp"
if [[ ! -s "$DATEI.tmp" ]]; then
  echo "FEHLER: Backup ist leer." >&2
  exit 1
fi
mv "$DATEI.tmp" "$DATEI"

# Alte Sicherungen aufräumen: gelöscht wird nur, was älter als $BEHALTEN Tage ist,
# und es bleiben immer mindestens die neuesten $BEHALTEN Sicherungen übrig
# (auch an Tagen mit mehreren Updates gehen so keine Tage verloren).
ls -1t "$BACKUP_DIR"/postgres/cockpit_*.dump | tail -n +$((BEHALTEN + 1)) | while read -r alt; do
  if [[ -n "$(find "$alt" -mtime +"$BEHALTEN")" ]]; then rm -- "$alt"; fi
done

echo "[$(date '+%F %T')] Fertig: $(du -h "$DATEI" | cut -f1), $(ls -1 "$BACKUP_DIR"/postgres/cockpit_*.dump | wc -l) Sicherungen vorhanden"

# Kalender: Ordner der Kalender aus dem Radicale-Container als .tar.gz.
# Läuft Radicale (noch) nicht, wird das übersprungen – das Datenbank-Backup zählt.
if [[ -n "$(docker compose ps -q --status running radicale 2>/dev/null)" ]]; then
  docker compose exec -T radicale tar -C /data -czf - . > "$KALENDER.tmp"
  mv "$KALENDER.tmp" "$KALENDER"
  ls -1t "$BACKUP_DIR"/radicale/radicale_*.tar.gz | tail -n +$((BEHALTEN + 1)) | while read -r alt; do
    if [[ -n "$(find "$alt" -mtime +"$BEHALTEN")" ]]; then rm -- "$alt"; fi
  done
  echo "[$(date '+%F %T')] Kalender gesichert: $(du -h "$KALENDER" | cut -f1)"
else
  KALENDER=""
  echo "[$(date '+%F %T')] Hinweis: Radicale läuft nicht, Kalender-Backup übersprungen."
fi

# Externe Kopie (verschlüsselt). Dort wird nichts gelöscht: die Objektsperre
# schützt jede Sicherung 30 Tage, danach können sie per Lebenszyklus-Regel weg.
if extern_konfiguriert; then
  echo "[$(date '+%F %T')] Lade verschlüsselt hoch nach ${BACKUP_S3_BUCKET} …"
  rclone_docker "$BACKUP_DIR/postgres" copy "/data/$(basename "$DATEI")" sicher:postgres/ --s3-upload-cutoff 100M --retries 5
  if [[ -n "$KALENDER" ]]; then
    rclone_docker "$BACKUP_DIR/radicale" copy "/data/$(basename "$KALENDER")" sicher:radicale/ --retries 5
  fi
  echo "[$(date '+%F %T')] Externe Kopie fertig."
else
  echo "[$(date '+%F %T')] Hinweis: externe Kopie noch nicht eingerichtet. Leer in infra/.env: $(fehlende_werte)"
fi
