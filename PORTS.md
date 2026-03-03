# PORTS - Esquema Atual de Portas

> Mapeamento centralizado das portas da infraestrutura compartilhada.
> Local: `C:\Users\santo\infra`

---

## Snapshot Atual

**Última atualização**: 2026-02-23  
**Status**: atualizado com novo esquema de portas da infraestrutura unificada e Traefik.

---

## Infraestrutura Base

| Serviço | Imagem | Porta (host:container) |
|---------|--------|------------------------|
| `postgres` | `postgres:16-alpine` | `5432:5432` |
| `postgres-vector` | `pgvector/pgvector:pg16` | `5433:5432` |
| `redis` | `redis:7-alpine` | `6379:6379` |
| `chromadb` | `chromadb/chroma:latest` | `8000:8000` |
| `mlflow` | `infra-nexo-mlflow:latest` | `5000:5000` |
| `traefik` | `traefik:v3.0` | `443:443`, `80:80`, `8099:8080` |

---

## APIs dos Projetos (Nexo)

| Serviço | Imagem | Porta (host:container) |
|---------|--------|------------------------|
| `nexo-suporte-api` | `nexo_suporte_atendimento-api:latest` | `8080:8080` |
| `agencia-antigravity-api` | `agencia-antigravity-api:latest` | `8085:8080` |
| `nexo-360-api` | `nexo-360-new-api:latest` | `8090:8000` |
| `nexo-growth-api` | `nexo-360-new-nexo-growth:latest` | `8091:8000` |
| `nexo-talent-api` | `nexo-360-new-nexo-talent:latest` | `8092:8000` |
| `nexo-admin-api` | `nexo-360-new-nexo-admin:latest` | `8093:8000` |
| `nexo-insights-api` | `nexo-360-new-nexo-insights:latest` | `8094:8000` |
| `nexo-finance-api` | `nexo-360-new-nexo-finance:latest` | `8095:8000` |

---

## URLs de Acesso Local (Host)

| Serviço | URL Local | Domínio Traefik |
|---------|-----------|-----------------|
| Traefik Dashboard | `http://localhost:8099` | - |
| nexo-suporte-api | `http://localhost:8080` | `https://suporte.nexobasis.tech` |
| agencia-antigravity | `http://localhost:8085` | `https://agencia.nexobasis.tech` |
| nexo-360-api | `http://localhost:8090` | `https://api.nexobasis.tech` |
| nexo-growth-api | `http://localhost:8091` | `https://growth.nexobasis.tech` |
| nexo-talent-api | `http://localhost:8092` | `https://talent.nexobasis.tech` |
| nexo-admin-api | `http://localhost:8093` | `https://admin.nexobasis.tech` |
| nexo-insights-api | `http://localhost:8094` | `https://insights.nexobasis.tech` |
| nexo-finance-api | `http://localhost:8095` | `https://finance.nexobasis.tech` |
| ChromaDB | `http://localhost:8000` | `https://chromadb.nexobasis.tech` |
| MLflow | `http://localhost:5000` | `https://mlflow.nexobasis.tech` |

---

## Connection Strings (Internas - Rede Docker)

```bash
# PostgreSQL Principal (Nexo)
postgresql://postgres:postgres123@postgres:5432/nexo

# PostgreSQL Vector
postgresql://postgres:postgres123@postgres-vector:5432/vector

# Redis
redis://redis:6379

# ChromaDB
http://chromadb:8000

# MLflow
http://mlflow:5000
```
