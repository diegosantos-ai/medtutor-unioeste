# ARQUITETURA: MedTutor - Pré-Vestibular UNIOESTE

## 1. Stack Tecnológica
- **Backend:** Python 3.13 (FastAPI) para processamento de lógica e API.
- **Frontend:** React + Vite (TypeScript) para interface do usuário.
- **Banco de Dados Relacional:** PostgreSQL para persistência de usuários e metadados.
- **Banco de Dados Vetorial:** ChromaDB para suporte ao motor de RAG (Retrieval-Augmented Generation).
- **IA/LLM:** Google Gemini via SDK genai para tutoria e resumos.

## 2. Infraestrutura e IaC (AWS)
A infraestrutura é tratada como um produto de plataforma, seguindo a separação rigorosa entre lógica e estado[cite: 9, 11].
- **Módulos Virtuais:** Localizados em `aws/modules/`, contêm as definições agnósticas de rede, segurança e computação[cite: 18, 19].
- **Ambientes (Envs):** Localizados em `aws/envs/`, onde as variáveis específicas e o state remoto residem de forma isolada para `dev` e `prod`[cite: 20, 92].
- **Provedor:** AWS (Região `us-east-1`) gerenciado via Terraform[cite: 111].

## 3. Governança Docker e Redes
Para evitar colisões e garantir a reprodutibilidade, o projeto segue o padrão de portas do `dev-workspace`.
- **Desenvolvimento Local:** Docker Compose orquestrando `frontend`, `backend`, `postgres` e `chromadb`.
- **Portas publicadas no host:** Frontend em `3000` e backend em `8002`.
- **Serviços internos:** PostgreSQL e ChromaDB ficam apenas na rede interna do Compose e não publicam portas no host.
- **Compatibilidade com infra-core:** O projeto não usa as portas reservadas `80`, `8080`, `5432`, `6379`, `8000` e `5000`.

## 4. Segurança (Shift-Left)
A segurança é validada localmente antes de qualquer interação com a nuvem[cite: 21, 81].
- **Secrets:** Proibição absoluta de credenciais hardcoded. Uso de `.env` (SST) excluído do controle de versão e monitorado pelo Gitleaks[cite: 93, 109, 110].
- **Linting:** Validação obrigatória via `pre-commit` para garantir conformidade de código e infraestrutura[cite: 70, 97, 132].

## 5. Observabilidade
- **Logs:** Logs estruturados em formato JSON para integração nativa com o stack Grafana/Loki[cite: 191].
- **Métricas:** Instrumentação via Prometheus para monitoramento de latência e saúde dos endpoints da API.
