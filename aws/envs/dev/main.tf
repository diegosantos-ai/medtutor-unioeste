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

  project_name          = var.project_name
  environment           = var.environment
  owner                 = var.owner
  instance_type         = var.instance_type
  key_pair_name         = var.key_pair_name
  public_subnet_id      = module.network.public_subnet_id
  web_security_group_id = module.security.web_security_group_id
}

moved {
  from = aws_instance.web
  to   = module.compute.aws_instance.web
}
