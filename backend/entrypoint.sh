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
log_json "INFO" "Skipping alembic migrations (tables already exist with user_id PK)"
log_json "INFO" "Iniciando servidor API com Uvicorn"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
