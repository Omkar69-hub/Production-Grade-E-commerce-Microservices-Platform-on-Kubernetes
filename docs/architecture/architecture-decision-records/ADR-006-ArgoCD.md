# ADR-006: Why Argo CD instead of Traditional CD Pipelines

*   **ADR Number:** 006
*   **Title:** Adoption of Argo CD for GitOps-based Continuous Deployment
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
Deploying applications to Kubernetes traditionally involves a CI pipeline (like Jenkins or GitHub Actions) executing `kubectl apply` or `helm upgrade` against the cluster. This requires granting the CI server administrative access to the production cluster.

## Problem Statement
Traditional Push-based CD creates a massive security vulnerability (CI server has keys to the kingdom) and leads to configuration drift (where the cluster state differs from the Git repository state due to manual `kubectl` tweaks).

## Decision
We will adopt **Argo CD** to implement a Pull-based **GitOps** deployment strategy. Git will act as the single source of truth.

## Alternatives Considered
*   **GitHub Actions (Push-based):** Rejected for CD due to the security risk of storing production cluster credentials in GitHub, and the inability to automatically correct configuration drift.
*   **Flux CD:** A strong alternative. Argo CD was chosen for its superior UI, ease of use, strong multi-cluster management, and native support for SSO and RBAC.

## Advantages
*   **Security:** The Kubernetes cluster pulls changes from Git. The CI server does not need access to the cluster, significantly reducing the attack surface.
*   **Drift Reconciliation:** If an operator manually edits a Deployment via `kubectl`, Argo CD detects the drift and immediately overwrites it with the state defined in Git.
*   **Auditability:** Every change to the production environment is a Git commit, providing a perfect audit trail and easy rollbacks (`git revert`).
*   **Visibility:** The Argo CD UI provides real-time visualization of the Kubernetes resource tree and health status.

## Disadvantages
*   Requires setting up and managing Argo CD inside the cluster.
*   Disconnects CI from CD; developers have to look at Argo (not just GitHub Actions) to verify deployment success.

## Risks
*   If the Git repository goes down, no deployments can occur (though the cluster continues to run).

## Consequences
We will adopt the "App of Apps" pattern in Argo CD to bootstrap the entire cluster from a single root application. Developers will no longer have `edit` access to production via `kubectl`.

## Operational Impact
Moderate initial setup. Long-term operational overhead is drastically reduced as deployments become fully declarative and automated.

## Performance Impact
Argo CD continuously polls Git and the Kubernetes API, using minimal compute resources.

## Security Impact
Massively positive. Removes inbound access requirements to the Kubernetes API server from external CI tools.

## Cost Impact
Negligible. Argo CD is open-source.

## Future Considerations
Integration with Argo Rollouts for automated canary deployments and progressive delivery based on Prometheus metrics.

## References
*   GitOps Principles
*   Argo CD Documentation
