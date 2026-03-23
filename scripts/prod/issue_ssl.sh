#!/usr/bin/env bash
set -euo pipefail

runtime_root="${RUNTIME_ROOT:-.runtime/prod}"
runtime_settings_file="${RUNTIME_SETTINGS_FILE:-$runtime_root/settings.env}"

if [[ -f "$runtime_settings_file" ]]; then
  set -a
  # shellcheck source=/dev/null
  . "$runtime_settings_file"
  set +a
fi

: "${DOMAIN_NAME:?DOMAIN_NAME is required}"
: "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL is required}"

./scripts/prod/ensure_runtime_dirs.sh
./scripts/prod/compose.sh --profile certbot run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$LETSENCRYPT_EMAIL" \
  --agree-tos \
  --no-eff-email \
  --keep-until-expiring \
  -d "$DOMAIN_NAME"
./scripts/prod/compose.sh exec frontend nginx -s reload
