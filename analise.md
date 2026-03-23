# Análise Técnica de Onboarding - MedTutor UNIOESTE

**Data da Análise:** Março de 2026
**Engenheiro:** Diego Santos

---

## 1. Objetivo do projeto
- **O que o projeto faz:** É um assistente de estudos guiado por Inteligência Artificial (AI-powered study assistant). Ele ajuda a organizar cronogramas de estudo, rastrear progresso, sugerir missões diárias e serve como um Tutor que responde dúvidas via chat sobre as matérias.
- **Qual problema resolve:** A dificuldade de organização e acesso a esclarecimentos teóricos de qualidade direcionados a um vestibular bastante específico.
- **Quem é o usuário principal:** Estudantes/Vestibulandos prestando o exame de Medicina da UNIOESTE (Baseado no `README.md`).
- **O que está claro:** A funcionalidade de Onboarding (geração de plano), o escopo do Tutor Socrático (não dar a resposta fácil) e as trilhas de estudo (`design.md`).
- **O que está mal definido (Inferência):** O `PLAN-RAG-IMPLEMENTATION.md` cita "processar +100 PDFs", porém não especifica o limite técnico de processamento e os riscos de rate-limit da API externa durante a indexação. A documentação exige que os PDFs fiquem numa pasta `base_conhecimento/`, mas não é claro no repositório de onde ou como esses arquivos grandes entram no CI/CD ou repositório.

## 2. Stack e arquitetura
- **Frontend:** React 19, TypeScript, Tailwind CSS v3 e Vite. (Baseado no `package.json`).
- **Backend:** FastAPI (Python), SQLAlchemy, Alembic (migrações). (Baseado em `backend/requirements.txt`).
- **IA e RAG:** Google Generative AI (LLM `gemini-2.5-flash` e embeddings), LangChain e vetorização via ChromaDB.
- **Banco e Cache:** PostgreSQL 15 e Redis 7 (`docker-compose.yml`).
- **Observabilidade:** Stack Grafana madura com Prometheus (métricas) e Loki+Promtail (rastreio de logs em contêineres).
- **Infraestrutura e CI/CD:** Contêinerização via Docker/Docker Compose para ambiente local, Provisionamento de Cloud (AWS) com módulos Terraform (na pasta `aws/envs/dev`) e Github Actions para CI/CD (`.github/workflows/`).
- **Conectividade:** O ambiente local se cruza inteiramente pela rede docker interna `medtutor-net`, enquanto o FE e BE se unem via REST. O BE consulta ativamente a API Externa do Gemini.

## 3. Estrutura do repositório
- **`/backend/`**: Coração da aplicação servidora. `app/main.py` é a entrada. Também contém os schemas, modelos, migrações e serviços como `ai_service.py` e `rag_service.py`.
- **Raiz (`/` e `/components/`)**: Estrutura atípica de frontend. Em vez de uma pasta `/src/`, os componentes (`TutorChat.tsx`, etc) e a entrada do React (`App.tsx`, `index.tsx`) fluem diretamente junto ao root e configs do pacote Vite.
- **`/aws/` e `/infra/`**: `aws` acopla todos os módulos e state do Terraform. `infra` contém os arquivos vitais de provisionamento de observabilidade (`prometheus.yml`, `promtail-config.yaml`).
- **`/docs/` e `*.md` root**: Arquivos de especificações e diretrizes fortes (`AGENTS.md`, `design.md`, `PLAN-RAG-IMPLEMENTATION.md`).
- **`Makefile`**: Orquestrador e entrada principal do dev para qualquer operação vital no repositório.

## 4. Como executar com segurança
- **Pré-requisitos:** Docker, Node.js, Python, Make, e acesso a um bash em conformidade POSIX.
- **Variáveis de ambiente necessárias:** `GEMINI_API_KEY` (Obrigatória no ambiente host, devido à política Zsh Pass-through do `AGENTS.md`).
- **Comandos Reais (citando o `Makefile`):**
  - `make setup`: Instala node_modules frontend.
  - `make build` e `make up`: Sobe o core Docker (API e Bancos/Observabilidade em background).
  - `make run-dev`: Serve o Vite frontend na máquina local em watch mode.
  - `make test`: Roda os testes Python (`unittest`) dentro do contêiner e em seguida NPM tests locais.
  - `make lint`: Roda o `pre-commit` para checagem estática (POSIX e gitleaks).
- **Como validar cada etapa:**
  - Validar serviços: Dar `docker ps` e verificar conteineres nas portas 8096 (API), 5432 (Postgres), 6379 (Redis), 8000 (Chroma), 3000 (Grafana).
  - Validar UI: Acessar porta 5173 no browser.
- **O que pode falhar e por quê:** Conflito de port bind (ex: ter postgres rodando nativo na 5432 do seu SO Linux) e quebra do motor de RAG caso `GEMINI_API_KEY` termine em string vazia.

