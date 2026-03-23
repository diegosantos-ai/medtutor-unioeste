terraform {
  backend "s3" {
    bucket  = "med-tutor-prod-tfstate"
    key     = "envs/prod/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
