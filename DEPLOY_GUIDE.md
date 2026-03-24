# Guia: Deploy do MedTutor na AWS EC2

Este guia documenta todo o processo de deploy da aplicação MedTutor em uma VPS na AWS EC2, desde a criação da infraestrutura até a emissão do certificado SSL.

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                        VPC (10.10.0.0/16)                       ││
│  │                                                                  ││
│  │  ┌──────────────────────────────────────────────────────────┐   ││
│  │  │              Subnet Pública (10.10.1.0/24)                │   ││
│  │  │                                                           │   ││
│  │  │  ┌─────────────────────────────────────────────────────┐ │   ││
│  │  │  │                    EC2 Instance                     │ │   ││
│  │  │  │                                                      │ │   ││
│  │  │  │  ┌──────────────┐  ┌─────────────────────────────┐  │ │   ││
│  │  │  │  │   Docker     │  │     Containers             │  │ │   ││
│  │  │  │  │   Engine     │  │  ┌───────────────────────┐  │  │ │   ││
│  │  │  │  │              │  │  │ Nginx (Porta 80/443)  │  │  │ │   ││
│  │  │  │  │              │  │  │ Frontend (Porta 3000)  │  │  │ │   ││
│  │  │  │  │              │  │  │ Backend API (Porta 8002)│ │  │ │   ││
│  │  │  │  │              │  │  │ Postgres (Porta 5432)  │  │  │ │   ││
│  │  │  │  │              │  │  │ ChromaDB (Porta 8000)  │  │  │ │   ││
│  │  │  │  │              │  │  │ Loki, Prometheus, etc │  │  │ │   ││
│  │  │  │  │              │  │  └───────────────────────┘  │  │ │   ││
│  │  │  │  └──────────────┘  └─────────────────────────────┘  │   ││
│  │  │  │                                                      │   ││
│  │  │  │  ┌──────────────────────────────────────────────┐   │   ││
│  │  │  │  │           Elastic IP (3.217.77.125)            │   │   ││
│  │  │  │  └──────────────────────────────────────────────┘   │   ││
│  │  │  └─────────────────────────────────────────────────────┘ │   ││
│  │  └──────────────────────────────────────────────────────────┘   ││
│  │                                                                  ││
│  │  ┌──────────────────────────────────────────────────────────┐   ││
│  │  │              Internet Gateway                              │   ││
│  │  └──────────────────────────────────────────────────────────┘   ││
│  │                                                                  ││
│  │  ┌──────────────────────────────────────────────────────────┐   ││
│  │  │              Security Group (Firewall)                     │   ││
│  │  │  - Porta 22 (SSH) - apenas seu IP                        │   ││
│  │  │  - Porta 80 (HTTP) - qualquer IP                        │   ││
│  │  │  - Porta 443 (HTTPS) - qualquer IP                      │   ││
│  │  └──────────────────────────────────────────────────────────┘   ││
│  │                                                                  ││
│  │  ┌──────────────────────────────────────────────────────────┐   ││
│  │  │              IAM Role & SSM Parameter Store               │   ││
│  │  │  - Permissões para buscar secrets                        │   ││
│  │  │  - Senhas, API Keys armazenadas com segurança            │   ││
│  │  └──────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ DNS (webapps.codes → 3.217.77.125)
         ▼
┌─────────────────┐
│   Usuário      │
│   Browser       │
└─────────────────┘
```

---

## Fases do Deploy

### Fase 1: Preparação Local (Sua Máquina)

Antes de começar, você precisa ter:

1. **Credenciais AWS configuradas**
2. **Git instalado**
3. **Domínio registrado** (para o SSL)

#### 1.1 Configurar Credenciais AWS

O Terraform precisa das suas credenciais da AWS para criar os recursos.

```bash
# Verificar credenciais configuradas
aws configure list

