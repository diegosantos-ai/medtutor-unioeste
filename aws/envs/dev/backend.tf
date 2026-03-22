terraform {
  required_version = ">= 1.5.0"
  backend "s3" {
    bucket       = "<NOME_DO_PROJETO>-dev-tfstate"
    key          = "<NOME_DO_PROJETO>/dev/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
