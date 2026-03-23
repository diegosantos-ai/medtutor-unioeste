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
  ssm_parameter_names = compact([
    var.postgres_password_ssm_parameter,
    var.grafana_admin_user_ssm_parameter,
    var.grafana_admin_password_ssm_parameter,
    var.gemini_api_key_ssm_parameter,
    var.openai_api_key_ssm_parameter,
  ])
  aws_region_name = var.aws_region != "" ? var.aws_region : data.aws_region.current.region
  ssm_parameter_arns = [
    for parameter_name in local.ssm_parameter_names :
    "arn:aws:ssm:${local.aws_region_name}:${data.aws_caller_identity.current.account_id}:parameter/${trim(parameter_name, "/")}"
  ]
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

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_iam_policy_document" "web_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      identifiers = ["ec2.amazonaws.com"]
      type        = "Service"
    }
  }
}

data "aws_iam_policy_document" "web_ssm_access" {
  statement {
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
    ]
    resources = local.ssm_parameter_arns
  }

  statement {
    actions   = ["kms:Decrypt"]
    resources = ["*"]
  }
}

resource "aws_iam_role" "web" {
  name               = "${local.name_prefix}-web-role"
  assume_role_policy = data.aws_iam_policy_document.web_assume_role.json

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-web-role"
  })
}

resource "aws_iam_role_policy" "web_ssm_access" {
  count = length(local.ssm_parameter_arns) > 0 ? 1 : 0

  name   = "${local.name_prefix}-web-ssm-access"
  role   = aws_iam_role.web.id
  policy = data.aws_iam_policy_document.web_ssm_access.json
}

resource "aws_iam_instance_profile" "web" {
  name = "${local.name_prefix}-web-instance-profile"
  role = aws_iam_role.web.name
}

resource "aws_instance" "web" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  key_name                    = var.key_pair_name
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.web_security_group_id]
  associate_public_ip_address = false
  iam_instance_profile        = aws_iam_instance_profile.web.name

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    aws_region                           = var.aws_region
    domain_name                          = var.domain_name
    letsencrypt_email                    = var.letsencrypt_email
    repo_ref                             = var.repo_ref
    repo_url                             = var.repo_url
    postgres_password_ssm_parameter      = var.postgres_password_ssm_parameter
    grafana_admin_user_ssm_parameter     = var.grafana_admin_user_ssm_parameter
    grafana_admin_password_ssm_parameter = var.grafana_admin_password_ssm_parameter
    gemini_api_key_ssm_parameter         = var.gemini_api_key_ssm_parameter
    openai_api_key_ssm_parameter         = var.openai_api_key_ssm_parameter
  })

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-ec2-web"
  })
}

resource "aws_eip" "web" {
  domain   = "vpc"
  instance = aws_instance.web.id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-web-eip"
  })
}
