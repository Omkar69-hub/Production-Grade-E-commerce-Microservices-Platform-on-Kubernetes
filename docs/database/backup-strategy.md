# Backup & Restore Strategy

## 1. Automated Backups (RPO = 5 mins)
*   **Mechanism:** AWS RDS Automated Backups.
*   **Schedule:** Daily full snapshot taken during a low-traffic maintenance window (e.g., 03:00 UTC).
*   **Retention:** 30 days.
*   **Point-In-Time Recovery (PITR):** Transaction logs (WAL) are shipped to S3 every 5 minutes. This allows us to restore the database to any specific second within the 30-day retention window.

## 2. Disaster Recovery (DR) Backups
*   To protect against a complete AWS Region failure, RDS Snapshots are automatically copied to a secondary AWS Region (e.g., from `us-east-1` to `us-west-2`) via AWS Backup daily.

## 3. Restore Procedure
1.  **Identify Failure:** Determine the exact time data corruption occurred (e.g., `2026-07-13T14:32:00Z`).
2.  **Trigger PITR:** Use the AWS Console or Terraform to restore a *new* RDS instance from the snapshot to exactly 1 second before the corruption (`2026-07-13T14:31:59Z`).
3.  **Validation:** SRE validates the data in the new instance.
4.  **Cutover:** Update the Kubernetes Secrets via Terraform/External Secrets to point the microservice to the new RDS endpoint. The microservice pods are restarted to pick up the new connection string.
5.  **Decommission:** The corrupted original database is snapshotted for forensics and then terminated.
