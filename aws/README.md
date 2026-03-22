# Template Terraform AWS Base - Premium Standard

Este template provisiona a infraestrutura base na AWS implementando os mais altos padrões de DevOps:

## 🏗️ Arquitetura

- **`envs/`**: Composição de infraestrutura (Dev, QA, Prod). Usa módulos locais.
- **`modules/`**: Lógica de recursos AWS versionados (Compute, Network, Security).
- **`infra/backend/`**: O estado é remoto. (Amazon S3 com State Lock via DynamoDB).

## ✅ Práticas Adotadas
- State Locking.
- Separação de Módulos (DRY - Don't Repeat Yourself).
- Variáveis externalizadas e injetadas via CI/CD.
