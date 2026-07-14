# ADR-014: Why Kubernetes Namespace Strategy

*   **ADR Number:** 014
*   **Title:** Adoption of Logical Environment Isolation via Namespaces
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
We are deploying multiple environments (Dev, Staging) and various types of workloads (Applications, Databases, Monitoring) into our Kubernetes clusters.

## Problem Statement
Deploying everything into the `default` namespace leads to chaos. It becomes impossible to enforce security boundaries, manage resources efficiently, or quickly understand the architecture of the running cluster.

## Decision
We will implement a strict **Namespace Strategy** for isolation.

## Defined Namespaces
1.  **`ecommerce-dev`:** Developer testing environment.
2.  **`ecommerce-staging`:** Pre-production testing.
3.  **`ecommerce-prod`:** Live production (resides in a completely separate physical EKS cluster, but maintains namespace structure).
4.  **`monitoring`:** Prometheus, Grafana, Loki, AlertManager.
5.  **`ingress-nginx` / `gateway`:** Ingress controllers and API Gateway.
6.  **`argocd`:** GitOps deployment tools.

## Alternatives Considered
*   **Single Cluster per Environment:** We use this for Production (Prod is physically isolated). However, for Dev and Staging, spinning up entirely separate EKS clusters is cost-prohibitive.
*   **No Namespaces:** Rejected. Security and operational nightmare.

## Advantages
*   **Team Separation:** Different teams can have different access levels. Developers can have full access to `ecommerce-dev`, but read-only access to `monitoring`.
*   **Resource Quotas:** We can apply `ResourceQuotas` and `LimitRanges` per namespace. For example, ensuring the `ecommerce-dev` namespace cannot consume more than 20% of the cluster's RAM.
*   **Security (Network Policies):** We can implement Calico Network Policies that explicitly block traffic *between* namespaces (e.g., `ecommerce-dev` cannot talk to `ecommerce-staging`).

## Disadvantages
*   Slightly more YAML configuration to manage namespace metadata.
*   Requires managing RBAC RoleBindings per namespace instead of globally.

## Risks
*   Misconfigured Network Policies might accidentally block necessary cross-namespace traffic (e.g., apps talking to monitoring).

## Consequences
All Helm charts and Deployment manifests must explicitly declare their target namespace. External access (DNS) must be routed carefully via the Ingress controller to the correct namespace backend.

## Operational Impact
Improves operational clarity. `kubectl get pods -n ecommerce-prod` clearly filters noise.

## Performance Impact
None. Namespaces are logical constructs, not physical boundaries.

## Security Impact
Highly positive. Enables zero-trust network policies and granular RBAC.

## Cost Impact
Reduces costs by allowing us to pack multiple non-production environments (Dev, Staging) securely into a single EKS cluster.

## Future Considerations
If the engineering team grows significantly, we may introduce namespace-as-a-service (vCluster) to give every developer their own ephemeral virtual cluster.

## References
*   Kubernetes Documentation: Namespaces
