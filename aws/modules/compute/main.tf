terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
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
              dnf update -y
              dnf install -y httpd

              cat > /var/www/html/index.html <<'HTML'
              <html>
                <head>
                  <title>Projeto 02</title>
                </head>
                <body>
                  <h1>Projeto 02 - AWS Web Infrastructure with Terraform</h1>
                  <p>Servico web publicado com sucesso via Terraform.</p>
                  <p>Environment: ${var.environment}</p>
                  <p>Owner: ${var.owner}</p>
                </body>
              </html>
              HTML

              systemctl enable httpd
              systemctl start httpd
              EOF

  tags = {
    Name        = "p02-dev-ec2-web"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}
