# Enterprise Backup Strategy

## 1. Relational Database (Amazon RDS - PostgreSQL)
*   **Method**: AWS Automated Backups & AWS Backup.
*   **RPO (Recovery Point Objective)**: 5 Minutes (using Point-in-Time Recovery - PITR).
*   **Retention**: 30 days for automated snapshots, 1 year for monthly AWS Backup snapshots (stored in cold storage).
*   **Secondary Method**: Logical backups via Kubernetes CronJob (`pg_dump`) exported to S3 for disaster portability (in case we need to restore outside of AWS RDS).

## 2. In-Memory Data Store (Amazon ElastiCache - Redis)
*   **Method**: Redis native snapshotting (.rdb).
*   **RPO**: 1 Hour.
*   **Retention**: 7 days.
*   *Note*: Since Redis is primarily used as a cache, aggressive backups are less critical, but necessary for session persistence recovery.

## 3. Message Broker (RabbitMQ)
*   **Method**: Definition export (Exchanges, Queues, Bindings).
*   **Retention**: Definitions are stored in Git (IaC/Helm). Message payload backup is explicitly NOT performed as queues should be transient.

## 4. Kubernetes State & Configuration (EKS)
*   **Method**: Velero.
*   **Scope**: Kubernetes resources (Deployments, Services, ConfigMaps, PVCs) backed up to an Amazon S3 bucket.
*   **Frequency**: Every 4 hours.
*   **Retention**: 14 days.

## 5. Infrastructure and GitOps State
*   **Method**: Git.
*   **Scope**: Terraform state files are stored in a versioned S3 bucket with DynamoDB locking. All Kubernetes manifests and Helm charts are stored in GitHub (managed by Argo CD).
*   **Retention**: Infinite (Git history + S3 versioning).

## Verification Process
*   Automated restore tests are conducted monthly using AWS Backup and Velero to a segregated "Restore Test" namespace/VPC.
