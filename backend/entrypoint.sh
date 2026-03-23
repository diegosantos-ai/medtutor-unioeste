#!/usr/bin/env bash
set -e

DB_WAIT_TIMEOUT="${DB_WAIT_TIMEOUT:-60}"

echo "=> Aguardando banco de dados ficar acessível..."
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
        print("=> Banco de dados disponível.")
        break
    except Exception as exc:
        last_error = exc
        time.sleep(2)
else:
    raise SystemExit(f"Nao foi possivel conectar ao banco em {timeout}s: {last_error}")
PY

echo "=> Iniciando processo de provisionamento do Banco de Dados..."
alembic upgrade head

echo "=> Iniciando Servidor API (Uvicorn)..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
