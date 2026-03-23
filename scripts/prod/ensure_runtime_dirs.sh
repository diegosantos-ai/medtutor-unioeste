#!/usr/bin/env bash
set -euo pipefail

: "${DOMAIN_NAME:?DOMAIN_NAME is required}"

runtime_root="${RUNTIME_ROOT:-.runtime/prod}"
live_dir="$runtime_root/letsencrypt/live/$DOMAIN_NAME"
acme_dir="$runtime_root/certbot/.well-known/acme-challenge"

mkdir -p "$live_dir" "$acme_dir"
