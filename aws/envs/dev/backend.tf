terraform {
  backend "s3" {
    bucket  = "med-tutor-dev-tfstate"
    key     = "envs/dev/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
