# MedTutor - UNIOESTE Edition

MedTutor e uma plataforma de apoio ao estudo para o vestibular de Medicina da UNIOESTE, com frontend React/Vite, backend FastAPI, persistencia em PostgreSQL e suporte a RAG com ChromaDB.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: Python 3.13, FastAPI, SQLAlchemy, Alembic
- Banco relacional: PostgreSQL
- Banco vetorial: ChromaDB
- IA: Gemini
- Empacotamento local: Docker Compose

## Execucao Local

### Docker

1. Ajuste as variaveis locais:

```bash
cp .env.example .env
```

2. Suba a stack:

```bash
make up
```

3. Verifique as portas alocadas:

```bash
make ports
```

### Endpoints locais

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8002`
- Swagger: `http://localhost:8002/docs`

## Politica de Portas

Este projeto segue o padrao de portas do workspace compartilhado.

- O backend publica a API na porta host `8002`
- O frontend publica a UI na porta host `3000`
- PostgreSQL e ChromaDB nao sao publicados no host
- PostgreSQL e ChromaDB ficam acessiveis apenas na rede interna do `docker compose`

Motivo:

- Evitar colisao com a infraestrutura compartilhada `infra-core`
- Respeitar as portas reservadas do workspace: `80`, `8080`, `5432`, `6379`, `8000`, `5000`
- Manter o projeto reprodutivel em paralelo com outros servicos locais

## Convivencia com Infra-Core

Se o ambiente `infra-core` estiver ativo na maquina, este projeto continua funcional porque:

- nao tenta publicar `5432` no host
- nao tenta publicar `8000` no host
- usa apenas `3000` para frontend e `8002` para backend

O trafego interno entre `backend`, `postgres` e `chromadb` usa nomes de servico do proprio `docker compose`:

- `postgres:5432`
- `chromadb:8000`

## Variaveis de Ambiente

As variaveis base ficam em [.env.example](/home/diego/labs/projects/medtutor-unioeste/.env.example).

Variaveis principais:

- `BACKEND_PORT`
- `BACKEND_INTERNAL_PORT`
- `FRONTEND_PORT`
- `DATABASE_URL`
- `CHROMA_URL`
- `DB_WAIT_TIMEOUT`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

## Comandos Uteis

- `make setup`: instala dependencias locais e registra os hooks do `pre-commit`
- `make up`: sobe a stack local
- `make down`: derruba a stack
- `make logs`: acompanha logs dos containers
- `make build`: reconstrui as imagens
- `make ports`: mostra as portas locais do projeto
- `make lint`: executa os hooks de qualidade

## Qualidade e Seguranca

O projeto bloqueia falhas antes do commit via `pre-commit`.

Hooks ativos:

- `gitleaks`: deteccao de segredos
- `terraform_tflint`: lint de Terraform
- `shellcheck`: validacao de scripts shell
- `ruff` e `ruff-format`: lint e formatacao Python
- validacoes auxiliares de YAML, conflitos de merge, chaves privadas e whitespace

Fluxo recomendado:

```bash
make setup
make lint
```

Comandos de teste mais uteis:

```bash
make setup
make lint
make up
make ports
curl http://localhost:8002/api/health
curl -I http://localhost:8002/docs
curl -I http://localhost:3000/
```

Se quiser executar diretamente os hooks sem passar pelo `Makefile`:

```bash
PATH="$HOME/.local/bin:$PATH" pre-commit run --all-files
```

## Estrutura

- `backend/`: API FastAPI, migrations e servicos Python
- `components/`, `App.tsx`, `index.tsx`: frontend React
- `docker-compose.yml`: orquestracao local
- `Dockerfile.frontend`: build e runtime do frontend
- `backend/Dockerfile`: build e runtime do backend
- `nginx.conf`: entrega do frontend e proxy para a API

## Observacoes Operacionais

- O `entrypoint.sh` do backend aguarda o banco, aplica migrations do Alembic e depois sobe o Uvicorn
- O frontend usa Nginx com proxy para o backend na rede interna do compose
- O backend sobe mesmo sem `GEMINI_API_KEY`; nesse caso, apenas os fluxos de IA ficam indisponiveis
