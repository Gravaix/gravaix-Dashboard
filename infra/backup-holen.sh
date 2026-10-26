#!/usr/bin/env bash
# Gravaix – Backup aus dem IONOS Object Storage (Frankfurt) zurückholen
#
# Lädt Sicherungen herunter und entschlüsselt sie nach ~/backups/aus-frankfurt/.
# Die echte Datenbank wird NICHT angefasst. Danach testen mit:
#   ~/gravaix/infra/backup-test.sh ~/backups/aus-frankfurt/DATEI.dump
#
# Auf dem Server:
#   ~/gravaix/infra/backup-holen.sh            → Liste anzeigen + neueste holen
#   ~/gravaix/infra/backup-holen.sh DATEINAME  → bestimmte Sicherung holen

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
cd "$(dirname "$0")"
source ./backup-lib.sh
lade_backup_env "$PWD"
extern_konfiguriert || { echo "Externe Kopie ist noch nicht eingerichtet (BACKUP_S3_* in infra/.env)."; exit 1; }

ZIEL="$BACKUP_DIR/aus-frankfurt"
umask 077
mkdir -p "$ZIEL"

echo "==> Sicherungen in Frankfurt:"
LISTE="$(rclone_docker "$ZIEL" lsf sicher:postgres/ | sort)"
echo "$LISTE"
[[ -n "$LISTE" ]] || { echo "Keine Sicherungen gefunden – oder BACKUP_CRYPT_PASSWORD stimmt nicht."; exit 1; }

NAME="${1:-$(echo "$LISTE" | tail -n 1)}"
echo "==> Hole $NAME …"
rclone_docker "$ZIEL" copy "sicher:postgres/$NAME" /data/
echo "==> Gespeichert: $ZIEL/$NAME"
echo "Jetzt testen mit:  ~/gravaix/infra/backup-test.sh $ZIEL/$NAME"
