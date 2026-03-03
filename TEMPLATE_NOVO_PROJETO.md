# Como Iniciar um Novo Projeto Usando a Infraestrutura Nexo

Sempre que você for começar um projeto novo, **NÃO crie novos bancos de dados no `docker-compose.yml` dele.**

Basta copiar o arquivo abaixo para a raiz do seu novo projeto. Ele conectará seu container diretamente à rede da infraestrutura, dando acesso a todos os bancos pelo nome do serviço interno.

## 1. O `docker-compose.yml` do seu novo projeto:

Crie um `docker-compose.yml` na pasta do seu novo projeto com este esqueleto base:

```yaml
version: "3.8"

services:
  # 1. ALTERE: O nome do serviço (ex: 'api', 'meu-projeto-api')
  meu-novo-app:
    # 2. ALTERE: Onde está o seu código (geralmente build: . se tiver um Dockerfile na mesma pasta)
    build: . 
    
    # 3. ALTERE: Nome do container no Docker
    container_name: meu-novo-app-api
    
    # 4. ALTERE: A porta! A esquerda (8099) tem que ser uma porta livre no seu PC.
    # A direita (8000) é a porta que a SUA aplicação usa por dentro (ex: Node usa 3000, Python 8000)
    ports:
      - "8099:8000" 
      
    environment:
      # Use sempre os nomes internos dos containers da infraestrutura.
      # 5. ALTERE: Troque 'novo_projeto_db' pelo nome do banco que esse projeto vai usar
      - DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/novo_projeto_db
      - REDIS_URL=redis://redis:6379
      - CHROMA_URL=http://chromadb:8000
    networks:
      - nexo-infra-network

# Isso é a MÁGICA! Conecta seu projeto à rede existente da infraestrutura
# O que é "nexo-infra-network"?
# R: NÃO é uma porta. É uma "Rede Virtual" que o Docker criou quando rodamos a infra.
# Pense nisso como um cabo de rede "invisível". Ao colocar "external: true", 
# dizemos ao Docker: "Não crie uma rede nova, conecte o cabo deste projeto na 
# mesma rede onde o PostgreSQL e o Redis já estão rodando".
networks:
  nexo-infra-network:
    external: true
    name: infra_nexo-network
```

## 2. O arquivo `.env` do seu novo projeto:

Se for rodar o código na sua máquina localmente (via Node, Python, VS Code) e não dentro do Docker, as URLs mudam um pouco para usar o `localhost`. Crie um `.env`:

```env
# URL se você rodar o projeto na sua máquina (fora do Docker):
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/novo_projeto_db
REDIS_URL=redis://localhost:6379
CHROMA_URL=http://localhost:8000

# (Nota: se o código for rodar dentro do docker-compose do projeto, 
# use as URLs descritas no arquivo docker-compose acima)
```

## 3. Comandos Úteis (No novo projeto)

Para iniciar o seu novo projeto, os comandos não mudam, mas ele agora consumirá da infra:

```bash
docker compose up -d
```

Se precisar resetar completamente os dados de TUDO na infraestrutura, vá na pasta `infra` e rode:
```bash
./scripts/reset_bancos.sh
```
