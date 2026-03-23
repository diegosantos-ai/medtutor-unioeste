module "network" {
  source = "../../modules/network"

  project_name       = var.project_name
  environment        = var.environment
  owner              = var.owner
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  public_subnet_az   = var.public_subnet_az
}

moved {
  from = aws_vpc.main
  to   = module.network.aws_vpc.main
}

moved {
  from = aws_subnet.public
  to   = module.network.aws_subnet.public
}

moved {
  from = aws_internet_gateway.main
  to   = module.network.aws_internet_gateway.main
}

moved {
  from = aws_route_table.public
  to   = module.network.aws_route_table.public
}

moved {
  from = aws_route.public_internet_access
  to   = module.network.aws_route.public_internet_access
}

moved {
  from = aws_route_table_association.public
  to   = module.network.aws_route_table_association.public
}

module "security" {
  source = "../../modules/security"

  project_name     = var.project_name
  environment      = var.environment
  owner            = var.owner
  ssh_allowed_cidr = var.ssh_allowed_cidr
  vpc_id           = module.network.vpc_id
}

moved {
  from = aws_security_group.web
  to   = module.security.aws_security_group.web
}

moved {
  from = aws_vpc_security_group_ingress_rule.web_http
  to   = module.security.aws_vpc_security_group_ingress_rule.web_http
}

moved {
  from = aws_vpc_security_group_ingress_rule.web_ssh
  to   = module.security.aws_vpc_security_group_ingress_rule.web_ssh
}

moved {
  from = aws_vpc_security_group_egress_rule.web_all_outbound
  to   = module.security.aws_vpc_security_group_egress_rule.web_all_outbound
}

moved {
  from = aws_vpc_security_group_ingress_rule.web_grafana
  to   = module.security.aws_vpc_security_group_ingress_rule.web_https
}

module "compute" {
  source = "../../modules/compute"

  project_name                         = var.project_name
  environment                          = var.environment
  owner                                = var.owner
  instance_type                        = var.instance_type
  key_pair_name                        = var.key_pair_name
  public_subnet_id                     = module.network.public_subnet_id
  web_security_group_id                = module.security.web_security_group_id
  repo_url                             = var.repo_url
  repo_ref                             = var.repo_ref
  domain_name                          = var.domain_name
  letsencrypt_email                    = var.letsencrypt_email
  aws_region                           = var.aws_region
  postgres_password_ssm_parameter      = var.postgres_password_ssm_parameter
  grafana_admin_user_ssm_parameter     = var.grafana_admin_user_ssm_parameter
  grafana_admin_password_ssm_parameter = var.grafana_admin_password_ssm_parameter
  gemini_api_key_ssm_parameter         = var.gemini_api_key_ssm_parameter
  openai_api_key_ssm_parameter         = var.openai_api_key_ssm_parameter
}

moved {
  from = aws_instance.web
  to   = module.compute.aws_instance.web
}
