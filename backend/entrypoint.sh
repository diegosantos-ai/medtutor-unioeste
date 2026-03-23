#!/usr/bin/env bash
set -e

DB_WAIT_TIMEOUT="${DB_WAIT_TIMEOUT:-60}"

log_json() {
  local level="$1"
  local message="$2"
  local timestamp

  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  message="${message//\\/\\\\}"
  message="${message//\"/\\\"}"
  message="${message//$'\n'/ }"
  printf '{"asctime":"%s","levelname":"%s","module":"entrypoint","message":"%s"}\n' \
    "$timestamp" \
    "$level" \
    "$message"
}

log_json "INFO" "Aguardando banco de dados ficar acessivel"
python - <<'PY'
import os
import time

from sqlalchemy import create_engine, text

database_url = os.environ.get("DATABASE_URL", "sqlite:///./medtutor.db")
timeout = int(os.environ.get("DB_WAIT_TIMEOUT", "60"))
deadline = time.time() + timeout
last_error = None

while time.time() < deadline:
    try:
        engine = create_engine(database_url, pool_pre_ping=True)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        break
    except Exception as exc:
        last_error = exc
        time.sleep(2)
else:
    raise SystemExit(f"Nao foi possivel conectar ao banco em {timeout}s: {last_error}")
PY

log_json "INFO" "Banco de dados disponivel"
log_json "INFO" "Iniciando processo de provisionamento do banco de dados"
if alembic_output="$(alembic upgrade head 2>&1)"; then
  if [ -n "$alembic_output" ]; then
    while IFS= read -r line; do
      log_json "INFO" "$line"
    done <<<"$alembic_output"
  fi
else
  while IFS= read -r line; do
    log_json "ERROR" "$line"
  done <<<"$alembic_output"
  exit 1
fi

log_json "INFO" "Iniciando servidor API com Uvicorn"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
