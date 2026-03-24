# MedTutor AI Study Platform

<div align="center">

Plataforma de estudo assistido por IA para preparação acadêmica de alta exigência, com trilhas de aprendizagem, tutor contextual, geração de materiais e suporte a RAG sobre conteúdos educacionais.

![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/UI-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Backend-Python_3.13-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![ChromaDB](https://img.shields.io/badge/VectorDB-ChromaDB-7B61FF)
![Gemini](https://img.shields.io/badge/LLM-Gemini-4285F4?logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Runtime-Docker_Compose-2496ED?logo=docker&logoColor=white)
![Observability](https://img.shields.io/badge/Observability-Grafana%20%7C%20Prometheus%20%7C%20Loki-F46800?logo=grafana&logoColor=white)

</div>

---

## Visão Geral

O **MedTutor** é uma aplicação full stack voltada para estudo guiado, com foco em:

- trilhas de aprendizagem por tema
- geração de material didático
- tutor conversacional com IA
- recuperação contextual com RAG
- persistência de progresso e sessões
- observabilidade operacional da stack

A arquitetura combina frontend web, API backend, banco relacional, banco vetorial e serviços de observabilidade para entregar uma experiência de estudo assistido por IA com base em conteúdos indexados.

---

## Principais Capacidades

- **Tutor contextual com IA** para apoio ao estudo
- **Geração de resumos e materiais didáticos**
- **RAG com ChromaDB** para grounding em conteúdos indexados
- **API FastAPI** com serviços estruturados
- **Persistência em PostgreSQL**
- **Interface web React + Vite**
- **Deploy containerizado com Docker Compose**
- **Observabilidade com Grafana, Loki, Promtail e Prometheus**

---

## Arquitetura da Solução

```mermaid
flowchart LR
    U[Usuário] --> F[Frontend React + Vite]
    F --> N[Nginx]
    N --> B[Backend FastAPI]

    B --> P[(PostgreSQL)]
    B --> C[(ChromaDB)]
    B --> G[Gemini API]

    B --> L[Loki]
    B --> PR[Prometheus]
    PF[Promtail] --> L
    GR[Grafana] --> L
    GR --> PR

    subgraph Application Layer
        F
        N
        B
    end

    subgraph Data Layer
        P
        C
    end

    subgraph AI Layer
        G
    end

    subgraph Observability
        PF
        L
        PR
        GR
    end
````

---

## Fluxo Macro da Aplicação

```mermaid
flowchart TD
    A[Usuário acessa a plataforma] --> B[Frontend renderiza jornada de estudo]
    B --> C[Requisição enviada para API]
    C --> D{Tipo de fluxo}

    D -->|Tutor| E[Backend consulta contexto e histórico]
    D -->|Resumo| F[Backend gera material didático]
    D -->|Busca contextual| G[Backend executa retrieval no ChromaDB]

    E --> H[Chamada ao modelo LLM]
    F --> H
    G --> I[Chunks relevantes]
    I --> H

    H --> J[Resposta estruturada]
    J --> K[Persistência e telemetria]
    K --> L[Frontend exibe resultado ao usuário]
```

---

## Stack Tecnológica

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Nginx para entrega estática e proxy reverso

### Backend

* Python 3.13
* FastAPI
* SQLAlchemy
* Alembic
* Uvicorn

### Dados e IA

* PostgreSQL
* ChromaDB
* Gemini

### Observabilidade

* Grafana
* Loki
* Prometheus
* Promtail

### Runtime

* Docker Compose

---

## Estrutura do Projeto

```text
.
├── backend/                  # API FastAPI, serviços, models e migrations
├── components/               # Componentes do frontend
├── App.tsx                   # Composição principal da aplicação
├── index.tsx                 # Entry point do frontend
├── docker-compose.yml        # Orquestração local e serviços
├── Dockerfile.frontend       # Build e runtime do frontend
├── backend/Dockerfile        # Build e runtime do backend
├── nginx.conf                # Entrega da UI e proxy para API
├── ovh/DEPLOY_OVH.md         # Guia de deploy em produção
└── .env.example              # Variáveis base do projeto
```

---

## Execução Local

### 1. Preparar variáveis de ambiente

```bash
cp .env.example .env
```

### 2. Subir a stack

```bash
make up
```

### 3. Validar serviços e portas

```bash
make ports
make ps
```

---

## Endpoints Locais

* Frontend: `http://localhost:3000`
* Backend: `http://localhost:8002`
* Swagger: `http://localhost:8002/docs`
* Grafana: `http://localhost:3001`

---

## Fluxo Operacional com Make

```bash
make setup
make lint
make up
make ports
make logs
```

Comandos úteis:

```bash
make setup                 # prepara ambiente local e hooks
make up                    # sobe a stack
make down                  # derruba a stack
make build                 # reconstrói as imagens
make ps                    # mostra status dos serviços
make ports                 # mostra portas publicadas
make logs                  # acompanha logs
make observability         # mostra stack de observabilidade
make logs-observability    # logs de observabilidade
make lint                  # executa validações e qualidade
make ssl                   # emissão/renovação de SSL em produção
```

---

## Variáveis de Ambiente

Principais variáveis:

* `BACKEND_PORT`
* `BACKEND_INTERNAL_PORT`
* `FRONTEND_PORT`
* `GRAFANA_PORT`
* `DOMAIN_NAME`
* `LETSENCRYPT_EMAIL`
* `CORS_ALLOWED_ORIGINS`
* `DATABASE_URL`
* `CHROMA_URL`
* `DB_WAIT_TIMEOUT`
* `GEMINI_API_KEY`
* `OPENAI_API_KEY`

Use `.env.example` como base de configuração.

---

## Qualidade e Segurança

O projeto aplica validações locais antes de commit via `pre-commit`.

Hooks utilizados:

* `gitleaks`
* `terraform_tflint`
* `shellcheck`
* `ruff`
* `ruff-format`
* validações auxiliares de YAML, merge, whitespace e chaves privadas

Fluxo recomendado:

```bash
make setup
make lint
```

---

## Observabilidade

A stack já sobe com componentes de observabilidade para diagnóstico operacional:

* **Loki** para agregação de logs
* **Promtail** para coleta de logs dos containers
* **Prometheus** para métricas
* **Grafana** para visualização

Fluxo rápido:

```bash
make up
make observability
make logs-observability
```

---

## Deploy de Produção

O deploy oficial de produção é realizado em VPS OVH.

Guia completo:

* `ovh/DEPLOY_OVH.md`

Resumo do fluxo:

1. provisionamento da VPS
2. instalação de Docker, Docker Compose, Git e Make
3. clonagem do repositório
4. configuração do `.env`
5. build e subida dos containers
6. emissão de SSL com Let's Encrypt
7. apontamento de DNS

---

## Política de Portas

Este projeto segue uma política de portas compatível com ambiente compartilhado:

* frontend publicado na porta `3000`
* backend publicado na porta `8002`
* PostgreSQL e ChromaDB expostos apenas na rede interna do compose

Isso evita colisão com serviços compartilhados e mantém o ambiente reproduzível.

---

## Validação Rápida

```bash
curl http://localhost:8002/api/health
curl -I http://localhost:8002/docs
curl -I http://localhost:3000/
```

---

## Direcionamento do Projeto

O MedTutor foi desenhado como uma base de aplicação para estudo assistido por IA, combinando:

* experiência web
* backend de serviços educacionais
* recuperação contextual com RAG
* integração com LLM
* persistência de dados
* operação observável em ambiente containerizado

---

## Licença

Defina aqui a licença oficial do projeto, se aplicável.

````
