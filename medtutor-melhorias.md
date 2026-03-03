# Plano de Melhorias - MedTutor UNIOESTE

## Overview

Implementar 5 melhorias críticas no MedTutor para transformá-lo de um protótipo com mock data em uma aplicação funcional para estudantes de Medicina da UNIOESTE.

**Prioridades:**
1. Definir identidade: Medicina UNIOESTE + matérias gerais do vestibular
2. Eliminar componentes órfãos e unificar API
3. Conectar ao backend real (Flashcards, Caderno de Erros, Casos Clínicos)
4. Validação de progresso mista
5. Autenticação simples (email/senha)

---

## Success Criteria

- [ ] Todos os textos e materiais alinhados com identidade Medicina UNIOESTE
- [ ] Componentes órfãos removidos ou integrados no tour
- [ ] API unificada com padrão consistente
- [ ] Flashcards consumindo dados reais do backend
- [ ] Caderno de Erros consumindo dados reais do backend
- [ ] Casos Clínicos consumindo dados reais do backend
- [ ] Validação de progresso implementada (tarefas obrigatórias vs opcionais)
- [ ] Sistema de autenticação funcional (registro/login)
- [ ] Dados persistem por usuário autenticado

---

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Python FastAPI + PostgreSQL + SQLAlchemy
- **Auth:** JWT tokens (implemetação própria/simples)
- **State:** React Context + localStorage (fallback)
- **HTTP Client:** Fetch API padronizado

---

## File Structure

```
medtutor-unioeste/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx           # Novo: Formulário de login
│   │   ├── RegisterForm.tsx        # Novo: Formulário de registro
│   │   └── AuthGuard.tsx           # Novo: Proteção de rotas
│   ├── api/
│   │   ├── apiClient.ts            # Novo: Cliente HTTP unificado
│   │   ├── authApi.ts              # Novo: API de autenticação
│   │   ├── flashcardsApi.ts        # Novo: API de flashcards
│   │   ├── errorsApi.ts            # Novo: API de caderno de erros
│   │   └── casesApi.ts             # Novo: API de casos clínicos
│   ├── hooks/
│   │   ├── useAuth.ts              # Novo: Hook de autenticação
│   │   ├── useApi.ts               # Novo: Hook genérico de API
│   │   └── useProgress.ts          # Novo: Hook de progresso
│   ├── context/
│   │   └── AuthContext.tsx         # Novo: Contexto de auth
│   └── [componentes existentes atualizados]
├── backend/
│   ├── app/
│   │   ├── routes.py               # Atualizar: novos endpoints
│   │   ├── models.py               # Atualizar: User com senha
│   │   ├── auth.py                 # Novo: JWT auth handlers
│   │   └── schemas.py              # Novo: Pydantic schemas
│   └── alembic/
│       └── versions/               # Nova migration auth + seed data
├── types.ts                        # Atualizar: novos tipos
└── medtutor-melhorias.md           # Este arquivo
```

---

## Task Breakdown

### FASE 1: Fundação (Backend + Auth)

#### Task 1.1: Atualizar Modelo de Usuário
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`, `database-design`
- **Priority:** P0 (Blocker)
- **Dependencies:** None
- **INPUT:** `backend/app/models.py` atual
- **OUTPUT:** Modelo User com campos: id, email, password_hash, name, created_at, is_active
- **VERIFY:** 
  - [ ] Migration criada e aplicada
  - [ ] Modelo reflete alterações no banco
  - [ ] Senha nunca armazenada em plain text

#### Task 1.2: Implementar Autenticação JWT
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`, `vulnerability-scanner`
- **Priority:** P0 (Blocker)
- **Dependencies:** Task 1.1
- **INPUT:** Backend FastAPI existente
- **OUTPUT:** 
  - `backend/app/auth.py`: login, register, verify_token
  - Endpoints: POST /auth/login, POST /auth/register, GET /auth/me
- **VERIFY:**
  - [ ] Login retorna JWT válido
  - [ ] Register cria usuário com senha hash
  - [ ] Token expira conforme configuração
  - [ ] Rotas protegidas rejeitam token inválido

#### Task 1.3: Criar API Unificada (Frontend)
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`, `api-patterns`
- **Priority:** P0 (Blocker)
- **Dependencies:** None
- **INPUT:** `api/ai.ts` atual (BFF)
- **OUTPUT:** 
  - `components/api/apiClient.ts`: Cliente HTTP com interceptors
  - Base URL configurável
  - Header Authorization automático
  - Error handling padronizado
- **VERIFY:**
  - [ ] Todas as chamadas usam apiClient
  - [ ] Token JWT injetado automaticamente
  - [ ] Erros 401 redirecionam para login
  - [ ] Loading states consistentes

---

### FASE 2: Identidade e Conteúdo

#### Task 2.1: Definir Estrutura de Matérias (Medicina UNIOESTE)
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`
- **Priority:** P1
- **Dependencies:** None
- **INPUT:** `types.ts` atual, conteúdo do site UNIOESTE
- **OUTPUT:** 
  - Estrutura de matérias atualizada em `types.ts`
  - Matérias específicas: Anatomia, Fisiologia, Bioquímica, etc.
  - Matérias gerais: Português, Matemática, Física, Química, Biologia
