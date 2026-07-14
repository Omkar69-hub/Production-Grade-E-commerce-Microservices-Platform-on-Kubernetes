resource "aws_db_subnet_group" "this" {
  name       = "${var.environment}-rds-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.environment}-rds-subnet-group"
  }
}

resource "aws_security_group" "this" {
  name        = "${var.environment}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = [var.vpc_cidr_block] # Allow access from the VPC
  }
}

resource "aws_db_instance" "this" {
  identifier           = "${var.environment}-ecommerce-db"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  storage_type         = "gp3"
  
  db_name              = var.db_name
  username             = var.db_username
  password             = var.db_password
  
  multi_az             = var.multi_az
  publicly_accessible  = false
  db_subnet_group_name = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]

  backup_retention_period = var.backup_retention_period
  storage_encrypted       = true
  skip_final_snapshot     = var.environment == "prod" ? false : true

  performance_insights_enabled = true
}
