# task.md

## MedTutor - Funcionalidades Essenciais para Medicina (Novo Escopo)
- [x] **Base Curada de Vídeos**: Criar no backend uma lista de links reais e focados.
- [x] **Identificação e Perfil**: Criar tela de identificação do aluno.
- [x] **Banco de Questões e Caderno de Erros**: Configurado schema PostgreSQL (Questions, UserInteraction). Interface interativa de treino e feedback de elite construída.
- [x] **Integração RAG (ChromaDB/Pinecone)**: Utilizar Retrieval-Augmented Generation com PDFs de manuais e provas anteriores para a IA. (Mock de integração criado em `rag_service.py`)
- [x] **Memória Persistente**: Finalizar lógica backend de recalcular rotas. (Endpoint `/plano-estudo/update` e salvamento de `Message`s mapeados)
- [x] **Prompt "Coordenador Elite" & Chain of Thought**: Configurar IA para forçar raciocínio passo a passo, nunca dar respostas diretas ao errar e usar analogias clínicas.
- [x] **Script de Parsing de Provas**: Criado parser usando OpenAI GPT.
- [x] **Novos Endpoints de API**: `/chat/tutor`, `/redacao/corrigir` (com GPT-4o Vision), `/plano-estudo/update`.
- [x] **Dashboard com Recharts**: Mostrar probabilidade de aprovação e métricas de desempenho.
- [x] **Flashcards Inteligentes**: Implementar sistema de Repetição Espaçada.
- [x] **Simulações de Casos Clínicos**: Oferecer cenários interativos.
- [x] **Conteúdo Resumido e Visual**: Integrar mapas mentais e resumos visuais de alta qualidade (Galeria Visual).
- [x] **Gestão de Estudos (Foco)**: Timer Pomodoro e controle de horas integrados.

## Tarefas Prioritárias (P0)

1. Remover arquivo `.git/index.lock` para liberar operações Git.
2. Reorganizar estrutura de pastas conforme `design.md`.
3. Separar backend, frontend, docs e scripts.
4. Atualizar documentação dos 3 pilares.
5. Implementar rastreamento de progresso em `progresso.md`.
6. Validar ambiente Docker e scripts de automação.
7. Handoff para agentes especialistas corrigirem bugs e implementar melhorias.

## Tarefas Secundárias
- Revisar dependências e arquivos de configuração.
- Garantir testes automatizados.
- Atualizar README com nova estrutura.

## Observações
- Todas as mudanças devem ser rastreadas em `progresso.md`.
- Não iniciar implementação sem aprovação dos documentos.
