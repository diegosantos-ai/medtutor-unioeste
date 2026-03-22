variable "aws_region" {
  description = "Região AWS onde o backend remoto será provisionado."
  type        = string
}

variable "project_name" {
  description = "Nome base do projeto para composição dos recursos."
  type        = string
}

variable "environment" {
  description = "Ambiente de execução do projeto."
  type        = string
}

variable "owner" {
  description = "Responsável pelos recursos provisionados."
  type        = string
}
