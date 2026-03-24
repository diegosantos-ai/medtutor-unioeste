#!/usr/bin/env bash
set -euo pipefail

runtime_root="${RUNTIME_ROOT:-.runtime/prod}"
runtime_env_file="${RUNTIME_ENV_FILE:-$runtime_root/app.env}"

mkdir -p "$runtime_root"

if [[ -f ".env" ]]; then
  grep -v '^#' .env | grep -v '^$' > "$runtime_env_file"
  chmod 600 "$runtime_env_file"
  echo "Environment loaded from .env to $runtime_env_file"
else
  echo "ERROR: .env file not found"
  echo "Please create .env with the following variables:"
  echo "  POSTGRES_PASSWORD=your_password"
  echo "  GRAFANA_ADMIN_USER=admin"
  echo "  GRAFANA_ADMIN_PASSWORD=your_password"
  echo "  GEMINI_API_KEY=your_key"
  echo "  OPENAI_API_KEY=your_key_or_empty"
  exit 1
fi