## 5. Fluxo principal do sistema
- **Entrada (Onboarding):** Frontend captura estilo, dias de prova e deficiências do estudante e bate POST no FastAPI.
- **Processamento 1 (Planner):** Backend (`ai_service.py` na funcao `generate_study_plan`) passa metadados ao Gemini com um prompt focado e aguarda um JSON. Parseia o JSON anexando URLs de video validadas de Mock (`video_database.py`).
- **Entrada (Dúvidas/Chat):** Usuário pergunta algo no "TutorChat".
- **Processamento 2 (RAG):** O Backend (`rag_service.py/query_context`) faz Embed da pergunta -> Busca Top-K similaridades no ChromaDB.
- **Processamento 3 (Context Answer):** Injeta o contexto recuperado junto ao "Chain of Thought" do coordenador num prompt rigoroso. Retorna ao usuário a explicação e a fonte documental.
- **Entrega de valor:** Guiar aluno, montar base de estudo, rastrear falhas e ser um tirador de dúvidas contido (que ajuda a pensar e não dá respostas mastigadas).

## 6. Dependências e integrações
- **APIs Externas Críticas:** Baseado pesadamente na engine do Google: **Google Generative AI via Langchain** (`gemini-2.5-flash` para geração e `gemini-embedding-001` para vetorização vetorial).
- **Bancos Locais:** ChromaDB para vetores semânticos, PostgreSQL. Redis para possível rate-limit/cache futuros.
- **Provedores de Infra:** Terraform apontado para **AWS** VPC, EC2, SG via Action de Deploy (citado nos `.github/workflows`). Para frontend puro, o `README` sugere Vercel.

## 7. Estado atual e maturidade
- **Nível:** Projeto no estágio "Produção Inicial (MVP Avançado)".
- **Sinais:** Possui telemetria completa Dockerizada via stack modern (Grafana/Loki/Prom). Scripts Terraform modulares e workflows CI/CD já implementados.
- **Conflito de Documentação:** O `PLAN-RAG-IMPLEMENTATION.md` diz que o serviço RAG está usando Mocks. *No entanto*, o arquivo atual `backend/app/rag_service.py` possui funções altamente complexificadas com Instâncias VectorStore puras ChromaDB, carregamento PyPDF e queries reais prontas para rodar. Isto infere que a sprint de transição RAG já rodou pesadamente, mas não checou o checkbox na doc.

## 8. Riscos técnicos e operacionais
*(Fatos observáveis)*
- **Bottleneck Síncrono de Ingestão:** Em `rag_service.py`, a função `ingest_folder()` varre os PDFs iterativamente local. Como não usa filas amadurecidas (como Celery ou BackgroundTasks do FastAPI em brokers), se disparado em Endpoint, causará timeouts do HTTP massivos e punições de rate limit do Google Embeddings.
- **Root Pattern do Frontend:** Os componentes React UI (`Components/`, `App.tsx`, TS configs) flutuam ao lado das pastas raízes do projeto (`backend/`, `aws/`). Além de misturar IA com React, expõe os arquivos UI a perdas acidentais, exigindo segregação via Monorepo tools.
- **Dependência Frágil em RAG Source:** O código (`test_rag.py` e config) esperam um diretório chamado `base_conhecimento/` recheado de PDFs volumosos (100+). Não vi esse diretório ser tratado por scripts CI/CD nem no Terraform (que cria instâncias Web, mas não Buckets S3 de extração). Inferência: Essa base está local apenas na máquina de quem coda.

## 9. Próximo passo recomendado
- A principal função de valor que pode causar quebras irreversíveis é o Retrieval-Augmented Generation (RAG). **O próximo passo inteligente é testar o núcleo da malha RAG (Isolado de Rotas).**
- **Como validar:** Rodar no terminal hospedeiro: `docker compose exec medtutor-api python test_rag.py`.
- **Critério de Sucesso:** O STDOUT do Python não alertar Tracebacks de GoogleAPIError. Ele deve conseguir instanciar o objeto Chroma nas coleções locais mapeadas por volume, imprimir `# documents found` (mesmo se for zero) sem fechar a execução em código 1. Somente após a premissa de que a engine de banco de dados se comunica limpa com a Google API internamente, podemos refatorar ou escalar código.

## 10. Resumo executivo
O MedTutor é um MVP robusto que entrega um cursinho/tutor socrático via IA (`gemini-2.5-flash`) atrelado a um Frontend em Vite/React. Roda amarrado via `Makefile` gerenciando módulos Backend integrados (`FastAPI`, Postgres, Redis, ChromaDB, Observabilidade). Depende criticamente da integridade da conexão Gemini API e persistência ChromaDB para vetores. O principal risco latente é tentar processar de modo síncrono milhares de PDFs via RAG, o que causará Rate Limit Block ou Timeouts de servidor. Antes de implementar qualquer código novo, o passo ideal é simular a integração local do `test_rag.py` para atestar a comunicação Vector-DB vs Google Embeddings.