# Testar se as credenciais funcionam
aws sts get-caller-identity
```

Se retornar seu usuário/ARN, as credenciais estão válidas.

**Se não tiver credenciais:**
1. Acesse o Console AWS → IAM → Users → seu usuário
2. Aba Security credentials → Create access key
3. Na sua máquina: `aws configure`
4. Cole Access Key ID e Secret Access Key

#### 1.2 Verificar Domínio

Você precisa ter um domínio registrado (ex: `webapps.codes`) e acesso ao DNS para criar registros A.

---

### Fase 2: Criar Infraestrutura com Terraform

O Terraform é uma ferramenta de **Infrastructure as Code (IaC)**. Ele cria toda a infraestrutura na AWS de forma automatizada e reproduzível.

#### 2.1 Conceitos do Terraform

| Conceito | Descrição |
|----------|-----------|
| **Provider** | Plugin que conecta o Terraform a um provedor (AWS, Azure, etc.) |
| **Resource** | Componente de infraestrutura (EC2, VPC, S3, etc.) |
| **Module** | Grupo reutilizável de resources |
| **State** | Arquivo que armazena o estado atual da infraestrutura |
| **tfvars** | Arquivo de variáveis de configuração |

#### 2.2 Criar Bucket S3 para State do Terraform

O Terraform precisa armazenar o "estado" da infraestrutura em algum lugar. Usamos o S3 para isso.

```bash
# Criar bucket para armazenar o estado do Terraform
aws s3 mb s3://med-tutor-prod-tfstate --region us-east-1

# Habilitar versionamento (permite reverter mudanças)
aws s3api put-bucket-versioning --bucket med-tutor-prod-tfstate --versioning-configuration Status=Enabled
```

**O que isso faz:**
- Cria um bucket S3 chamado `med-tutor-prod-tfstate`
- O `--region us-east-1` define a região AWS
- O versionamento permite voltar a versões anteriores do estado

#### 2.3 Rodar o Terraform

```bash
make deploy-aws-prod
```

**O que esse comando faz:**
```bash
cd aws/envs/prod && terraform init && terraform apply -auto-approve
```

1. `cd aws/envs/prod` - Entra na pasta com configurações de produção
2. `terraform init` - Inicializa o Terraform e baixa os providers
3. `terraform apply -auto-approve` - Cria/modifica os recursos na AWS

**Recursos criados:**
- **VPC**: Rede virtual isolada (10.10.0.0/16)
- **Subnet**: Sub-rede pública (10.10.1.0/24)
- **Internet Gateway**: Permite comunicação com a internet
- **Route Table**: Define rotas de rede
- **Security Group**: Firewall com regras de acesso (SSH, HTTP, HTTPS)
- **EC2 Instance**: Servidor virtual (t3.micro)
- **Elastic IP**: IP fixo público
- **IAM Role**: Permissões para a EC2 acessar SSM

---

### Fase 3: Configurar DNS

O DNS traduz nomes de domínio (webapps.codes) para endereços IP.

#### 3.1 Criar Registro A no DNS

No painel do seu registrador de domínio (name.com):

1. Acesse **DNS Records**
2. Adicione um **A Record**:
   - **Host**: `@` (representa o domínio principal, ex: webapps.codes)
   - **Value**: `3.217.77.125` (IP da sua EC2)
   - **TTL**: `300` (5 minutos para propagação)

**O que é TTL?**
TTL (Time To Live) define quanto tempo o DNS pode ser cacheado. Valores menores = propagação mais rápida, mas mais consultas ao servidor DNS.

#### 3.2 Aguardar Propagação

```bash
# Na sua máquina local
ping webapps.codes
```

Aguarde até o ping resolver para `3.217.77.125`. Pode levar de 5 minutos a 48 horas.

---

### Fase 4: Preparar a Instância EC2

Conecte-se à instância EC2:

```bash
ssh -i ~/.ssh/diego-key.pem ec2-user@3.217.77.125
```

#### 4.1 Atualizar PATH

Adicione `/usr/local/bin` ao PATH:

```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### 4.2 Instalar Docker Compose Standalone

