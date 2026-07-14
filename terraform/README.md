# Terraform AWS Infrastructure

This directory contains the Infrastructure as Code (IaC) configuration for the Production-Grade E-Commerce Platform on AWS.

## Architecture & Module Strategy

We leverage custom, highly targeted Terraform modules located in the `modules/` directory to ensure complete control, modularity, and readability.

### Networking (`modules/vpc`)
- Deploys a highly available VPC across 3 Availability Zones.
- Configures Public and Private subnets.
- Provisions NAT Gateways (Single NAT for dev to save costs, 3 NATs for prod).

### Compute (`modules/eks`)
- Provisions Amazon EKS (Elastic Kubernetes Service) control plane.
- Configures Managed Node Groups scaling automatically.
- Deploys IAM OIDC providers allowing pods to securely assume AWS IAM Roles (IRSA).

### Databases (`modules/rds` & `modules/redis`)
- Deploys PostgreSQL on Amazon RDS.
- Deploys Redis on Amazon ElastiCache.
- **Security Posture**: Data stores are placed strictly in **Private Subnets**, accessible only by the EKS worker nodes within the VPC. No public ingress is permitted.

### Container Registry (`modules/ecr`)
- Provisions 8 independent, private AWS ECR repositories for all microservices.
- Automatically configured with a lifecycle policy to retain only the 30 most recent images, minimizing storage costs.

## State Management

State is securely stored remotely in an **S3 Bucket** (`ecommerce-platform-tf-state-12345`) and state locking is handled via **DynamoDB** (`ecommerce-platform-tf-locks`).

To bootstrap a brand new AWS account, you must apply the `terraform/backend/` configuration first.

## Environment Deployment Guide

To deploy an environment (e.g., Development):
```bash
cd terraform/environments/dev
terraform init
terraform plan
terraform apply
```
