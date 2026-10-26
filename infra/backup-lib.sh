# Gemeinsame Helfer für backup.sh und backup-holen.sh (wird per "source" geladen).
#
# Externe Kopie: rclone (als Docker-Container) lädt die Backups verschlüsselt
# in den IONOS Object Storage. Zugangsdaten kommen aus infra/.env (BACKUP_S3_*).

# Nur die BACKUP_*-Zeilen aus infra/.env übernehmen (der Rest geht nur Docker Compose an).
lade_backup_env() {
  local datei="$1/.env" k v
  [[ -f "$datei" ]] || return 0
  while IFS='=' read -r k v || [[ -n "$k" ]]; do
    if [[ "$k" == BACKUP_* && -z "${!k:-}" ]]; then
      export "$k=$v"
    fi
  done < "$datei"
  return 0
}

extern_konfiguriert() {
  [[ -n "${BACKUP_S3_BUCKET:-}" && -n "${BACKUP_S3_ACCESS_KEY:-}" && -n "${BACKUP_S3_SECRET_KEY:-}" && -n "${BACKUP_CRYPT_PASSWORD:-}" ]]
}

# rclone im Container starten. Remote "sicher:" = verschlüsselter Ordner im Bucket.
#   Aufruf: rclone_docker <lokaler Ordner, wird als /data eingehängt> <rclone-Argumente…>
rclone_docker() {
  local ordner="$1"; shift
  local obscured
  obscured="$(printf '%s' "$BACKUP_CRYPT_PASSWORD" | docker run --rm -i rclone/rclone:1 obscure -)"
  docker run --rm \
    --user "$(id -u):$(id -g)" \
    -e HOME=/tmp \
    -e RCLONE_LOG_LEVEL=ERROR \
    -v "$ordner:/data" \
    -e RCLONE_CONFIG_IONOS_TYPE=s3 \
    -e RCLONE_CONFIG_IONOS_PROVIDER="${BACKUP_S3_PROVIDER:-IONOS}" \
    -e RCLONE_CONFIG_IONOS_ENDPOINT="${BACKUP_S3_ENDPOINT:-https://s3.eu-central-4.ionoscloud.com}" \
    -e RCLONE_CONFIG_IONOS_REGION="${BACKUP_S3_REGION:-eu-central-4}" \
    -e RCLONE_CONFIG_IONOS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY" \
    -e RCLONE_CONFIG_IONOS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_KEY" \
    -e RCLONE_CONFIG_IONOS_NO_CHECK_BUCKET=true \
    -e RCLONE_CONFIG_SICHER_TYPE=crypt \
    -e RCLONE_CONFIG_SICHER_REMOTE="ionos:$BACKUP_S3_BUCKET/gravaix" \
    -e RCLONE_CONFIG_SICHER_PASSWORD="$obscured" \
    rclone/rclone:1 "$@"
}
