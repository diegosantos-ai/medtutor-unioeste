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
}

variable "public_subnet_cidr" {
  description = "Bloco CIDR da subnet pública"
  type        = string
}

variable "public_subnet_az" {
  description = "Availability Zone da subnet pública"
  type        = string
}
