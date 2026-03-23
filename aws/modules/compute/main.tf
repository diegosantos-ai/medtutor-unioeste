terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "web" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  key_name                    = var.key_pair_name
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.web_security_group_id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              # 1. Update OS e instalação de dependências essenciais
              dnf update -y
              dnf install -y git make docker

              # 2. Configura e Habilita o Docker Daemon
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ec2-user

              # 3. Instala o Docker Compose Plugin autônomo
              curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

              # 4. Bootstrap da Aplicação MedTutor
              cd /home/ec2-user
              git clone https://github.com/diegosantos-ai/medtutor-unioeste.git app
              cd app
              chown -R ec2-user:ec2-user /home/ec2-user/app

              # Atenção: Conforme as diretrizes de Shift-Left Security do projeto,
              # tokens sensíveis não são chumbados aqui. Devem ser parametrizados pelo AWS Systems Manager
              # Exemplo abstrato de injeção defensiva de Env:
              # export GEMINI_API_KEY=$(aws ssm get-parameter --name "/medtutor/prod/gemini_key" --with-decryption --query "Parameter.Value" --output text)

              # 5. Build e Run da Stack
              make build-prod
              make up-prod
              EOF

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-ec2-web"
  })
}
