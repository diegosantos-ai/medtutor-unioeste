# Guia de Infraestrutura — Nexo Basis

> **Para agentes:** Este é o documento de referência da infraestrutura. Leia-o completamente antes de qualquer ação. Em caso de dúvida, consulte Diego antes de modificar qualquer serviço.
>
> **Fonte de verdade de portas:** `PORTS.md` (atualizado em 2026-02-22). Em caso de conflito, `PORTS.md` prevalece.

---

## 1. Ambientes de Execução

Este projeto opera em três ambientes distintos. **Identifique onde você está antes de executar qualquer comando.**

| Ambiente | Quando usar | Caminho do repo de infra |
|----------|-------------|--------------------------|
| Windows (PowerShell/CMD) | Edição de arquivos local | `C:\Users\santo\infra` |
| WSL (Linux local) | Comandos bash, scripts locais | `/mnt/c/Users/santo/infra` ou `~/infra`¹ |
| VPS via SSH | Deploy, Docker, produção | `~/infra` |

> ¹ No WSL, recomenda-se criar um atalho fixo para evitar confusão:
> ```bash
> # Rodar uma única vez no WSL
> ln -s /mnt/c/Users/santo/infra ~/infra
> ```
> Após isso, `~/infra` funciona tanto no WSL quanto na VPS — um único caminho para memorizar.

### Como identificar em qual ambiente você está

```bash
# WSL local → prompt mostra algo como: usuario@DESKTOP-XXXXX
# VPS       → prompt mostra: usuario@vps-ae4a4ad2
# Confirmar com:
pwd        # mostra o diretório atual
hostname   # mostra o nome da máquina
```

### Regra de ouro para agentes

- **Nunca assuma o caminho.** Sempre confirme com `pwd` antes de operar.
- **Comandos Docker e scripts de deploy** → executar **somente na VPS** via SSH.
- **Edição de arquivos e desenvolvimento** → WSL ou Windows local.
- **Não misture contextos** em uma mesma sessão de comandos.

---

## 2. Ambiente (Referência Geral)

| Item | Valor |
|------|-------|
| Provedor | OVHcloud |
| IP | `15.204.174.145` |
| Hostname | `vps-ae4a4ad2.vps.ovh.us` |
| Repo infra (Windows) | `C:\Users\santo\infra` |
| Repo infra (WSL/VPS) | `~/infra` |
| Domínio base | `nexobasis.tech` |
| Rede Docker | `nexo-network` (bridge) |

**Acesso via SSH:**
```bash
ssh usuario@15.204.174.145
```
Credenciais: solicitar ao responsável. Nunca compartilhar em canais públicos.

---

## 3. Estrutura do Repositório de Infra

```
infra/
├── docker-compose.yml       # Orquestração principal
├── .env                     # Variáveis sensíveis (não versionar)
├── traefik/
│   ├── traefik.yml          # Entrypoints e configuração ACME
│   └── dynamic.yml          # Routers e middlewares por domínio
├── config/                  # Configurações adicionais de serviços
├── docker/                  # Dockerfiles customizados, se houver
├── scripts/
│   ├── deploy.sh            # Down → Up → aguarda 30s → monitor
│   ├── monitor.sh           # Health check nas portas e DBs
│   └── backup.sh            # Tar.gz de todos os volumes em ./backups/
└── docs/                    # Documentação complementar
```

---

## 4. Serviços e Portas

> Alinhado com `PORTS.md` — última atualização: 2026-02-22.
> **Todos os serviços rodam em Docker.** Não há serviços nativos no SO.

### Infraestrutura core

| Serviço | Container | Imagem | Porta (host:container) | Observação |
|---------|-----------|--------|------------------------|------------|
| PostgreSQL principal | `postgres` | `postgres:16-alpine` | `5432:5432` | DB: `agentes_nexobasis` |
| PostgreSQL pgvector | `postgres-vector` | `pgvector/pgvector:pg16` | `5433:5432` | DB: `nexobasis_vector` — extensão pgvector |
| Redis | `redis` | `redis:7-alpine` | `6379:6379` | ⚠️ Sem senha — ver Pendências |
| ChromaDB | `chromadb` | `chromadb/chroma:latest` | `8000:8000` | Vector store para RAG |
| MLflow | `mlflow` | `infra-nexo-mlflow:latest` | `5000:5000` | Tracking de experimentos |
| n8n | `n8n` | `n8nio/n8n:latest` | — | `n8n.nexobasis.com.br` — gateway WhatsApp + crons |

### APIs da plataforma

| Serviço | Container | Imagem | Porta (host→container) | Domínio | Status |
|---------|-----------|--------|------------------------|---------|--------|
| Nexo Conect | `nexo-suporte-api` | `nexo_suporte_atendimento-api:latest` | `8080→8080` | suporte.nexobasis.tech | ✅ Ativo |
| Agência Antigravity | `agencia-antigravity-api` | `agencia-antigravity-api:latest` | `8085→8080` | agencia.nexobasis.tech | ✅ Ativo |
| Nexo 360 | `nexo-360-api` | `nexo-360-new-api:latest` | `8090→8000` | api.nexobasis.tech | ✅ Ativo |
| Nexo Growth | `nexo-growth-api` | `nexo-360-new-nexo-growth:latest` | `8091→8000` | growth.nexobasis.tech | ✅ Ativo |
| Nexo Talent | `nexo-talent-api` | `nexo-360-new-nexo-talent:latest` | `8092→8000` | talent.nexobasis.tech | ✅ Ativo |
| Admin interno | `nexo-admin-api` | `nexo-360-new-nexo-admin:latest` | `8093→8000` | admin.nexobasis.tech | ✅ Ativo |
| Nexo Insights | `nexo-insights-api` | `nexo-360-new-nexo-insights:latest` | `8094→8000` | insights.nexobasis.tech | ✅ Ativo |
| Nexo Finance | `nexo-finance-api` | `nexo-360-new-nexo-finance:latest` | `8095→8000` | finance.nexobasis.tech | 🔜 A deployar |

