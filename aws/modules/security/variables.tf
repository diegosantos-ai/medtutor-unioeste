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

variable "ssh_allowed_cidr" {
  description = "CIDR permitido para acesso SSH"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC onde o security group será criado"
  type        = string
}
