# Production Go-Live Checklist

This checklist must be completed and signed off before routing real user traffic to the production environment.

## 1. Security & Compliance
- [ ] Gitleaks, Checkov, and Trivy scans pass cleanly.
- [ ] Network Policies (Default Deny) are active.
- [ ] Pod Security Standards (Restricted) are enforced.
- [ ] No hardcoded secrets exist; External Secrets Operator is functioning.
- [ ] TLS certificates are valid and auto-renewing (cert-manager).
- [ ] Database data at rest is encrypted (KMS).

## 2. Reliability & High Availability
- [ ] Deployments have a minimum of 2 replicas.
- [ ] PodAntiAffinity or TopologySpreadConstraints are configured across Availability Zones.
- [ ] PodDisruptionBudgets (PDBs) are applied to critical services.
- [ ] Liveness and Readiness probes are configured and tuned.
- [ ] RDS is deployed in Multi-AZ mode.
- [ ] RabbitMQ is deployed as a highly available cluster (if applicable).

## 3. Observability & Monitoring
- [ ] Prometheus is successfully scraping metrics from all services.
- [ ] Grafana dashboards are populated with data.
- [ ] Alertmanager is configured to page on-call (PagerDuty/Opsgenie integration).
- [ ] Centralized logging (ELK/EFK/CloudWatch) is capturing application logs.
- [ ] Distributed tracing (Jaeger/X-Ray) is functional.

## 4. Scaling & Performance
- [ ] Horizontal Pod Autoscalers (HPA) are configured.
- [ ] Kubernetes Cluster Autoscaler (or Karpenter) is active.
- [ ] Resource Requests and Limits are set for every container.
- [ ] Load tests (K6) have passed the required SLA thresholds.

## 5. Backup & Disaster Recovery
- [ ] AWS Automated Backups are enabled for RDS.
- [ ] Logical backup CronJobs (S3 exports) are scheduled.
- [ ] Velero is configured for cluster state backup.
- [ ] A DR tabletop exercise has been conducted.

## 6. Operations
- [ ] On-call schedule is defined and active.
- [ ] Runbooks are accessible to the on-call team.
- [ ] Incident Response Slack channels are set up.

---
**Sign-off:**
*   Engineering Lead: ____________________
*   SRE/DevOps Lead: ____________________
*   Security Officer: ____________________
