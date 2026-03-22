# Project Assessment: Diagnóstico Técnico e Governança

## 1. Estrutura e Arquitetura

O projeto divide-se fundamentalmente em duas estruturas desacopladas em ambiente de diretório (Front e Backend), porém apresenta forte acoplamento no fluxo de comunicação sistêmica:
- A configuração da API e roteamento de IA estão expostos em `api/` na raiz, e há forte duplicação entre consumo do modelo `Gemini` via client-side/frontend versus solicitações delegadas ao backend.

## 2. Bootstrapping e Entrada

A regra de governança exige total abstração via `Makefile`. O artefato atual funciona apenas como symlink para automações externas (`ansible/scripts`), não servindo à inicialização local dos microsserviços. Rotinas comuns a novos programadores (ex.: instalar dependências, popular banco relacional local, iniciar contêineres e inicializar servidor) dependem exclusimente da intuição ou conhecimento prévio da stack, mitigando a Idempotência e a governança proposta.

## 3. Sanidade e Testes

O projeto encontra-se em regime frágil do ponto de vista de testes unitários e de integração:
- **Frontend:** Ausência de `vitest`, `jest` ou bibliotecas subjacentes. Nenhuma suíte de teste local injetada no pipeline de CI/CD.
- **Backend:** Há uma referência solta de arquivo (`test_rag.py`), contudo o framework global não conta com declaração do Pytest dentro do ecossistema formal.

## 4. Gestão de Dependências

O uso de `npm ci` no ambiente do deploy remoto confirma estabilidade lockada, enquanto no backend usa-se listagem aberta (`requests.txt` sem pinning ou Poetry/Pipenv strict versions), violando o princípio arquitetural da reprodutibilidade segura no provisionamento de servidor.

## 5. Exposição de Segredos (Shift-Left Violations)

Este é o ponto de maior alerta detectado na engenharia da plataforma:
1. **Credenciais Hardcoded:** Variáveis sensíveis constam expostas sem proteção no `docker-compose.yml` (`postgresql://postgres:postgres123@postgres-vector:5432/medtutor_db`).
2. **Vazamento via Build Configuration:** O arquivo `vite.config.ts` utiliza injeção determinística insegura, transportando e propagando no browser o valor da variável de ambiente com alto privilégio para a API do Google Generative AI (LLM API Keys) via `process.env.GEMINI_API_KEY`.
3. O contrato provisório apontado no `.env.example` encontra-se inteiramente vazio, omitindo exigências fundamentais como `DATABASE_URL` e tokens sistêmicos.

## 6. Documentação

Atualmente, não existe abstração detalhada do fluxo do sistema documentado, apenas marcações de uso no `roadmap` de RAG e um template vago sobre design inicial do projeto. Faltam orientações estritas para uso do Docker a novos engenheiros e a definição formal das variáveis obrigatórias do backend.
