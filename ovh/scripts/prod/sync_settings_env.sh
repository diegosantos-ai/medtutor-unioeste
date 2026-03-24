#!/usr/bin/env bash
set -euo pipefail

: "${DOMAIN_NAME:?DOMAIN_NAME is required}"

runtime_root="${RUNTIME_ROOT:-.runtime/prod}"
runtime_settings_file="${RUNTIME_SETTINGS_FILE:-$runtime_root/settings.env}"
cors_allowed_origins="${CORS_ALLOWED_ORIGINS:-https://$DOMAIN_NAME}"

mkdir -p "$runtime_root"

{
  printf 'DOMAIN_NAME=%s\n' "$DOMAIN_NAME"
  printf 'CORS_ALLOWED_ORIGINS=%s\n' "$cors_allowed_origins"
  if [[ -n "${LETSENCRYPT_EMAIL:-}" ]]; then
    printf 'LETSENCRYPT_EMAIL=%s\n' "$LETSENCRYPT_EMAIL"
  fi
} > "$runtime_settings_file"

chmod 600 "$runtime_settings_file"
