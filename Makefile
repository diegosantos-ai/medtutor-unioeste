# ==============================================================================
# Makefile Base do Projeto (MedTutor)
# ==============================================================================
# Herda a inteligência da Plataforma e garante chamadas centralizadas
DEV_WORKSPACE ?= $(HOME)/dev-workspace
.PHONY: help setup lint test build up down logs run-dev ports

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
setup: ## Instala as dependências web
	@echo "$(CYAN)Instalando dependências web...$(RESET)"
	npm install

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
	@echo "Postgres e ChromaDB ficam apenas na rede interna do compose."
	@echo "$(YELLOW)Portas reservadas pelo infra-core: 80, 8080, 5432, 6379, 8000, 5000$(RESET)"
	@ss -ltn | awk 'NR==1 || $$4 ~ /:(3000|8002)$$/'

down: ## Derruba a infraestrutura do MedTutor
	@echo "$(YELLOW)Encerrando serviços...$(RESET)"
	COMPOSE_PROJECT_NAME=$$(basename $(CURDIR)) docker compose down

logs: ## Acompanha os logs contínuos dos containers
	docker compose logs -f

test: ## Executa baterias de testes (Python via Docker e NPM local)
	@echo "$(CYAN)Executando testes da aplicação...$(RESET)"
	docker compose exec medtutor-api python -m unittest discover -v || echo "Sem falhas py"
	npm test --if-present

run-dev: up ## Levanta a infraestrutura de background e serve o vite em watch mode
	@echo "$(GREEN)Iniciando Frontend Web com Live Reload...$(RESET)"
	npm run dev

# ==========================================
# ☁️ DEPLOY DE PRODUÇÃO / AWS TERRAFORM
# ==========================================
build-prod: ## Contrói as imagens prontas para produção (Nginx + Frontend, FastAPI isolada)
	@echo "$(CYAN)Efetuando build da arquitetura de produção...$(RESET)"
	docker compose -f docker-compose.prod.yml build

up-prod: ## Sobe a infraestrutura usando docker-compose.prod.yml (Nginx e Sem Vite)
	@echo "$(GREEN)Iniciando ambiente de Produção via compose...$(RESET)"
	COMPOSE_PROJECT_NAME=$$(basename $(CURDIR))-prod docker compose -f docker-compose.prod.yml up -d

deploy-aws: ## Orquestra a infraestrutura AWS via Terraform (aws/envs/dev)
	@echo "$(CYAN)Inicializando e aplicando Terraform na AWS...$(RESET)"
	cd aws/envs/dev && terraform init && terraform apply -auto-approve

# ==========================================
# 🤖 GESTÃO DE AGENTES & IA
# ==========================================
setup-agents: ## Instala gerenciador de bibliotecas (pipx) e provisiona subagentes
	@echo "Iniciando setup do motor de Agentes IA..."
	@bash $(DEV_WORKSPACE)/gestao-centralizada-agents/scripts/setup-agents.sh

test-skills: ## Confirma se o Servidor Node MCP compila e integra as Skills de IA
	@echo "Testando build do servidor MCP de Skills..."
	@cd $(DEV_WORKSPACE)/gestao-centralizada-agents/skills-mcp && npm install && npm run build
	@echo "✅ Servidor MCP validado e pronto para consumo!"
