# Execução Roadmap / Backlog

Para mitigar a dívida técnica e adequar o projeto completamente à governança imposta pelo Cofre de Plataforma, o seguinte roadmap foi mapeado:

## Sprint 1: Shift-Left Security e Bloqueio de Vazamentos
- **Ticket 101:** Excluir variáveis sigilosas hardcoded do `docker-compose.yml` e substituir por interpolação de variáveis (`${DATABASE_URL}`, etc).
- **Ticket 102:** Corrigir modelo determinístico de injeção no build da interface de usuário em `vite.config.ts`, migrando toda a lógica sensível do LLM para intermediação absoluta via Backend.
- **Ticket 103:** Mapear e popular adequadamente as variáveis mandatórias no arquivo `.env.example`.
- **Ticket 104:** Validar gitleaks contra logs retroativos, gerando baseline pass-through de commits seguros sem interrupções falsas.

## Sprint 2: Centralização de Setup e Automação Universal
- **Ticket 201:** Adicionar alvos específicos (`targets`) da aplicação MedTutor no `Makefile` raiz (`make build`, `make up`, `make down`, `make test`, `make lint`), mantendo retro-compatibilidade simbiótica com as rotinas legadas de host do _dev-workspace_.
- **Ticket 202:** Incorporar fluxo de testes estrutural unitário trivial nos pipelines do GitHub Actions (Vercel Build CI).
- **Ticket 203:** Configurar provisionamento do banco com Alembic `alembic upgrade head` diretamente num entrypoint idempotente do Docker e remover acoplamento a passos manuais locais.

## Sprint 3: Desacoplamento da App e Maturidade do Backend
- **Ticket 301:** Padronizar controle estrito de dependências do Python para usar formato travado e determinístico (`Pipenv` ou build multi-staged `pip freeze`).
- **Ticket 302:** Refatorar `geminiService.ts` e suprimir rotinas onde o Front-end faz _bypasses_ acionando o Gemini por rota direta sem as abstrações seguras do microsserviço Python FastAPI.
- **Ticket 303:** Mover a documentação e contratos da base vetorial do RAG para esquemas definidos explicitamente (Swagger/OpenAPI UI do FastAPI).

## Sprint 4: Observabilidade Ponta a Ponta e Logs Estruturados
- **Ticket 401:** Provisionar stack de telemetria no local-dev e produção (`docker-compose.yml`) contemplando Prometheus, Grafana, Loki e Promtail.
- **Ticket 402:** Instrumentar backend (FastAPI) e frontend para emitir logs estruturados em JSON direcionados ao canal do Loki.
- **Ticket 403:** Configurar exportação de métricas básicas da infraestrutura/containers (via Node Exporter/cAdvisor) para ingestão do Prometheus.
- **Ticket 404:** Confeccionar dashboards no Grafana para acompanhamento visual de requisições, volumetria de erros, telemetria da infra e sucesso/falhas de geração do LLM.
- **Ticket 405:** Configurar alertas automáticos (via Alertmanager do Prometheus/Grafana) para atuar rapidamente em incidentes (ex: excesso de HTTP 500 ou timeouts da API Gemini).

## Sprint 5: Resiliência do Motor de IA e Qualidade do Conteúdo
- **Ticket 501:** Investigar e corrigir a falha silenciosa de "falta de conexão/tentar novamente" enfrentada pelos usuários. Adicionar block-try-catch para expor a causa raiz real no backend/frontend.
- **Ticket 502:** Depurar e repavimentar o fluxo de RAG: aferir leitura dos materiais base, fontes vetoriais no ChromaDB e coerência do contexto enviado ao LLM.
- **Ticket 503:** Otimizar prompts do modelo Gemini (`SYSTEM_PROMPT`) visando aumentar a performance pedagógica, contornando travas de recusa por excesso de tokens e melhorando a formatação das respostas.

## Sprint 6: Infraestrutura como Código (Terraform/AWS)
- **Ticket 601:** Ajustar o template do Terraform localizado no diretório `aws/` para espelhar a nova topologia, contemplando o Frontend empacotado no Nginx, o Backend FastAPI e a stack de observabilidade (PLG Observer Stack).
- **Ticket 602:** Gerar os empacotamentos adequados para o ambiente, criando o `Dockerfile.frontend` (baseado em Nginx) e unificando as imagens no arquivo `docker-compose.prod.yml`.
- **Ticket 603:** Adicionar uma regra de pipeline e os respectivos targets no `Makefile` (ex: `make deploy-aws`, `make plan-aws`) para garantir um fluxo de deploy seguro, rastreável e idempotente.
