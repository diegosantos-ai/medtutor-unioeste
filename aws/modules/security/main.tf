terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_security_group" "web" {
  name        = "p02-dev-web-sg"
  description = "Security group do servico web do projeto 02"
  vpc_id      = var.vpc_id

  tags = {
    Project     = var.project_name
    Name        = "p02-dev-web-sg"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}

resource "aws_vpc_security_group_ingress_rule" "web_http" {
  security_group_id = aws_security_group.web.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80

  tags = {
    Project     = var.project_name
    Name        = "p02-dev-web-sg-http"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}

resource "aws_vpc_security_group_ingress_rule" "web_ssh" {
  security_group_id = aws_security_group.web.id
  cidr_ipv4         = var.ssh_allowed_cidr
  from_port         = 22
  ip_protocol       = "tcp"
  to_port           = 22

  tags = {
    Project     = var.project_name
    Name        = "p02-dev-web-sg-ssh"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}

resource "aws_vpc_security_group_egress_rule" "web_all_outbound" {
  security_group_id = aws_security_group.web.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"

  tags = {
    Project     = var.project_name
    Name        = "p02-dev-web-sg-egress"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}

resource "aws_vpc_security_group_ingress_rule" "web_grafana" {
  security_group_id = aws_security_group.web.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 3000
  ip_protocol       = "tcp"
  to_port           = 3000

  tags = {
    Project     = var.project_name
    Name        = "p02-dev-web-sg-grafana"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}
