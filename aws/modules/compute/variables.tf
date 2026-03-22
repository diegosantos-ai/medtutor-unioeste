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
