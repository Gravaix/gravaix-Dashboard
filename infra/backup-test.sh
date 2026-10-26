#!/usr/bin/env bash
# Gravaix – Backup testen, ohne die echte Datenbank anzufassen
#
# Spielt eine Sicherung in eine WEGWERF-Datenbank ein (eigener Test-Container),
# zeigt, was drin ist, und räumt den Test-Container danach wieder weg.
#
# Neueste Sicherung testen (auf dem Server):  ~/gravaix/infra/backup-test.sh
# Bestimmte Sicherung testen:                 ~/gravaix/infra/backup-test.sh ~/backups/postgres/DATEI.dump

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
DATEI="${1:-$(ls -1t "$BACKUP_DIR"/postgres/cockpit_*.dump 2>/dev/null | head -n 1)}"
[[ -n "$DATEI" && -s "$DATEI" ]] || { echo "Keine Sicherung gefunden in $BACKUP_DIR/postgres"; exit 1; }

TEST="gravaix-backup-test"
aufraeumen() { docker rm -f "$TEST" >/dev/null 2>&1 || true; }
trap aufraeumen EXIT
aufraeumen

echo "==> Teste $DATEI"
docker run -d --name "$TEST" -e POSTGRES_PASSWORD=test postgres:17 >/dev/null
until docker exec "$TEST" pg_isready -U postgres -q 2>/dev/null; do sleep 1; done
sleep 2

docker exec "$TEST" createdb -U postgres cockpit
docker exec -i "$TEST" pg_restore -U postgres -d cockpit --no-owner --exit-on-error < "$DATEI"

echo "==> Inhalt der Sicherung:"
docker exec "$TEST" psql -U postgres -d cockpit -c '
  SELECT (SELECT count(*) FROM "user")       AS nutzer,
         (SELECT string_agg(email, $$, $$) FROM "user") AS email,
         (SELECT count(*) FROM "twoFactor")  AS zwei_faktor,
         (SELECT count(*) FROM session)      AS sitzungen;'

echo "==> Backup ist in Ordnung und lässt sich wiederherstellen."
