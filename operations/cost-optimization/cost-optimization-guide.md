# Cost Optimization Guide

Running a highly available microservices platform on AWS can become expensive. Follow these guidelines to optimize costs without sacrificing reliability.

## 1. Compute Optimization (EKS / EC2)
*   **Right-Sizing**: Use VPA recommendations and Datadog/Grafana to ensure CPU and Memory `requests` reflect actual usage. Over-requesting wastes money; under-requesting causes throttling/OOM.
*   **Spot Instances**: Utilize AWS Spot Instances for stateless, fault-tolerant workloads (e.g., background workers, stateless web servers) via managed Node Groups or Karpenter. Spot can save up to 70%.
*   **Reserved Instances / Savings Plans**: Commit to 1-year or 3-year Compute Savings Plans for the baseline, predictable load (the minimum nodes always running).

## 2. Database Optimization (RDS / ElastiCache)
*   **Instance Types**: Use Graviton2/Graviton3 instances (e.g., `db.t4g` or `db.m6g`) for better price/performance over x86.
*   **Storage**: Use `gp3` volumes instead of `gp2`, which offer higher baseline performance and independent IOPS scaling, often at a lower cost.
*   **Reserved Instances**: Purchase RDS Reserved Instances for production databases.

## 3. Storage and Data Transfer
*   **S3 Lifecycle Policies**: Move older logical backups and log archives to cheaper storage tiers (Standard-IA, Glacier) after 30 days. Delete them after 1 year.
*   **Data Transfer**: Keep traffic internal where possible. Ensure VPC Endpoints (PrivateLink) are used for AWS services (S3, Secrets Manager) to avoid NAT Gateway data transfer charges.

## 4. Observability Optimization
*   **Log Retention**: CloudWatch and ELK logs are expensive. Retain application logs for 14 days in hot storage, then archive to S3.
*   **Metric Cardinality**: Avoid high-cardinality labels in Prometheus (e.g., don't use user ID or transaction ID as a label).
