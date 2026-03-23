output "web_instance_id" {
  description = "ID da instância EC2 web"
  value       = aws_instance.web.id
}

output "web_instance_public_ip" {
  description = "IP público da instância EC2 web"
  value       = aws_instance.web.public_ip
}

output "web_instance_elastic_ip" {
  description = "Elastic IP fixo da instância EC2 web"
  value       = aws_eip.web.public_ip
}

output "web_instance_public_dns" {
  description = "DNS público da instância EC2 web"
  value       = aws_instance.web.public_dns
}
