#!/usr/bin/env bash
set -euo pipefail

: "${AWS_REGION:?AWS_REGION is required}"
: "${POSTGRES_PASSWORD_SSM_PARAMETER:?POSTGRES_PASSWORD_SSM_PARAMETER is required}"
: "${GRAFANA_ADMIN_USER_SSM_PARAMETER:?GRAFANA_ADMIN_USER_SSM_PARAMETER is required}"
: "${GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER:?GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER is required}"

runtime_root="${RUNTIME_ROOT:-.runtime/prod}"
runtime_env_file="${RUNTIME_ENV_FILE:-$runtime_root/app.env}"

mkdir -p "$runtime_root"

fetch_parameter() {
  local parameter_name="$1"

  if [[ -z "$parameter_name" ]]; then
    return 0
  fi

  aws ssm get-parameter \
    --region "$AWS_REGION" \
    --name "$parameter_name" \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text
}

postgres_password="$(fetch_parameter "$POSTGRES_PASSWORD_SSM_PARAMETER")"
grafana_admin_user="$(fetch_parameter "$GRAFANA_ADMIN_USER_SSM_PARAMETER")"
grafana_admin_password="$(fetch_parameter "$GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER")"
gemini_api_key="$(fetch_parameter "${GEMINI_API_KEY_SSM_PARAMETER:-}")"
openai_api_key="$(fetch_parameter "${OPENAI_API_KEY_SSM_PARAMETER:-}")"

{
  printf 'POSTGRES_PASSWORD=%s\n' "$postgres_password"
  printf 'GRAFANA_ADMIN_USER=%s\n' "$grafana_admin_user"
  printf 'GRAFANA_ADMIN_PASSWORD=%s\n' "$grafana_admin_password"
  if [[ -n "$gemini_api_key" ]]; then
    printf 'GEMINI_API_KEY=%s\n' "$gemini_api_key"
  fi
  if [[ -n "$openai_api_key" ]]; then
    printf 'OPENAI_API_KEY=%s\n' "$openai_api_key"
  fi
} > "$runtime_env_file"

chmod 600 "$runtime_env_file"
