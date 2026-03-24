#!/usr/bin/env bash
set -euo pipefail

runtime_root="${RUNTIME_ROOT:-.runtime/prod}"
runtime_env_file="${RUNTIME_ENV_FILE:-$runtime_root/app.env}"
runtime_settings_file="${RUNTIME_SETTINGS_FILE:-$runtime_root/settings.env}"

mkdir -p "$runtime_root"
touch "$runtime_env_file"

if [[ -f "$runtime_settings_file" ]]; then
  set -a
  # shellcheck source=/dev/null
  . "$runtime_settings_file"
  set +a
fi

exec docker compose --env-file "$runtime_env_file" -f docker-compose.prod.yml "$@"
