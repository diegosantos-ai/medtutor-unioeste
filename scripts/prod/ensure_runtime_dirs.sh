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

live_dir="$runtime_root/letsencrypt/live/$DOMAIN_NAME"
acme_dir="$runtime_root/certbot/.well-known/acme-challenge"

mkdir -p "$live_dir" "$acme_dir"