O Docker Compose standalone é necessário porque a versão do plugin Docker integrada à instância é antiga.

```bash
# Baixar Docker Compose standalone
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose

# Dar permissão de execução
chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker-compose --version
```

**Por que Docker Compose?**
Docker Compose é uma ferramenta para definir e rodar aplicações Docker com múltiplos containers. Você define todos os serviços (backend, frontend, banco de dados, etc.) em um arquivo YAML.

#### 4.3 Instalar Buildx (se necessário)

Buildx é uma extensão do Docker para builds avançados.

```bash
mkdir -p ~/.docker/cli-plugins
curl -L "https://github.com/docker/buildx/releases/download/v0.17.0/buildx-v0.17.0.linux-amd64" \
  -o ~/.docker/cli-plugins/docker-buildx
chmod +x ~/.docker/cli-plugins/docker-buildx
```

---

### Fase 5: Configurar Secrets no AWS SSM

AWS Systems Manager (SSM) Parameter Store é um serviço para armazenar configurações e secrets com segurança.

#### 5.1 O que são Secrets?

Secrets são informações sensíveis como:
- Senhas
- API Keys
- Tokens de acesso

#### 5.2 Criar Parâmetros no SSM

```bash
# Senha do PostgreSQL (SecureString = criptografado)
aws ssm put-parameter \
  --name "/medtutor/prod/postgres_password" \
  --value "SuaSenhaForte123!" \
  --type SecureString \
  --overwrite

# Usuário do Grafana (String = não criptografado, mas público)
aws ssm put-parameter \
  --name "/medtutor/prod/grafana_admin_user" \
  --value "admin" \
  --type String \
  --overwrite

# Senha do Grafana
aws ssm put-parameter \
  --name "/medtutor/prod/grafana_admin_password" \
  --value "SuaSenhaGrafana123!" \
  --type SecureString \
  --overwrite

# API Key do Gemini
aws ssm put-parameter \
  --name "/medtutor/prod/gemini_api_key" \
  --value "AIzaSy..." \
  --type SecureString \
  --overwrite

# API Key da OpenAI (vazio se não usar)
aws ssm put-parameter \
  --name "/medtutor/prod/openai_api_key" \
  --value "not-configured" \
  --type SecureString \
  --overwrite
```

**Por que usar SSM em vez de hardcoded?**
- Segurança: Senhas não ficam no código
- Rotação: Facilita trocar senhas periodicamente
- Auditoria: AWS registra quem acessou cada parâmetro
- Gerenciamento centralizado: Todas as configs em um lugar

---

### Fase 6: Deploy da Aplicação

#### 6.1 Baixar Secrets do SSM para a Instância

```bash
cd app

AWS_REGION="us-east-1" \
POSTGRES_PASSWORD_SSM_PARAMETER="/medtutor/prod/postgres_password" \
GRAFANA_ADMIN_USER_SSM_PARAMETER="/medtutor/prod/grafana_admin_user" \
GRAFANA_ADMIN_PASSWORD_SSM_PARAMETER="/medtutor/prod/grafana_admin_password" \
GEMINI_API_KEY_SSM_PARAMETER="/medtutor/prod/gemini_api_key" \
OPENAI_API_KEY_SSM_PARAMETER="/medtutor/prod/openai_api_key" \
./scripts/prod/fetch_ssm_env.sh
```

**O que isso faz:**
1. Conecta ao SSM usando as credenciais da IAM Role
2. Baixa cada parâmetro
3. Salva em `.runtime/prod/app.env`

Verifique o conteúdo:
```bash
cat .runtime/prod/app.env
```

#### 6.2 Preparar Runtime

```bash
# Sincronizar configurações de ambiente
DOMAIN_NAME="webapps.codes" \
LETSENCRYPT_EMAIL="seu-email@exemplo.com" \
CORS_ALLOWED_ORIGINS="https://webapps.codes" \
./scripts/prod/sync_settings_env.sh

# Criar diretórios necessários
DOMAIN_NAME="webapps.codes" ./scripts/prod/ensure_runtime_dirs.sh

# Gerar certificado auto-assinado temporário
DOMAIN_NAME="webapps.codes" ./scripts/prod/init_self_signed_cert.sh
```

