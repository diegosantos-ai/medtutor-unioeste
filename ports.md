Padrão de Portas — dev-workspace

Objetivo:
Definir faixas e regras para evitar colisões de portas entre projetos ao usar a infraestrutura unificada (`infra-core`).

Reservados para Infra-Core (NÃO mapear em projetos):
- 80, 8080 : Traefik
- 5432     : Postgres
- 6379     : Redis
- 8000     : ChromaDB
- 5000     : MLFlow
- 5433     : Postgres nativo na máquina.

Faixas recomendadas para aplicações (host -> container):
- Backends (APIs): 8001-8599  (cada projeto pega a próxima porta livre)
- Frontends (web): 3000-3499  (porta host para acessar UI local)
- Serviços auxiliares / debug: 9000-9499

Regras:
- Nunca mapear portas core (ex: 5432, 6379, 8000, 5000) em projetos individuais.
- Use variáveis de ambiente no `docker-compose.yml` para definir a porta de host, ex:

  ports:
    - "${BACKEND_PORT:-8001}:${BACKEND_INTERNAL_PORT:-8000}"

- Ao criar um novo projeto, siga este fluxo:
  1. Verifique se a rede `dev-workspace-net` está disponível (use `make infra-up`).
  2. Escolha a porta de host dentro das faixas acima (ou execute o script de scaffolding que automaticamente aloca uma porta livre).
  3. Atualize o `.env` do projeto com `BACKEND_PORT` e `FRONTEND_PORT` conforme necessário.

Script de alocação automático (recomendado):
- Um script `scripts/new-project.sh` pode ser usado para buscar a próxima porta livre na faixa e editar o `docker-compose.yml` do projeto.

Exemplo rápido de verificação manual:
- `ss -tulpn | grep :800` (procure portas 8001, 8002, ...)

Documente no README do projeto qual porta foi alocada para facilitar colaboração.
