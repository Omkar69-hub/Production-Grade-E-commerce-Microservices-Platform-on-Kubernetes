# ADR-004: Why Kubernetes instead of Docker Compose in Production

*   **ADR Number:** 004
*   **Title:** Selection of Kubernetes for Container Orchestration
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
The platform consists of multiple containerized microservices. These containers need to be deployed, scaled, networked, and monitored in a production environment.

## Problem Statement
We need a robust orchestration platform that guarantees high availability, zero-downtime deployments, and automated scaling. Simple container runtimes are insufficient for enterprise requirements.

## Decision
We will use **Kubernetes (specifically Amazon EKS)** as our production container orchestration platform.

## Alternatives Considered
*   **Docker Compose / Docker Swarm:** Rejected. Swarm lacks the rich ecosystem, advanced scheduling, auto-scaling capabilities, and massive community support of Kubernetes. Compose is strictly for local development.
*   **AWS ECS (Elastic Container Service):** Rejected. While simpler, ECS causes severe vendor lock-in to AWS and lacks the extensive open-source Helm/Operators ecosystem available to Kubernetes.

## Advantages
*   **Self-Healing:** Kubernetes automatically restarts failed containers and reschedules them if a node dies.
*   **Auto-scaling:** Supports Horizontal Pod Autoscaling (HPA) based on metrics.
*   **Zero-Downtime:** Native support for Rolling Updates and easy integration with Canary deployments.
*   **Ecosystem:** Access to the CNCF ecosystem (Helm, Prometheus, ArgoCD, Istio).
*   **Cloud Agnostic:** Core manifests can be ported to GCP (GKE) or Azure (AKS) with minimal changes.

## Disadvantages
*   **Steep Learning Curve:** Kubernetes introduces significant complexity (Pods, Deployments, Services, Ingress, RBAC).
*   **Operational Overhead:** Managing the control plane and worker nodes requires dedicated SRE effort (mitigated slightly by using managed EKS).

## Risks
*   Misconfiguration can lead to cluster-wide outages or security vulnerabilities (e.g., overly permissive RBAC).

## Consequences
The engineering team must upskill in Kubernetes concepts. All application configurations must be converted into Kubernetes manifests.

## Operational Impact
High. Infrastructure provisioning and cluster lifecycle management will be handled via Terraform.

## Performance Impact
Slight network overhead due to overlay networking (CNI), but negligible for our use cases.

## Security Impact
Requires strict implementation of Network Policies, Pod Security Standards, and RBAC to secure the cluster.

## Cost Impact
EKS control plane incurs a fixed hourly cost. Worker nodes require careful sizing and auto-scaling to avoid wasted compute costs.

## Future Considerations
Explore Serverless Kubernetes (AWS Fargate for EKS) to further reduce operational overhead of managing EC2 worker nodes.

## References
*   Cloud Native Computing Foundation (CNCF) guidelines.
