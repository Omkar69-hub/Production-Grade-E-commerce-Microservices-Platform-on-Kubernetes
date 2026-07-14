# Runbook: Database Recovery

## Symptoms
*   Alerts firing for `DatabaseDown`, `HighConnectionCount`, or `HighQueryLatency`.
*   Applications are throwing `SQLTimeoutException` or `ConnectionRefused` errors.
*   AWS RDS console shows the database in an unhealthy state.

## Diagnosis
1.  **Check CloudWatch Metrics**: Review CPUUtilization, DatabaseConnections, and FreeStorageSpace for the RDS instance.
2.  **Check Active Queries**: If the DB is responsive but slow, connect using a read replica or admin credentials to run `pg_stat_activity` and identify long-running queries or locks.
3.  **Check Application Connection Pools**: Ensure applications are not leaking connections (HikariCP metrics).

## Resolution
1.  **Kill Blocking Queries**: If a specific query is deadlocking the database, manually terminate the backend PID.
2.  **Failover**: If the primary instance is degraded, initiate a manual Multi-AZ failover via the AWS Console or CLI:
    ```bash
    aws rds reboot-db-instance --db-instance-identifier ecommerce-prod-db --force-failover
    ```
3.  **Storage Exhaustion**: If `FreeStorageSpace` is 0, modify the RDS instance to increase allocated storage (Auto-scaling should be enabled by default).
4.  **Point-in-Time Restore**: If data corruption occurred (e.g., accidental DROP TABLE), follow the DR plan to restore from AWS Backup to a new instance, verify the data, and update DNS/Secrets to point to the new instance.

## Verification
*   Verify connections in CloudWatch are returning to normal levels.
*   Verify application health checks are passing.
