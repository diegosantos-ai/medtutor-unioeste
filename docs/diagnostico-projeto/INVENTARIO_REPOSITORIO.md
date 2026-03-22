# Inventário de Repositório

Este documento mapeia todos os artefatos, dependências, linguagens e infraestrutura do repositório `medtutor-unioeste`.

## 1. Árvore da Stack Técnica

### **Frontend**
- **Framework Core:** React 19 executado via Vite.
- **Linguagem:** TypeScript (TS/TSX).
- **Estilização:** Tailwind CSS + PostCSS.
- **UI/UX:** Framer Motion (Animações), Lucide React (Ícones), Recharts (Gráficos).
- **Integração Externa:** `@google/generative-ai` acoplado diretamente à camada do cliente.

### **Backend**
- **Framework Core:** FastAPI (Python).
- **Linguagem:** Python 3.x.
- **Banco de Dados Relacional:** PostgreSQL (produção/container) / SQLite (desenvolvimento local fallback via SQLAlchemy e Alembic).
- **Banco de Dados Vetorial:** ChromaDB.
- **IA e Processamento:** Langchain, Google Generative AI, PyPDF, Sentence Transformers.

## 2. Automação Local & Orquestração
- **Entrypoint (`Makefile`):** Presente, porém atuando como ponte ("wrapper") acoplado para scripts locais de plataforma de terceiros (`~/dev-workspace`), e não para prover alvos granulares da stack técnica atual (falta `build`, `test`, `run`, `up`).
- **Containers (`docker-compose.yml`):** Provisiona o microserviço da API FastAPI e se acopla a uma rede externa (`nexo-infra-network`).
- **Gerenciamento de Dependências:** `npm` (com `package-lock.json` existente) no front-end, e `pip` com `requirements.txt` não isolado no back-end.

## 3. Integração Contínua (CI/CD)
- **Engine:** GitHub Actions (`.github/workflows/deploy.yml`).
- **Pipeline Atual:** Automação de deploy contínuo focado unicamente no **Frontend**, publicando em ambiente Vercel assim que novos códigos chegam à branch `main`.
- **Backend Pipeline:** Inexistente.

## 4. Segurança e Setup (Shift-Left)
- **Pre-commit Hooks:** Implementado proativamente via `.pre-commit-config.yaml` com bloqueadores de sintaxe YAML, auditorias de Bash, Terraform (inativo aqui) e detecção passiva de secrets com **Gitleaks**.
- **Isolamento de Estado:** Existe manifesto `.env.example`, porém desatualizado e desprovido das chaves mínimas requeridas.
