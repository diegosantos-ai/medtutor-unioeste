variable "project_name" {
  description = "Nome do projeto utilizado na organização e nomenclatura dos recursos"
  type        = string
}

variable "environment" {
  description = "Nome do ambiente utilizado para identificar o contexto da infraestrutura"
  type        = string
}

variable "owner" {
  description = "Responsável pelos recursos provisionados"
  type        = string
}

variable "instance_type" {
  description = "Tipo da instância EC2"
  type        = string
}

variable "key_pair_name" {
  description = "Nome do Key Pair existente na AWS para acesso SSH"
  type        = string
}

variable "public_subnet_id" {
  description = "ID da subnet pública onde a instância será provisionada"
  type        = string
}

variable "web_security_group_id" {
  description = "ID do security group associado à instância web"
  type        = string
}

variable "repo_url" {
  description = "Repositorio Git que sera clonado na instancia"
  type        = string
  default     = "https://github.com/diegosantos-ai/medtutor-unioeste.git"
}

variable "repo_ref" {
  description = "Branch ou tag da aplicacao a ser implantada"
  type        = string
  default     = "main"
}

variable "domain_name" {
  description = "Dominio publico configurado para a aplicacao"
  type        = string
  default     = ""
}

variable "letsencrypt_email" {
  description = "Email administrativo utilizado pelo Certbot"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "Regiao AWS utilizada para consultar o SSM Parameter Store"
  type        = string
  default     = ""
}

variable "postgres_password_ssm_parameter" {
  description = "Nome do parametro SSM com a senha do PostgreSQL"
  type        = string
  default     = ""
}

variable "grafana_admin_user_ssm_parameter" {
  description = "Nome do parametro SSM com o usuario admin do Grafana"
  type        = string
  default     = ""
}

variable "grafana_admin_password_ssm_parameter" {
  description = "Nome do parametro SSM com a senha admin do Grafana"
  type        = string
  default     = ""
}

variable "gemini_api_key_ssm_parameter" {
  description = "Nome do parametro SSM com a GEMINI_API_KEY"
  type        = string
  default     = ""
}

variable "openai_api_key_ssm_parameter" {
  description = "Nome do parametro SSM com a OPENAI_API_KEY"
  type        = string
  default     = ""
}