**O que cada script faz:**

| Script | Função |
|--------|--------|
| `sync_settings_env.sh` | Gera `settings.env` com variáveis de domínio |
| `ensure_runtime_dirs.sh` | Cria `/var/www/certbot` para validação SSL |
| `init_self_signed_cert.sh` | Cria certificado temporário para testes |

#### 6.3 Build e Up dos Containers

```bash
# Build das imagens Docker
docker-compose -f docker-compose.prod.yml build

# Iniciar todos os serviços
docker-compose -f docker-compose.prod.yml up -d
```

**O que cada serviço faz:**

| Serviço | Imagem | Porta | Função |
|---------|--------|-------|--------|
| frontend | nginx + app | 3000 | Interface do usuário |
| backend | FastAPI | 8002 | API REST |
| postgres | postgres:16 | 5432 | Banco de dados relacional |
| chromadb | chromadb:0.5.5 | 8000 | Banco de vetores para IA |
| loki | grafana/loki | 3100 | Agregador de logs |
| prometheus | prom/prometheus | 9090 | Coletor de métricas |
| promtail | grafana/promtail | - | Agent de logs |
| grafana | grafana/grafana | 3001 | Dashboards de monitoramento |

#### 6.4 Verificar Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

Saída esperada:
```
NAME                  IMAGE                        SERVICE      STATUS
medtutor-backend      medtutor-unioeste-backend    backend      Up
medtutor-chromadb     chromadb/chroma:0.5.5       chromadb     Up
medtutor-frontend     medtutor-unioeste-frontend   frontend     Up
medtutor-grafana      grafana/grafana:11.1.4       grafana      Up
medtutor-loki         grafana/loki:2.9.8           loki         Up
medtutor-postgres     postgres:16-alpine           postgres     Up
medtutor-prometheus   prom/prometheus:v2.54.1       prometheus   Up
medtutor-promtail     grafana/promtail:3.0.0       promtail     Up
```

---

### Fase 7: Configurar HTTPS com Let's Encrypt

Let's Encrypt é uma autoridade certificadora gratuita que emite certificados SSL.

#### 7.1 O que é SSL/TLS?

