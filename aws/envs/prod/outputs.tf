output "aws_region" {
  description = "Região AWS utilizada no projeto"
  value       = var.aws_region
}

output "environment" {
  description = "Ambiente definido para o projeto"
  value       = var.environment
}

output "project_name" {
  description = "Nome lógico do projeto"
  value       = var.project_name
}

output "owner" {
  description = "Responsável pelo projeto"
  value       = var.owner
}

output "vpc_id" {
  description = "ID da VPC principal do projeto"
  value       = module.network.vpc_id
}

output "public_subnet_id" {
  description = "ID da subnet pública"
  value       = module.network.public_subnet_id
}

output "internet_gateway_id" {
  description = "ID do Internet Gateway da VPC principal"
  value       = module.network.internet_gateway_id
}

output "public_route_table_id" {
  description = "ID da route table pública"
  value       = module.network.public_route_table_id
}

output "web_security_group_id" {
  description = "ID do security group do serviço web"
  value       = module.security.web_security_group_id
}

output "web_instance_id" {
  description = "ID da instância EC2 web"
  value       = module.compute.web_instance_id
}

output "web_instance_public_ip" {
  description = "IP público da instância EC2 web"
  value       = module.compute.web_instance_public_ip
}

output "web_instance_elastic_ip" {
  description = "Elastic IP fixo associado à instância EC2 web"
  value       = module.compute.web_instance_elastic_ip
}

output "web_instance_public_dns" {
  description = "DNS público da instância EC2 web"
  value       = module.compute.web_instance_public_dns
}
