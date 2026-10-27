#!/bin/sh
# Startet Radicale mit dem Login aus infra/.env. Fehlt das Passwort, wartet der
# Container nur (statt ständig neu zu starten) – das Cockpit läuft davon unberührt.
set -eu

if [ -z "${RADICALE_PASSWORD:-}" ] || [ -z "${RADICALE_USER:-}" ]; then
  echo "Radicale startet nicht: RADICALE_USER/RADICALE_PASSWORD fehlen in infra/.env (siehe docs/kalender.md)."
  exec sleep infinity
fi

umask 077
printf '%s:%s\n' "$RADICALE_USER" "$RADICALE_PASSWORD" > /tmp/users
exec python -m radicale --config /etc/radicale/config
