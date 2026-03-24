# ==============================================================================
# Makefile Deploy OVH - MedTutor
# ==============================================================================

DOMAIN_NAME ?= medtutor.webapps.codes
LETSENCRYPT_EMAIL ?= santos.diegoj86@gmail.com
CORS_ALLOWED_ORIGINS ?= https://$(DOMAIN_NAME)

.PHONY: help bootstrap-prod fetch-env prepare-runtime build up down logs ssl

help: ## Mostra esta mensagem de ajuda
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

fetch-env: ## Baixa variáveis de ambiente do .env local
	./scripts/prod/fetch_env.sh

prepare-runtime: ## Prepara diretórios e certificado auto-assinado
	DOMAIN_NAME="$(DOMAIN_NAME)" \
	LETSENCRYPT_EMAIL="$(LETSENCRYPT_EMAIL)" \
	CORS_ALLOWED_ORIGINS="$(CORS_ALLOWED_ORIGINS)" \
	./scripts/prod/sync_settings_env.sh
	DOMAIN_NAME="$(DOMAIN_NAME)" ./scripts/prod/ensure_runtime_dirs.sh
	DOMAIN_NAME="$(DOMAIN_NAME)" ./scripts/prod/init_self_signed_cert.sh

build: ## Contrói as imagens Docker
	docker compose --env-file .runtime/prod/app.env -f docker-compose.prod.yml build

up: ## Sobe todos os containers
	docker compose --env-file .runtime/prod/app.env -f docker-compose.prod.yml up -d

down: ## Para todos os containers
	docker compose --env-file .runtime/prod/app.env -f docker-compose.prod.yml down

logs: ## Mostra logs de todos os serviços
	docker compose --env-file .runtime/prod/app.env -f docker-compose.prod.yml logs -f

ps: ## Mostra status dos containers
	docker compose --env-file .runtime/prod/app.env -f docker-compose.prod.yml ps

ssl: ## Emite certificado Let's Encrypt
	DOMAIN_NAME="$(DOMAIN_NAME)" \
	LETSENCRYPT_EMAIL="$(LETSENCRYPT_EMAIL)" \
	./scripts/prod/issue_ssl.sh

bootstrap-prod: fetch-env prepare-runtime build up ## Deploy completo em produção
	@echo "Deploy concluído! Acesse https://$(DOMAIN_NAME)"
