# Plano de Implementação: Sistema RAG Completo

## Meta
Implementar um sistema RAG funcional que processe os +100 PDFs da base de conhecimento, crie embeddings utilizando Google Gemini, armazene no ChromaDB e integre com o AI Service para gerar respostas contextuais aos alunos.

## Contexto Atual
- `backend/app/rag_service.py`: Apenas um mock com resultados hardcoded
- `backend/app/ai_service.py`: Chama `rag_db.query_context()` mas recebe dados fake
- `base_conhecimento/`: +100 PDFs nunca processados/indexados
- API Key do Gemini já configurada no `.env`

## Tasks

### Fase 1: Dependências e Configuração

- [ ] **Task 1**: Adicionar dependências ao `backend/requirements.txt` → Verificar: Arquivo requirements.txt contém langchain, langchain-google-genai, chromadb, pypdf, python-dotenv
- [ ] **Task 2**: Criar arquivo de configuração `backend/app/config.py` para gerenciar caminhos e variáveis → Verificar: Arquivo config.py existe e expõe BASE_DIR e CHROMA_DIR

### Fase 2: Implementação do RAG Service

- [ ] **Task 3**: Implementar classe `RAGService` em `backend/app/rag_service.py` com método `ingest_document()` → Verificar: Método processa PDF, cria chunks e salva no ChromaDB
- [ ] **Task 4**: Implementar método `query_context()` para buscar chunks similares → Verificar: Retorna contexto relevante baseado na similaridade
- [ ] **Task 5**: Implementar método `ingest_folder()` para processar todos os PDFs da base_conhecimento → Verificar: Processa todos os PDFs e retorna estatísticas

### Fase 3: Endpoints FastAPI

- [ ] **Task 6**: Criar endpoint `POST /api/rag/ingest` para indexar PDF específico → Verificar: Endpoint aceita arquivo PDF e retorna status de sucesso
- [ ] **Task 7**: Criar endpoint `POST /api/rag/ingest-all` para indexar toda a base → Verificar: Endpoint processa todos os PDFs com progresso
- [ ] **Task 8**: Criar endpoint `GET /api/rag/status` para verificar status da indexação → Verificar: Retorna quantidade de documentos indexados

### Fase 4: Integração com AI Service

- [ ] **Task 9**: Modificar `backend/app/ai_service.py` para usar RAG real → Verificar: get_tutor_response() usa contexto do ChromaDB
- [ ] **Task 10**: Atualizar prompt em `get_tutor_response()` para incluir fontes recuperadas → Verificar: Resposta do tutor menciona source_id dos documentos

### Fase 5: Testes e Validação

- [ ] **Task 11**: Criar script de teste `backend/test_rag.py` para validar ingestão → Verificar: Script processa 1 PDF e retorna chunks
- [ ] **Task 12**: Testar endpoint `/api/chat/tutor` com pergunta real → Verificar: Resposta inclui contexto dos PDFs processados

## Done When

- [ ] Sistema RAG processa PDFs reais da base_conhecimento
- [ ] Embeddings são criados e armazenados no ChromaDB
- [ ] Queries retornam contexto relevante dos documentos
- [ ] AI Service integra contexto RAG nas respostas do tutor
- [ ] Endpoints de indexação estão funcionais

## Considerações Técnicas

### Escolhas de Implementação
- **Embedding**: Usar Google Gemini text-embedding-001 via langchain-google-genai (já temos API key)
- **Vector DB**: ChromaDB (persistente em disco, embedding function nativa)
- **Chunking**: RecursiveCharacterTextSplitter com 1000 chars e 200 overlap
- **Processamento**: Síncrono para simplicidade, com possibility de background tasks

### Estrutura de Diretórios
```
backend/
  app/
    rag_service.py    # RAG service completo
    config.py         # Configurações RAG
    chroma_data/     # Dados persistidos do ChromaDB
```

### Tratamento de Erros
- PDFs corrompidos: Log e skip com continuação
- API rate limits: Retry com backoff
- Base vazia: Retornar resposta em modo fallback
