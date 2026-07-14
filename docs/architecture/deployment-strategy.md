# Deployment Strategy

## 1. Environments
The platform utilizes three distinct, isolated environments:
*   **Development (Dev):** A lightweight Kubernetes namespace (or separate small cluster) where continuous integration automatically deploys the latest code from the `main` branch. Used for developer validation.
*   **Staging:** An exact replica of Production (scaled down) used for QA, integration testing, load testing, and User Acceptance Testing (UAT). Deployments are triggered automatically via GitOps upon creating release branches/tags.
*   **Production:** The live environment serving real customers. Strictly governed by GitOps; manual changes via `kubectl` are blocked.

## 2. Release Strategy
We utilize **GitOps** via Argo CD. Argo CD monitors the Helm chart configurations in the repository and automatically synchronizes the cluster state to match the desired state declared in Git. 

## 3. Deployment Patterns

### 3.1 Rolling Updates (Default for standard services)
Kubernetes native `RollingUpdate` strategy is used for stateless microservices. It ensures zero downtime by incrementally replacing old Pods with new ones.
*   **MaxUnavailable:** 0 (Ensures no capacity loss during deployment).
*   **MaxSurge:** 25% (Spins up new pods before terminating old ones).

### 3.2 Canary Deployments (For critical services)
For high-risk components like the Order or Payment service, we utilize Argo Rollouts to perform Canary Deployments.
*   Traffic is shifted progressively (e.g., 10% -> 50% -> 100%).
*   Automated analysis runs against Prometheus metrics (e.g., checking HTTP 500 rates). If the error rate breaches a threshold, the deployment automatically rolls back.

### 3.3 Blue-Green Deployment (For major architectural changes)
For major version upgrades (e.g., Database schema overhauls where backward compatibility is impossible), a complete Blue-Green deployment is executed at the environment or cluster level.

## 4. Rollback Strategy
Because deployments are GitOps-driven:
1.  **Automated Rollback:** If a Canary fails its metrics check, Argo Rollouts aborts and reverts traffic to the stable version.
2.  **Manual/Git Rollback:** If an issue is discovered post-deployment, engineers use `git revert` on the manifest repository. Argo CD instantly detects the change and synchronizes the cluster back to the previous stable state.

## 5. Deployment Workflow
1.  Developer merges code to `main`.
2.  GitHub Actions runs unit tests, builds the Docker image, scans with Trivy, and pushes to GHCR.
3.  GitHub Actions updates the `values.yaml` in the Helm manifest repository with the new image tag.
4.  Argo CD detects the Git commit and initiates a sync to the Kubernetes cluster.