- **VERIFY:**
  - [ ] Lista completa de matérias do vestibular UNIOESTE
  - [ ] Categorias organizadas (Biológicas, Exatas, Humanas)
  - [ ] Cores/ícones distintivos por categoria

#### Task 2.2: Atualizar Textos e Componentes de Identidade
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`
- **Priority:** P1
- **Dependencies:** Task 2.1
- **INPUT:** Componentes existentes (App.tsx, Layout.tsx, Onboarding.tsx)
- **OUTPUT:** 
  - Textos atualizados: "Vestibular UNIOESTE - Medicina"
  - Descrições alinhadas com perfil do curso
  - Remover referências genéricas de "vestibular"
- **VERIFY:**
  - [ ] Título principal: "MedTutor UNIOESTE - Medicina"
  - [ ] Onboarding menciona preparação específica para Medicina
  - [ ] Textos motivacionais relacionados à carreira médica

#### Task 2.3: Popular Banco de Dados (Seed)
- **Agent:** `backend-specialist`
- **Skill:** `database-design`
- **Priority:** P1
- **Dependencies:** Task 2.1
- **INPUT:** Estrutura de matérias definida
- **OUTPUT:** 
  - Script de seed: `backend/seed_data.py`
  - Flashcards iniciais por matéria (10-20 por matéria)
  - Questões UNIOESTE reais (ou simuladas realistas)
  - Casos clínicos baseados em cenários médicos
- **VERIFY:**
  - [ ] Seed popula Flashcards
  - [ ] Seed popula Questions
  - [ ] Seed popula Casos Clínicos
  - [ ] Dados relacionados corretamente (user_id, subject_id)

---

### FASE 3: Integração Backend (Real Data)

#### Task 3.1: Conectar Flashcards ao Backend
- **Agent:** `frontend-specialist`
- **Skill:** `api-patterns`
- **Priority:** P2
- **Dependencies:** Task 1.3, Task 2.3
- **INPUT:** `components/Flashcards.tsx` (atualmente mock)
- **OUTPUT:** 
  - `components/api/flashcardsApi.ts`: getFlashcards, updateFlashcard
  - Flashcards.tsx consumindo API real
  - Sistema SRS com persistência (box, last_reviewed, next_review)
- **VERIFY:**
  - [ ] GET /api/flashcards retorna cards do usuário
  - [ ] POST /api/flashcards/{id}/review atualiza progresso SRS
  - [ ] Cards aparecem conforme agendamento (algoritmo Leitner)

#### Task 3.2: Conectar Caderno de Erros ao Backend
- **Agent:** `frontend-specialist`
- **Skill:** `api-patterns`
- **Priority:** P2
- **Dependencies:** Task 1.3, Task 2.3
- **INPUT:** `components/ErrorNotebook.tsx` (atualmente mock)
- **OUTPUT:** 
  - `components/api/errorsApi.ts`: getErrors, addError, removeError
  - ErrorNotebook.tsx consumindo API real
  - Integração com quiz: erros automáticos ao errar questão
- **VERIFY:**
  - [ ] GET /api/errors retorna questões erradas do usuário
  - [ ] Erro é adicionado automaticamente ao errar quiz
  - [ ] Modo "Treinar Foco" funciona com dados reais

#### Task 3.3: Conectar Casos Clínicos ao Backend
- **Agent:** `frontend-specialist`
- **Skill:** `api-patterns`
- **Priority:** P2
- **Dependencies:** Task 1.3, Task 2.3
- **INPUT:** `components/ClinicalCases.tsx` (atualmente mock)
- **OUTPUT:** 
  - `components/api/casesApi.ts`: getCases, submitAnswer
  - ClinicalCases.tsx consumindo API real
  - Sistema de etapas com feedback da IA
- **VERIFY:**
  - [ ] GET /api/cases retorna casos do banco
  - [ ] Respostas são validadas contra gabarito
  - [ ] Explicações da IA geradas dinamicamente

---

### FASE 4: Validação de Progresso

#### Task 4.1: Implementar Sistema de Validação Mista
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`
- **Priority:** P2
- **Dependencies:** Task 3.1, Task 3.2, Task 3.3
- **INPUT:** `components/StudyDay.tsx`, `components/ProgressTracker.tsx`
- **OUTPUT:** 
  - `components/hooks/useProgress.ts`: Hook de validação
  - Estrutura de tarefas: obrigatórias vs opcionais
  - Bloqueio de avanço até completar obrigatórias
  - Indicadores visuais de status
