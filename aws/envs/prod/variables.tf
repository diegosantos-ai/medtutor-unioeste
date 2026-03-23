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
