#!/usr/bin/env bash
set -e

echo "=> Iniciando processo de provisionamento do Banco de Dados..."
alembic upgrade head

echo "=> Iniciando Servidor API (Uvicorn)..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
