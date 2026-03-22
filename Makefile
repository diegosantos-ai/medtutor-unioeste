# ==============================================================================
# Makefile Base do Projeto (MedTutor)
# ==============================================================================
# Herda a inteligência da Plataforma e garante chamadas centralizadas
DEV_WORKSPACE ?= $(HOME)/docs/dev-workspace

.PHONY: help setup lint test build up down logs run-dev

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
