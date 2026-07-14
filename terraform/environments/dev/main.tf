terraform {
  backend "s3" {
    bucket         = "ecommerce-platform-tf-state-12345"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "ecommerce-platform-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

module "vpc" {
  source = "../../modules/vpc"

  environment        = "dev"
  cidr_block         = "10.0.0.0/16"
  public_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets    = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  cluster_name       = "ecommerce-dev-cluster"
  single_nat_gateway = true
}

module "eks" {
  source = "../../modules/eks"

  cluster_name    = "ecommerce-dev-cluster"
  cluster_version = "1.30"
  subnet_ids      = module.vpc.private_subnets
  instance_types  = ["t3.medium"]
  desired_size    = 2
  min_size        = 1
  max_size        = 3
}

module "rds" {
  source = "../../modules/rds"

  environment             = "dev"
  vpc_id                  = module.vpc.vpc_id
  vpc_cidr_block          = "10.0.0.0/16"
  subnet_ids              = module.vpc.private_subnets
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  db_name                 = "ecommerce_dev"
  db_username             = "ecommerce_admin"
  db_password             = "super_secret_dev_pass" # In production, use AWS Secrets Manager
  multi_az                = false
  backup_retention_period = 7
}

module "redis" {
  source = "../../modules/redis"

  environment        = "dev"
  vpc_id             = module.vpc.vpc_id
  vpc_cidr_block     = "10.0.0.0/16"
  subnet_ids         = module.vpc.private_subnets
  node_type          = "cache.t3.micro"
  num_cache_clusters = 1
}

module "ecr" {
  source = "../../modules/ecr"

  repositories = [
    "frontend",
    "api-gateway",
    "auth-service",
    "product-service",
    "cart-service",
    "order-service",
    "payment-service",
    "notification-service"
  ]
}

module "iam" {
  source = "../../modules/iam"

  environment       = "dev"
  oidc_issuer_url   = module.eks.oidc_issuer
  oidc_provider_arn = module.eks.oidc_provider_arn
}
