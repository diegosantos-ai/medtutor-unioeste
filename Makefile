# ==============================================================================
# Makefile Base do Projeto (MedTutor)
# ==============================================================================
# Herda a inteligência da Plataforma e garante chamadas centralizadas
DEV_WORKSPACE ?= $(HOME)/dev-workspace
.PHONY: help setup lint test build up down logs logs-observability run-dev ports observability prepare-prod-runtime fetch-prod-secrets bootstrap-prod build-prod up-prod down-prod logs-prod issue-prod-ssl renew-prod-ssl deploy-aws-prod

# Cores para output
CYAN := \033[36m
RESET := \033[0m
GREEN := \033[32m
YELLOW := \033[33m

help: ## Mostra esta mensagem de ajuda
	@echo "$(YELLOW)========================================================$(RESET)"
	@echo "$(GREEN) Comandos Disponíveis - MedTutor$(RESET)"
	@echo "$(YELLOW)========================================================$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(CYAN)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# ==========================================
# 🛡️ QUALIDADE (Repassada via Plataforma Mãe)
# ==========================================
lint: ## Executa linters e verificação estática repassando ao ruleset matriz
	@echo "Executando pre-commit hooks globais..."
	PATH="$$HOME/.local/bin:$$PATH" pre-commit run --all-files

# ==========================================
# 🚀 CORE DA APLICAÇÃO MEDTUTOR
# ==========================================
setup: ## Instala dependências locais e configura hooks de pre-commit
	@echo "$(CYAN)Instalando dependências web...$(RESET)"
	npm install
	@echo "$(CYAN)Instalando pre-commit no ambiente do usuário...$(RESET)"
	python3 -m pip install --user pre-commit
	@echo "$(CYAN)Registrando hooks locais do Git...$(RESET)"
	PATH="$$HOME/.local/bin:$$PATH" pre-commit install
	PATH="$$HOME/.local/bin:$$PATH" pre-commit install --hook-type commit-msg
	PATH="$$HOME/.local/bin:$$PATH" pre-commit install-hooks

build: setup ## Constrói as imagens Docker do MedTutor
	@echo "$(CYAN)Efetuando build dos containers...$(RESET)"
	docker compose build

up: ## Sobe a infraestrutura MedTutor usando padrão de isolamento
	@echo "$(GREEN)Iniciando ambiente Docker isolado...$(RESET)"
	COMPOSE_PROJECT_NAME=$$(basename $(CURDIR)) docker compose up -d

ports: ## Mostra as portas locais alocadas e a política do projeto
	@echo "$(CYAN)Portas do projeto MedTutor$(RESET)"
	@echo "Backend  -> http://localhost:$${BACKEND_PORT:-8002}"
	@echo "Frontend -> http://localhost:$${FRONTEND_PORT:-3000}"
	@echo "Grafana  -> http://localhost:$${GRAFANA_PORT:-3001}"
	@echo "Postgres e ChromaDB ficam apenas na rede interna do compose."
	@echo "$(YELLOW)Portas reservadas pelo infra-core: 80, 8080, 5432, 6379, 8000, 5000$(RESET)"
	@ss -ltn | awk 'NR==1 || $$4 ~ /:(3000|3001|8002)$$/'

down: ## Derruba a infraestrutura do MedTutor
	@echo "$(YELLOW)Encerrando serviços...$(RESET)"
	COMPOSE_PROJECT_NAME=$$(basename $(CURDIR)) docker compose down

logs: ## Acompanha os logs contínuos dos containers
	docker compose logs -f

logs-observability: ## Acompanha apenas Loki, Promtail e backend
	docker compose logs -f loki promtail backend

observability: ## Mostra o stack de observabilidade em execucao
	docker compose ps loki promtail prometheus grafana

test: ## Executa baterias de testes (Python via Docker e NPM local)
	@echo "$(CYAN)Executando testes da aplicação...$(RESET)"
	@docker compose config -q
	@if ! docker compose ps --status running backend | tail -n +2 | grep -q .; then \
		echo "Backend nao esta em execucao. Rode 'make up' antes de 'make test'."; \
		exit 1; \
	fi
	docker compose exec backend python test_rag.py
	npm test --if-present

run-dev: up ## Levanta a infraestrutura de background e serve o vite em watch mode
	@echo "$(GREEN)Iniciando Frontend Web com Live Reload...$(RESET)"
	npm run dev

# ==========================================
# ☁️ DEPLOY DE PRODUÇÃO / AWS TERRAFORM
# ==========================================
build-prod: ## Contrói as imagens prontas para produção (Nginx + Frontend, FastAPI isolada)
	@echo "$(CYAN)Efetuando build da arquitetura de produção...$(RESET)"
	@mkdir -p .runtime/prod
	@touch .runtime/prod/app.env
	DOMAIN_NAME="$${DOMAIN_NAME:?DOMAIN_NAME is required}" \
	CORS_ALLOWED_ORIGINS="$${CORS_ALLOWED_ORIGINS:-https://$${DOMAIN_NAME}}" \
	./scripts/prod/compose.sh build

prepare-prod-runtime: ## Cria runtime dirs e certificado self-signed temporário
	DOMAIN_NAME="$${DOMAIN_NAME:?DOMAIN_NAME is required}" \
	LETSENCRYPT_EMAIL="$${LETSENCRYPT_EMAIL:-}" \
	CORS_ALLOWED_ORIGINS="$${CORS_ALLOWED_ORIGINS:-https://$${DOMAIN_NAME}}" \
	./scripts/prod/sync_settings_env.sh
	DOMAIN_NAME="$${DOMAIN_NAME:?DOMAIN_NAME is required}" ./scripts/prod/ensure_runtime_dirs.sh
	DOMAIN_NAME="$${DOMAIN_NAME:?DOMAIN_NAME is required}" ./scripts/prod/init_self_signed_cert.sh

fetch-prod-secrets: ## Busca segredos do SSM e materializa env de runtime da producao
	AWS_REGION="$${AWS_REGION:?AWS_REGION is required}" \
	POSTGRES_PASSWORD_SSM_PARAMETER="$${POSTGRES_PASSWORD_SSM_PARAMETER:?POSTGRES_PASSWORD_SSM_PARAMETER is required}" \
	GRAFANA_ADMIN_USER_SSM_PARAMETER="$${GRAFANA_ADMIN_USER_SSM_PARAMETER:?GRAFANA_ADMIN_USER_SSM_PARAMETER is required}" \
	GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER="$${GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER:?GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER is required}" \
	GEMINI_API_KEY_SSM_PARAMETER="$${GEMINI_API_KEY_SSM_PARAMETER:-}" \
	OPENAI_API_KEY_SSM_PARAMETER="$${OPENAI_API_KEY_SSM_PARAMETER:-}" \
	./scripts/prod/fetch_ssm_env.sh

bootstrap-prod: ## Prepara runtime, busca secrets e sobe a stack de producao
	$(MAKE) prepare-prod-runtime \
		DOMAIN_NAME="$${DOMAIN_NAME:?DOMAIN_NAME is required}" \
		LETSENCRYPT_EMAIL="$${LETSENCRYPT_EMAIL:-}" \
		CORS_ALLOWED_ORIGINS="$${CORS_ALLOWED_ORIGINS:-https://$${DOMAIN_NAME}}"
	$(MAKE) fetch-prod-secrets \
		AWS_REGION="$${AWS_REGION:?AWS_REGION is required}" \
		POSTGRES_PASSWORD_SSM_PARAMETER="$${POSTGRES_PASSWORD_SSM_PARAMETER:?POSTGRES_PASSWORD_SSM_PARAMETER is required}" \
		GRAFANA_ADMIN_USER_SSM_PARAMETER="$${GRAFANA_ADMIN_USER_SSM_PARAMETER:?GRAFANA_ADMIN_USER_SSM_PARAMETER is required}" \
		GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER="$${GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER:?GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER is required}" \
		GEMINI_API_KEY_SSM_PARAMETER="$${GEMINI_API_KEY_SSM_PARAMETER:-}" \
		OPENAI_API_KEY_SSM_PARAMETER="$${OPENAI_API_KEY_SSM_PARAMETER:-}"
	$(MAKE) build-prod DOMAIN_NAME="$${DOMAIN_NAME:?DOMAIN_NAME is required}" CORS_ALLOWED_ORIGINS="$${CORS_ALLOWED_ORIGINS:-https://$${DOMAIN_NAME}}"
	$(MAKE) up-prod DOMAIN_NAME="$${DOMAIN_NAME:?DOMAIN_NAME is required}" CORS_ALLOWED_ORIGINS="$${CORS_ALLOWED_ORIGINS:-https://$${DOMAIN_NAME}}"

up-prod: prepare-prod-runtime ## Sobe a infraestrutura usando docker-compose.prod.yml com HTTPS e servicos internos
	@echo "$(GREEN)Iniciando ambiente de Produção via compose...$(RESET)"
	DOMAIN_NAME="$${DOMAIN_NAME:?DOMAIN_NAME is required}" \
	CORS_ALLOWED_ORIGINS="$${CORS_ALLOWED_ORIGINS:-https://$${DOMAIN_NAME}}" \
	./scripts/prod/compose.sh up -d backend frontend postgres chromadb loki prometheus promtail grafana

deploy-aws: ## Orquestra a infraestrutura AWS via Terraform (aws/envs/dev)
	@echo "$(CYAN)Inicializando e aplicando Terraform na AWS...$(RESET)"
	cd aws/envs/dev && terraform init && terraform apply -auto-approve

deploy-aws-prod: ## Orquestra a infraestrutura AWS via Terraform (aws/envs/prod)
	@echo "$(CYAN)Inicializando e aplicando Terraform na AWS de produção...$(RESET)"
	cd aws/envs/prod && terraform init && terraform apply -auto-approve

down-prod: ## Derruba a stack de producao
	./scripts/prod/compose.sh down

logs-prod: ## Acompanha logs da stack de producao
	./scripts/prod/compose.sh logs -f

issue-prod-ssl: ## Emite certificado Lets Encrypt apos o DNS resolver para a instancia
	DOMAIN_NAME="$${DOMAIN_NAME:-}" \
	LETSENCRYPT_EMAIL="$${LETSENCRYPT_EMAIL:-}" \
	./scripts/prod/issue_ssl.sh

renew-prod-ssl: ## Renova certificados Lets Encrypt e recarrega o Nginx
	./scripts/prod/renew_ssl.sh

# ==========================================
# 🤖 GESTÃO DE AGENTES & IA
# ==========================================
setup-agents: ## Instala gerenciador de bibliotecas (pipx) e provisiona subagentes
	@echo "Iniciando setup do motor de Agentes IA..."
	@DEV_CANDIDATES="$(DEV_WORKSPACE) $(DEV_WORKSPACE_DEFAULT) $(HOME)/dev-workspace $(HOME)/labs/dev-workspace"; \
	FOUND=$$(find $(HOME) -maxdepth 3 -type d -name gestao-centralizada-agents 2>/dev/null | head -n1); \
	if [ -n "$$FOUND" ]; then DEV_CANDIDATES="$$DEV_CANDIDATES $$(dirname $$FOUND)"; fi; \
	for d in $$DEV_CANDIDATES; do \
		if [ -f "$$d/gestao-centralizada-agents/scripts/setup-agents.sh" ]; then \
			echo "Usando $$d/gestao-centralizada-agents/scripts/setup-agents.sh"; \
			bash "$$d/gestao-centralizada-agents/scripts/setup-agents.sh"; \
			exit 0; \
		fi; \
	done; \
	echo "Arquivo setup-agents.sh não encontrado em: $$DEV_CANDIDATES"; exit 1

test-skills: ## Confirma se o Servidor Node MCP compila e integra as Skills de IA
	@echo "Testando build do servidor MCP de Skills..."
	@DEV_CANDIDATES="$(DEV_WORKSPACE) $(DEV_WORKSPACE_DEFAULT) $(HOME)/dev-workspace $(HOME)/labs/dev-workspace"; \
	FOUND=$$(find $(HOME) -maxdepth 3 -type d -name gestao-centralizada-agents 2>/dev/null | head -n1); \
	if [ -n "$$FOUND" ]; then DEV_CANDIDATES="$$DEV_CANDIDATES $$(dirname $$FOUND)"; fi; \
	for d in $$DEV_CANDIDATES; do \
		if [ -d "$$d/gestao-centralizada-agents/skills-mcp" ]; then \
			echo "Usando $$d/gestao-centralizada-agents/skills-mcp"; \
			cd "$$d/gestao-centralizada-agents/skills-mcp" && npm install && npm run build; \
			exit 0; \
		fi; \
	done; \
	echo "Diretório skills-mcp não encontrado em: $$DEV_CANDIDATES"; exit 2
	@echo "✅ Servidor MCP validado e pronto para consumo!"
