#!/usr/bin/env bash
# Gravaix – tägliches Backup der Cockpit-Datenbank
#
# Läuft automatisch jede Nacht (Cronjob, siehe docs/backup.md).
# Von Hand starten (auf dem Server):  ~/gravaix/infra/backup.sh
#
# Legt eine Sicherung in ~/backups/postgres/ ab und behält die letzten 14.
# Ältere werden erst gelöscht, NACHDEM die neue Sicherung geklappt hat.
# Später kommt hier auch Radicale (Kalender) dazu.

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
BEHALTEN=14

cd "$(dirname "$0")"
umask 077
mkdir -p "$BACKUP_DIR/postgres"

ZEIT="$(date +%Y-%m-%d_%H%M)"
DATEI="$BACKUP_DIR/postgres/cockpit_$ZEIT.dump"
trap 'rm -f "$DATEI.tmp"' EXIT

echo "[$(date '+%F %T')] Backup startet → $DATEI"

# pg_dump im Datenbank-Container; erst in .tmp schreiben, damit nie eine
# halbe Datei wie ein fertiges Backup aussieht.
docker compose exec -T postgres pg_dump -U cockpit -d cockpit --format=custom > "$DATEI.tmp"
if [[ ! -s "$DATEI.tmp" ]]; then
  echo "FEHLER: Backup ist leer." >&2
  exit 1
fi
mv "$DATEI.tmp" "$DATEI"

# Alte Sicherungen aufräumen: nur die neuesten $BEHALTEN bleiben.
ls -1t "$BACKUP_DIR"/postgres/cockpit_*.dump | tail -n +$((BEHALTEN + 1)) | xargs -r rm --

echo "[$(date '+%F %T')] Fertig: $(du -h "$DATEI" | cut -f1), $(ls -1 "$BACKUP_DIR"/postgres/cockpit_*.dump | wc -l) Sicherungen vorhanden"