SSL (Secure Sockets Layer) é um protocolo de segurança que:
- Criptografa a comunicação entre navegador e servidor
- Autentica a identidade do servidor
- É obrigatório para sites seguros (https://)

#### 7.2 Emitir Certificado

```bash
DOMAIN_NAME="webapps.codes" \
LETSENCRYPT_EMAIL="seu-email@exemplo.com" \
./scripts/prod/issue_ssl.sh
```

**O que esse script faz:**
1. Para o container certbot (serviço de geração de certificados)
2. Valida que você controla o domínio (via desafio HTTP)
3. Gera certificados em `/etc/letsencrypt/`
4. Recarrega o Nginx

#### 7.3 Verificar HTTPS

Acesse no navegador:
- https://webapps.codes (frontend)
- https://webapps.codes/api (backend)

---

## Glossário de Comandos

### AWS CLI

```mermaid
flowchart TD
  subgraph AWS_Cloud [AWS Cloud]
    subgraph VPC [VPC (10.10.0.0/16)]
      IGW[Internet Gateway]
      SG[Security Group\n- Porta 22 (SSH)\n- Porta 80 (HTTP)\n- Porta 443 (HTTPS)]
      IAM[IAM Role & SSM Parameter Store\n- Permissões para buscar secrets\n- Senhas/API Keys seguras]
      subgraph Subnet_Publica [Subnet Pública (10.10.1.0/24)]
        EC2[EC2 Instance]
        EIP[Elastic IP (3.217.77.125)]
        subgraph Docker_Engine [Docker Engine]
          Nginx[Nginx (80/443)]
          Frontend[Frontend (3000)]
          Backend[Backend API (8002)]
          Postgres[Postgres (5432)]
          ChromaDB[ChromaDB (8000)]
          Loki[Loki]
          Prometheus[Prometheus]
        end
      end
    end
  end
  DNS[DNS (webapps.codes → 3.217.77.125)]
  User[Usuário/Browser]
  User-->|Acessa|DNS
  DNS-->|Resolve IP|EIP
  EIP-->|Associa|EC2
  EC2-->|Executa|Docker_Engine
  IGW-->|Permite acesso|Subnet_Publica
  SG-->|Firewall|Subnet_Publica
  IAM-->|Secrets|EC2
```

```bash
# Listar instâncias EC2
aws ec2 describe-instances

# Parar uma instância
aws ec2 stop-instances --instance-ids i-xxxxx

# Iniciar uma instância
aws ec2 start-instances --instance-ids i-xxxxx

# Associar Elastic IP
aws ec2 associate-address --instance-id i-xxxxx --allocation-id eipalloc-xxxxx

# Criar bucket S3
aws s3 mb s3://nome-do-bucket

# Armazenar parâmetro no SSM
aws ssm put-parameter --name "/caminho/parametro" --value "valor" --type SecureString

# Recuperar parâmetro do SSM
aws ssm get-parameter --name "/caminho/parametro" --with-decryption

# Verificar identidade (testa credenciais)
aws sts get-caller-identity
```

### Terraform

```bash
# Inicializar (baixa providers, plugins)
terraform init

# Ver o que será criado (sem executar)
terraform plan

# Aplicar mudanças na AWS
terraform apply -auto-approve

# Destruir todos os recursos (CUIDADO!)
terraform destroy -auto-approve

# Ver estado atual
terraform show
```

### Docker / Docker Compose

```bash
# Ver versão
docker --version
docker-compose --version

# Listar containers rodando
docker-compose -f docker-compose.prod.yml ps

# Iniciar todos os serviços
docker-compose -f docker-compose.prod.yml up -d

# Parar todos os serviços
docker-compose -f docker-compose.prod.yml down

# Ver logs de um serviço
docker-compose -f docker-compose.prod.yml logs -f backend

# Rebuild de imagens
docker-compose -f docker-compose.prod.yml build

# Rebuild + up (sem cache)
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### SSH

```bash
# Conectar à instância
ssh -i caminho/para/chave.pem ec2-user@ip-da-instancia

# Remover chave de host antiga (quando IP é reutilizado)
ssh-keygen -f ~/.ssh/known_hosts -R ip-da-instancia
```

---

## Estrutura de Arquivos do Deploy

```
medtutor-unioeste/
├── aws/
│   ├── modules/                    # Módulos Terraform reutilizáveis
│   │   ├── network/              # VPC, Subnet, Gateway
│   │   ├── security/             # Security Groups
│   │   └── compute/              # EC2, IAM
│   └── envs/
│       └── prod/                  # Configuração de produção
│           ├── main.tf            # Recursos a criar
│           ├── variables.tf      # Definição de variáveis
│           ├── outputs.tf        # Saídas (IPs, IDs)
│           ├── provider.tf       # Configuração AWS
│           └── terraform.tfvars   # Valores das variáveis
│
├── scripts/
│   └── prod/                      # Scripts de deploy produção
│       ├── fetch_ssm_env.sh      # Baixa secrets do SSM
│       ├── sync_settings_env.sh  # Gera settings.env
│       ├── ensure_runtime_dirs.sh# Cria diretórios SSL
│       ├── init_self_signed_cert.sh # Cert temporário
│       ├── compose.sh            # Wrapper docker-compose
│       ├── issue_ssl.sh          # Let's Encrypt
│       └── renew_ssl.sh          # Renovação automática
│
├── docker-compose.prod.yml       # Definição dos containers
├── .runtime/                     # Arquivos de runtime (gitignored)
│   └── prod/
│       ├── app.env              # Secrets do SSM
│       └── settings.env         # Configs de domínio
│
├── Makefile                      # Comandos de automação
└── DEPLOY_GUIDE.md              # Este guia
```

---

## Comandos Rápidos de Referência

### Na sua máquina local:

```bash
# Deploy da infraestrutura
make deploy-aws-prod

# Ver IP da instância
aws ec2 describe-instances --instance-ids i-xxxxx --query 'Reservations[0].Instances[0].PublicIpAddress'
```

### Na instância EC2:

```bash
# Todos os containers
docker-compose -f docker-compose.prod.yml ps

# Iniciar aplicação
export $(cat .runtime/prod/app.env | xargs) && \
export DOMAIN_NAME="webapps.codes" && \
export CORS_ALLOWED_ORIGINS="https://webapps.codes" && \
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend

# Reiniciar um serviço
docker-compose -f docker-compose.prod.yml restart backend

# Emitir/renovar SSL
DOMAIN_NAME="webapps.codes" LETSENCRYPT_EMAIL="email@exemplo.com" ./scripts/prod/issue_ssl.sh
```

---

## Troubleshooting

### Problema: "Permission denied" ao conectar SSH

```bash
# Corrigir permissões da chave
chmod 600 ~/.ssh/diego-key.pem
```

### Problema: "Host key has changed"

```bash
# Remover chave antiga
ssh-keygen -f ~/.ssh/known_hosts -R 3.217.77.125
```

### Problema: SSM ParameterNotFound

1. Verifique se os parâmetros existem:
   ```bash
   aws ssm describe-parameters --parameter-filters "Key=Path,Values=/medtutor/prod"
   ```

2. Verifique se a IAM Role está associada:
   ```bash
   aws ec2 describe-instances --instance-ids i-xxxxx --query 'Reservations[0].Instances[0].IamInstanceProfile'
   ```

3. Reinicie a instância para recarregar permissões:
   ```bash
   aws ec2 stop-instances --instance-ids i-xxxxx
   aws ec2 start-instances --instance-ids i-xxxxx
   ```

### Problema: Container não sobe

```bash
# Ver logs do container específico
docker-compose -f docker-compose.prod.yml logs -f <servico>

# Rebuild sem cache
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Problema: Let's Encrypt falha ao validar domínio

1. Verifique se o DNS já propagou:
   ```bash
   ping webapps.codes
   ```

2. Verifique se a porta 80 está aberta no Security Group:
   ```bash
   aws ec2 describe-security-groups --group-ids sg-xxxxx
   ```

3. Teste manualmente o acesso HTTP:
   ```bash
   curl http://webapps.codes/.well-known/acme-challenge/test
   ```

---

## Manutenção Contínua

### Renovação Automática de SSL

O cron job já está configurado para renovar automaticamente:
```bash
cat /etc/cron.d/medtutor-cert-renew
```

### Atualizar Código

```bash
cd app
git pull origin chore/deploy-vps-test
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Backup do Estado Terraform

O estado já está salvo no S3:
```
Bucket: med-tutor-prod-tfstate
```

Para fazer backup local:
```bash
aws s3 sync s3://med-tutor-prod-tfstate ./terraform-state-backup/
```

---

## Segurança

### Boas Práticas Implementadas

1. **IAM Roles** em vez de credenciais hardcoded
2. **SSM Parameter Store** com criptografia (SecureString)
3. **Security Groups** limitando portas abertas
4. **SSH** apenas do seu IP
5. **Certificados SSL** Let's Encrypt

### Recomendações Adicionais

1. **Nunca commite** `.runtime/` no git
2. **Rotacione senhas** periodicamente no SSM
3. **Monitore** logs no Grafana
4. **Backups** do banco de dados

---

## Referências

- [Documentação AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Documentação Terraform AWS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Docker Compose](https://docs.docker.com/compose/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [AWS SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
