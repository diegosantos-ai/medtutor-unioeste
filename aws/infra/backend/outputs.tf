output "terraform_state_bucket_name" {
  description = "Nome do bucket S3 usado para armazenar o state remoto."
  value       = aws_s3_bucket.terraform_state.bucket
}

output "aws_region" {
  description = "Região AWS onde o backend foi provisionado."
  value       = var.aws_region
}
