# Infrastructure as Code (Terraform)

This directory contains the Terraform modules and environment configurations to provision the AWS cloud infrastructure.

## Structure
*   `modules/`: Reusable Terraform components (`vpc`, `eks`, `rds`, `elasticache`, `mq`).
*   `environments/`: Environment-specific implementations (`dev`, `prod`).

## Usage
1. Configure AWS credentials (`aws configure`).
2. Navigate to an environment (`cd infrastructure/terraform/environments/prod`).
3. Run `terraform init`.
4. Run `terraform apply`.