- **VERIFY:**
  - [ ] Tarefas obrigatórias bloqueiam avanço de dia
  - [ ] Tarefas opcionais são identificadas visualmente
  - [ ] Quiz exige acerto mínimo (70%) para contar como concluído
  - [ ] Flashcards do dia devem ser revisados
  - [ ] Botão "Próximo Dia" desabilitado até requisitos atendidos

#### Task 4.2: Atualizar Dashboard com Dados Reais
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`
- **Priority:** P3
- **Dependencies:** Task 3.1, Task 3.2, Task 3.3
- **INPUT:** `components/PerformanceDashboard.tsx`
- **OUTPUT:** 
  - Dashboard consumindo estatísticas reais do backend
  - Progresso calculado de acordo com tarefas completadas
  - Gráficos atualizados com dados do usuário
- **VERIFY:**
  - [ ] GET /api/stats retorna estatísticas do usuário
  - [ ] Gráficos refletem desempenho real
  - [ ] Cards de estatísticas calculados corretamente

---

### FASE 5: UI/UX e Componentes Órfãos

#### Task 5.1: Analisar e Decidir Sobre Componentes Órfãos
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`, `ux_audit`
- **Priority:** P2
- **Dependencies:** None
- **INPUT:** Lista de componentes: Onboarding, MindMapGallery, TourTip, SummaryDownload
- **OUTPUT:** Decisões documentadas:
  - **Onboarding:** Integrar no tour inicial (fluxo de primeiro acesso)
  - **MindMapGallery:** Manter se tiver conteúdo, senão remover
  - **TourTip:** Manter e expandir para todos os recursos
  - **SummaryDownload:** Integrar na área de materiais
- **VERIFY:**
  - [ ] Cada componente tem decisão: INTEGRAR ou REMOVER
  - [ ] Componentes integrados aparecem no tour

#### Task 5.2: Expandir Tour Guiado
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`, `ux_audit`
- **Priority:** P3
- **Dependencies:** Task 5.1
- **INPUT:** `components/TourTip.tsx` existente
- **OUTPUT:** 
  - Tour completo cobrindo todos os recursos principais
  - Passos: Onboarding → Dashboard → Plano de Estudo → Flashcards → Caderno → Casos → Chat
  - Opção de pular ou reiniciar tour
- **VERIFY:**
  - [ ] Tour aparece automaticamente no primeiro acesso
  - [ ] Botão "Ajuda" reinicia tour
  - [ ] Todos os recursos são explicados

---

## Phase X: Verification

### Checklist Final

#### P0: Critical
- [ ] **Security:** Nenhuma senha em plain text, JWT seguro
- [ ] **Build:** `npm run build` sem erros
- [ ] **Backend:** Todas as migrations aplicadas

#### P1: Functional
- [ ] **Auth:** Registro e login funcionando
- [ ] **Flashcards:** Dados reais do backend
- [ ] **Caderno de Erros:** Dados reais do backend
- [ ] **Casos Clínicos:** Dados reais do backend

#### P2: UX
- [ ] **Progresso:** Validação mista funcionando
- [ ] **Tour:** Todos os recursos explicados
- [ ] **Identidade:** Textos alinhados com Medicina UNIOESTE

#### P3: Polish
- [ ] **Responsivo:** Testar mobile
- [ ] **Performance:** Lighthouse score > 80
- [ ] **Accessibility:** Contrastes WCAG AA

### Scripts de Verificação

```bash
# Executar antes de finalizar:
python C:/Users/santo/.agent/scripts/checklist.py .

# Testes manuais:
# 1. Registrar novo usuário
# 2. Fazer login
# 3. Completar tarefas do dia
# 4. Verificar bloqueio de avanço
# 5. Revisar flashcards
# 6. Errar questão e ver no caderno
# 7. Fazer caso clínico
# 8. Verificar dashboard atualizado
# 9. Logout e login novamente (dados persistem)
```

---

## Agent Assignment Summary

| Fase | Agent | Tasks |
|------|-------|-------|
| 1 | `backend-specialist` | 1.1, 1.2, 2.3 |
| 1-5 | `frontend-specialist` | 1.3, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2 |
| X | `security-auditor` | Verificação final de segurança |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Complexidade da migração de dados | Média | Alto | Fazer backup antes, testar em staging |
| Quebra de funcionalidades existentes | Média | Alto | Manter compatibilidade backward, feature flags |
| Performance com dados reais | Baixa | Médio | Paginação, lazy loading, índices no DB |
| UX confusa com validação estrita | Média | Médio | Testar com usuários, ajustar regras conforme feedback |

---

## Notas de Implementação

1. **Prioridade de Execução:** Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
2. **Branching:** Criar branch `feature/melhorias-v1` para desenvolvimento
3. **Commits:** Um commit por task, mensagens descritivas
4. **Testes:** Testar manualmente após cada fase

---

*Plano criado em: 03/03/2026*
*Versão: 1.0*
