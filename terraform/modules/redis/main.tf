resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.environment}-redis-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "this" {
  name        = "${var.environment}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    cidr_blocks     = [var.vpc_cidr_block]
  }
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id          = "${var.environment}-ecommerce-redis"
  description                   = "Redis cluster for ${var.environment}"
  node_type                     = var.node_type
  num_cache_clusters            = var.num_cache_clusters
  port                          = 6379
  parameter_group_name          = "default.redis7.cluster.on"
  subnet_group_name             = aws_elasticache_subnet_group.this.name
  security_group_ids            = [aws_security_group.this.id]
  engine_version                = "7.0"
  automatic_failover_enabled    = var.num_cache_clusters > 1 ? true : false
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = false # Keep simple for internal VPC
}
