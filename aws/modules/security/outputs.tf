output "web_security_group_id" {
  description = "ID do security group do serviço web"
  value       = aws_security_group.web.id
}