### Proxy e roteamento

| Serviço | Container | Porta |
|---------|-----------|-------|
| Traefik (HTTP) | `traefik` | `80` |
| Traefik (HTTPS/TLS) | `traefik` | `443` |
| Traefik Dashboard | `traefik` | `8099` — ⚠️ inseguro, não expor publicamente |

---

## 5. Connection Strings

```bash
# PostgreSQL principal (agentes_nexobasis)
postgresql://USER:PASSWORD@localhost:5432/agentes_nexobasis

# PostgreSQL pgvector (nexobasis_vector)
postgresql://USER:PASSWORD@localhost:5433/nexobasis_vector

# Redis
redis://localhost:6379

# ChromaDB
http://localhost:8000

# MLflow
http://localhost:5000
```

---

## 6. Variáveis de Ambiente (`.env`)

O arquivo `.env` na raiz do repo é a fonte de verdade para todas as credenciais. **Não versionar.**

```env
DOMAIN=nexobasis.tech
TRAEFIK_EMAIL=seu@email.com

# PostgreSQL principal
POSTGRES_PASSWORD=...

# PostgreSQL pgvector
PGVECTOR_PASSWORD=...

JWT_SECRET_KEY=...
```

---

## 7. Volumes — Criação prévia obrigatória

Os volumes abaixo são **externos** e precisam existir antes de rodar `docker compose up`. Criar uma única vez:

```bash
docker volume create infra-nexo_postgres_data
docker volume create infra-nexo_mlflow_data
docker volume create infra-nexo_redis_data
docker volume create nexo-360-new_postgres_data
# Consultar docker-compose.yml para listar todos os volumes externos
```

---

## 8. Comandos Operacionais

**Recomendação: use sempre os scripts em `scripts/` em vez de comandos avulsos.**

### Via scripts (preferencial)

```bash
# Deploy completo (down + up + monitor)
bash scripts/deploy.sh

# Verificar saúde dos serviços
bash scripts/monitor.sh

# Backup de todos os volumes
bash scripts/backup.sh
```

### Comandos Docker avulsos (quando necessário)

```bash
# Subir todos os serviços
docker compose up -d

# Ver logs de um serviço específico
docker compose logs -f [container]

# Atualizar imagens
docker compose pull && docker compose up -d

# Parar tudo
docker compose down

# Status dos containers
docker compose ps
```

---

## 9. Traefik — Roteamento e TLS

- **`traefik/traefik.yml`:** define entrypoints (`web` na :80), provider de arquivos e configuração ACME (Let's Encrypt via httpChallenge). Certificados salvos no volume `traefik_letsencrypt`.
- **`traefik/dynamic.yml`:** define routers por host `*.nexobasis.tech`, middlewares de redirect e services apontando para os containers internos.

Para adicionar um novo domínio/serviço, edite `dynamic.yml` e reinicie o Traefik:

```bash
docker compose restart traefik
```

---

## 10. Pendências e Ajustes Conhecidos

Não ignorar em novos deploys.

| # | Item | Prioridade |
|---|------|------------|
| 1 | Proteger dashboard do Traefik com autenticação (BasicAuth ou OAuth) antes de expor | 🔴 Alta |
| 2 | Adicionar senha ao Redis | 🔴 Alta |
| 3 | Alinhar build/tag das imagens `nexo-360-new-*` — publicar `nexo-360-new-nexo-finance:latest` para o Finance (porta 8095) | 🟡 Média |
| 4 | Verificar se volume montado em `nexo-360-api` é necessário (suspeita de redundância com DB externo) | 🟡 Média |
| 5 | Parametrizar domínios via `DOMAIN` no `.env` para facilitar troca futura | 🟢 Baixa |

---

## 11. Checklist para Agentes

### Novo projeto ou primeiro acesso

- [ ] Validar acesso SSH à VPS
- [ ] Ler este guia completamente
- [ ] Abrir e entender o `docker-compose.yml`
- [ ] Criar volumes externos necessários
- [ ] Configurar `.env` com as variáveis obrigatórias
- [ ] Testar `monitor.sh` após subir os serviços
- [ ] Garantir que credenciais não estão expostas

### Projetos em andamento

- [ ] Revisar configurações atuais no `docker-compose.yml`
- [ ] Verificar status dos containers com `docker compose ps`
- [ ] Conferir logs recentes dos serviços afetados
- [ ] Validar backups com `backup.sh`
- [ ] Checar atualizações de imagens Docker
- [ ] Consultar a seção de Pendências antes de qualquer alteração
- [ ] Documentar qualquer ajuste ou incidente no `docs/`

---

## 12. Regras de Operação

1. **Nunca altere containers diretamente em produção.** Toda mudança passa pelo `docker-compose.yml`.
2. **Leia a documentação antes de agir.** README, este guia e `docs/` são a referência. `PORTS.md` é a fonte de verdade para portas.
3. **Use os scripts padronizados.** Evite comandos avulsos quando há script equivalente.
4. **Documente tudo.** Qualquer ajuste ou incidente deve ser registrado em `docs/`.
5. **Dúvida? Pare e consulte Diego.** Não tente resolver situações fora do escopo sem orientação.

---

## Histórico de Revisões

| Data | Mudança |
|------|---------|
| 2026-02-22 | Criação inicial — alinhado com PORTS.md (novo esquema de portas) |
| 2026-02-23 | Adicionado: n8n, Nexo Finance (8095/a deployar), coluna de status nas APIs, connection strings, pendências atualizadas |