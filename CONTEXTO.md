# CONTEXTO: MedTutor - Pré-Vestibular UNIOESTE

## 1. Objetivo de Negócio
Prover uma plataforma de suporte ao estudo para o vestibular de medicina da UNIOESTE, utilizando Inteligência Artificial (LLMs) e técnica de RAG para guiar o aprendizado através de materiais específicos e provas anteriores.

## 2. Fronteiras e Limites (Out of Scope)
- O sistema não realizará inscrições oficiais no vestibular.
- Não haverá processamento de pagamentos nesta fase (MVP).
- O sistema não funcionará como um repositório genérico de arquivos; o foco é estritamente o vestibular de medicina.

## 3. Stakeholders
- **Dono do Produto:** Diego Santos (Foco na usuária final/sobrinha).
- **Engenharia:** Diego Santos (DevOps/Platform Engineer).

## 4. Critérios de Sucesso
- [x] Carregamento estável do frontend servido por Nginx sem erro de MIME type.
- [x] Comunicação estável entre Frontend (React) e Backend (FastAPI) via `docker compose`.
- [x] Política de portas compatível com o padrão do `dev-workspace`, evitando colisões com `infra-core`.
- [ ] Logs de erro capturados e visíveis no dashboard de observabilidade.
- [ ] Infraestrutura provisionada via módulos Terraform isolados por ambiente (Dev/Prod).
