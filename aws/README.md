# Template Terraform AWS Base - Premium Standard

Este template provisiona a infraestrutura base na AWS implementando os mais altos padrões de DevOps:

## 🏗️ Arquitetura

- **`envs/`**: Composição de infraestrutura (Dev, QA, Prod). Usa módulos locais.
- **`modules/`**: Lógica de recursos AWS versionados (Compute, Network, Security).
- **`infra/backend/`**: O estado é remoto. (Amazon S3 com State Lock via DynamoDB).

### Clean Workspaces

- **`aws/envs/dev/`**: Ambiente isolado de desenvolvimento.
- **`aws/envs/prod/`**: Ambiente isolado de produção.
- Cada ambiente possui seu próprio `backend.tf`, com chave S3 distinta para isolar o estado.
- A composição dos ambientes referencia apenas módulos em `aws/modules/`.
- A migração de endereços do estado é preservada com blocos `moved {}` nos `main.tf` dos ambientes.

## ✅ Práticas Adotadas
- State Locking.
- Separação de Módulos (DRY - Don't Repeat Yourself).
- Variáveis externalizadas e injetadas via CI/CD.

## Credenciais e Variáveis

- Nunca defina `access_key`, `secret_key` ou credenciais AWS em arquivos Terraform.
- Use a cadeia padrão do provider AWS:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_SESSION_TOKEN`
  - `AWS_PROFILE`
- Injete variáveis Terraform por ambiente com `TF_VAR_*`.

Exemplo:

```bash
export AWS_PROFILE=medtutor-dev
export TF_VAR_project_name=med-tutor
export TF_VAR_environment=dev
export TF_VAR_owner="Diego Santos"
```
