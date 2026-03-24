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
fullchain_path="$live_dir/fullchain.pem"
privkey_path="$live_dir/privkey.pem"

mkdir -p "$live_dir"

if [[ -s "$fullchain_path" && -s "$privkey_path" ]]; then
  exit 0
fi

openssl req \
  -x509 \
  -nodes \
  -newkey rsa:2048 \
  -days 1 \
  -keyout "$privkey_path" \
  -out "$fullchain_path" \
  -subj "/CN=$DOMAIN_NAME"
