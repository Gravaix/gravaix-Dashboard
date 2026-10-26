#!/usr/bin/env bash
# Gravaix – automatisches Update vom GitHub-Branch "main"
#
# Läuft alle 5 Minuten per Cronjob (siehe docs/deployment.md) und macht nur
# etwas, wenn auf GitHub eine neue Version liegt. Dann:
#   1. neue Version holen (nur "fast-forward", nie lokale Änderungen überschreiben)
#   2. Backup der Datenbank (falls das Update die Datenbank ändert)
#   3. Container neu bauen und starten – schlägt das Bauen fehl, läuft die alte Version weiter
#   4. prüfen, ob das Cockpit wieder antwortet
#
# Von Hand starten (auf dem Server):  ~/gravaix/infra/deploy.sh
# Fehlgeschlagenes Update nochmal versuchen:  ~/gravaix/infra/deploy.sh --erneut

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
COCKPIT_URL="${DEPLOY_CHECK_URL:-https://cockpit.gravaix.de/login}"
log() { echo "[$(date '+%F %T')] $*"; }

# Nie zwei Updates gleichzeitig (ein Build dauert ein paar Minuten).
exec 9>"${TMPDIR:-/tmp}/gravaix-deploy.lock"
flock -n 9 || exit 0

# Welche Version zuletzt erfolgreich aufgespielt wurde (bzw. fehlschlug).
STAND="$HOME/.gravaix-deploy-stand"
FEHLER="$HOME/.gravaix-deploy-fehler"

cd "$REPO"
git fetch --quiet origin main
NEU="$(git rev-parse origin/main)"

# Beim allerersten Lauf: die gerade laufende Version gilt als aufgespielt.
[[ -f "$STAND" ]] || git rev-parse HEAD > "$STAND"
[[ "$NEU" == "$(cat "$STAND")" ]] && exit 0   # nichts Neues – still beenden

# Eine Version, die schon einmal fehlschlug, nicht alle 5 Minuten neu versuchen
# (sonst entstehen dauernd Backups). Von Hand erneut: deploy.sh --erneut
if [[ "${1:-}" != "--erneut" && -f "$FEHLER" && "$NEU" == "$(cat "$FEHLER")" ]]; then
  exit 0
fi
fehlgeschlagen() { echo "$NEU" > "$FEHLER"; log "$1"; exit 1; }

log "Neue Version: $(git log -1 --format='%h %s' "$NEU")"

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  git status --short --untracked-files=no
  fehlgeschlagen "ABBRUCH: Auf dem Server wurden Dateien im Repo geändert (siehe oben). Bitte mit Claude klären."
fi

log "Backup vor dem Update …"
"$REPO/infra/backup.sh" || fehlgeschlagen "ABBRUCH: Backup fehlgeschlagen, Update nicht aufgespielt."

git merge --ff-only --quiet origin/main || fehlgeschlagen "ABBRUCH: Update lässt sich nicht sauber übernehmen (kein fast-forward)."

log "Baue und starte Container …"
cd "$REPO/infra"
docker compose up -d --build --remove-orphans \
  || fehlgeschlagen "FEHLER beim Bauen/Starten. Scheitert schon der Build, läuft die alte Version weiter."

for i in $(seq 1 30); do
  if curl -fsS -o /dev/null --max-time 5 "$COCKPIT_URL"; then
    # Alte, nicht mehr benutzte Images aufräumen, damit die Platte nicht vollläuft.
    docker image prune -f >/dev/null
    echo "$NEU" > "$STAND"
    rm -f "$FEHLER"
    log "Fertig: $(git -C "$REPO" log -1 --format='%h %s') läuft."
    exit 0
  fi
  sleep 5
done
fehlgeschlagen "WARNUNG: Cockpit antwortet nach dem Update nicht. Logs: docker compose logs cockpit"
