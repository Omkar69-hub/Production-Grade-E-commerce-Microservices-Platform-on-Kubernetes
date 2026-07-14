# ADR-015: Why RBAC and Least Privilege Security

*   **ADR Number:** 015
*   **Title:** Adoption of Role-Based Access Control (RBAC) and Least Privilege Principle
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
Both our AWS infrastructure and our Kubernetes clusters have powerful APIs. Unrestricted access to these APIs can lead to catastrophic data loss, accidental outages, or malicious exploitation.

## Problem Statement
By default, early-stage startups often use overly permissive IAM roles and cluster-admin access to move fast. For an enterprise-grade platform, this poses an unacceptable security risk.

## Decision
We will strictly enforce the principle of **Least Privilege** across AWS (IAM) and Kubernetes (RBAC).

## Architecture Details

### Kubernetes RBAC
*   **Roles & RoleBindings:** Used to grant permissions *within a specific namespace*.
*   **ClusterRoles & ClusterRoleBindings:** Used sparingly for cluster-wide tools (e.g., Ingress controller, Prometheus).
*   **Service Accounts:** Every microservice pod runs under a dedicated, scoped `ServiceAccount`. It does *not* use the `default` service account.

### AWS IAM Integration
*   **IRSA (IAM Roles for Service Accounts):** We use AWS IRSA to map a Kubernetes `ServiceAccount` directly to an AWS IAM Role. If the Order Service needs to write to an S3 bucket, it assumes an IAM role natively without needing hardcoded AWS credentials stored in Secrets.

### Secrets Management
*   Kubernetes Secrets are encrypted at rest using an AWS KMS key.
*   We use External Secrets Operator to sync secrets from AWS Secrets Manager into Kubernetes, ensuring no plaintext secrets ever touch Git.

## Alternatives Considered
*   **Static IAM Access Keys:** Rejected. Hardcoding AWS keys in Kubernetes secrets or environment variables is a major anti-pattern due to the risk of credential leakage and lack of automatic rotation.
*   **Global Cluster Admin:** Rejected. Developers will not have `cluster-admin` access.

## Advantages
*   **Security:** Drastically limits the blast radius of a compromised pod or stolen developer laptop.
*   **Compliance:** Meets standard enterprise compliance requirements (SOC2, ISO27001).
*   **Traceability:** AWS CloudTrail and Kubernetes Audit Logs clearly show *who* or *what* assumed a specific role to execute an action.

## Disadvantages
*   **Friction:** Slows down initial development as engineers must explicitly define and request IAM/RBAC permissions instead of relying on default permissive access.
*   **Complexity:** Managing complex JSON IAM policies and YAML RoleBindings is tedious.

## Risks
*   Overly strict policies might break application functionality in hard-to-debug ways (e.g., subtle `AccessDenied` errors deep in logs).

## Consequences
All Terraform modules must explicitly define the minimal required IAM policies. Helm charts must define their own ServiceAccounts.

## Operational Impact
High initial effort to configure correctly. Ongoing effort required to review and approve IAM permission change requests.

## Performance Impact
Negligible. AWS STS token retrieval for IRSA is fast and cached.

## Security Impact
Critical for enterprise readiness. Forms the foundation of our defense-in-depth strategy.

## Cost Impact
AWS IAM and basic KMS are virtually free. AWS Secrets Manager incurs a small per-secret cost.

## Future Considerations
Implement automated IAM policy generation and review using tools like AWS IAM Access Analyzer or Cloudsplaining.

## References
*   AWS Well-Architected Framework: Security Pillar
