#!/usr/bin/env bash
set -euo pipefail

./scripts/prod/compose.sh --profile certbot run --rm certbot renew --webroot --webroot-path /var/www/certbot
./scripts/prod/compose.sh exec frontend nginx -s reload
