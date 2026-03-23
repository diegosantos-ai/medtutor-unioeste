variable "aws_region" {
  description = "Região AWS onde a infraestrutura será provisionada"
  type        = string
}

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

variable "vpc_cidr" {
  description = "Bloco CIDR da VPC do projeto"
  type        = string
  default     = "10.10.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Bloco CIDR da subnet pública"
  type        = string
  default     = "10.10.1.0/24"
}

variable "public_subnet_az" {
  description = "Availability Zone da subnet pública"
  type        = string
  default     = "us-east-1a"
}

variable "ssh_allowed_cidr" {
  description = "CIDR permitido para acesso SSH"
  type        = string
}

variable "instance_type" {
  description = "Tipo da instância EC2"
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "Nome do Key Pair existente na AWS para acesso SSH"
  type        = string
}

variable "repo_url" {
  description = "Repositorio Git que sera clonado na instancia"
  type        = string
  default     = "https://github.com/diegosantos-ai/medtutor-unioeste.git"
}

variable "repo_ref" {
  description = "Branch ou tag da aplicacao que sera implantada na instancia"
  type        = string
  default     = "main"
}

variable "domain_name" {
  description = "Dominio publico da demo apontado para o Elastic IP da instancia"
  type        = string
}

variable "letsencrypt_email" {
  description = "Email administrativo utilizado pelo Certbot para emissao do certificado"
  type        = string
}

variable "postgres_password_ssm_parameter" {
  description = "Nome do parametro SSM que contem a senha do PostgreSQL"
  type        = string
}

variable "grafana_admin_user_ssm_parameter" {
  description = "Nome do parametro SSM que contem o usuario admin do Grafana"
  type        = string
}

variable "grafana_admin_password_ssm_parameter" {
  description = "Nome do parametro SSM que contem a senha admin do Grafana"
  type        = string
}

variable "gemini_api_key_ssm_parameter" {
  description = "Nome do parametro SSM que contem a GEMINI_API_KEY"
  type        = string
  default     = ""
}

variable "openai_api_key_ssm_parameter" {
  description = "Nome do parametro SSM que contem a OPENAI_API_KEY"
  type        = string
  default     = ""
}
