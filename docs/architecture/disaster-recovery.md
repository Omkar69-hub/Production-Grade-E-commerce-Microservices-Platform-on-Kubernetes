# Disaster Recovery & High Availability Strategy

## 1. High Availability (HA) Architecture
*   **Multi-AZ Deployment:** The AWS EKS cluster, RDS databases, and ElastiCache (Redis) are distributed across three AWS Availability Zones (AZs) in a single region.
*   **Pod Anti-Affinity:** Kubernetes deployment manifests include `podAntiAffinity` rules to ensure that multiple replicas of the same microservice are never scheduled on the same underlying physical node.
*   **Pod Disruption Budgets (PDB):** PDBs guarantee a minimum number of available pods during voluntary disruptions (e.g., node upgrades).

## 2. Backup Strategy
*   **Databases (PostgreSQL):** AWS RDS Automated Backups run daily, capturing snapshots with a 30-day retention period. Point-In-Time Recovery (PITR) is enabled, allowing restoration to any second within the retention window.
*   **Infrastructure State:** All infrastructure (Terraform) and Kubernetes manifests (Helm/Argo) are stored in Git. Git *is* the backup of the infrastructure state.
*   **Persistent Volumes:** Kubernetes PVCs utilizing EBS volumes have automated CSI snapshots scheduled via Velero.

## 3. Disaster Recovery (DR) Plan
The platform follows a **Pilot Light** DR strategy for catastrophic regional failure.

### Recovery Time Objective (RTO) and Recovery Point Objective (RPO)
*   **RPO (Data Loss Tolerance):** 5 minutes (based on cross-region RDS replication lag and snapshot schedules).
*   **RTO (Downtime Tolerance):** 4 hours (time required to spin up the secondary region from IaC and failover DNS).

### Failover Procedure
1.  **Declare Incident:** SRE team confirms primary region (e.g., `us-east-1`) is irrecoverably down.
2.  **Infrastructure Provisioning:** Execute Terraform pipelines targeting the secondary region (e.g., `us-west-2`). Since everything is codified, VPCs, EKS, and load balancers are provisioned rapidly.
3.  **Database Promotion:** Promote the cross-region RDS Read Replica to become the new primary standalone database.
4.  **Application Sync:** Point ArgoCD to the new EKS cluster. ArgoCD automatically pulls all Helm charts and deploys the microservices.
5.  **DNS Cutover:** Update Route53 to route traffic to the new ALB in the secondary region.
