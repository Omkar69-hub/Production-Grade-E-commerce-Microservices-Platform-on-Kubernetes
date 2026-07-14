# CIS Benchmarks Alignment

This document outlines how our platform aligns with the Center for Internet Security (CIS) Benchmarks for Kubernetes and Docker.

## CIS Kubernetes Benchmark

We strive for compliance with the latest CIS Kubernetes Benchmark. Key alignments include:

### 1. Control Plane Components
* Managed by the Cloud Provider (EKS/GKE), ensuring control plane security is handled according to provider best practices.

### 2. etcd
* etcd communication is encrypted via TLS.
* Access is restricted to the API Server.

### 3. Control Plane Configuration
* Audit logging is enabled.
* Anonymous authentication is disabled.
* Profiling is disabled where not required.

### 4. Worker Nodes
* Kubelet configuration follows CIS recommendations (e.g., `--anonymous-auth=false`, `--authorization-mode=Webhook`).

### 5. Policies (RBAC, Pod Security, Network)
* **RBAC**: Least privilege applied. No default service accounts are used for applications.
* **Pod Security Standards**: 'Restricted' profile enforced at the namespace level.
* **Network Policies**: Default deny-all policy in place. Explicit ingress/egress defined per microservice.
* **Secrets**: Stored securely using External Secrets Operator, avoiding hardcoded secrets in manifests.

## CIS Docker Benchmark (Container Security)

Our container builds adhere to the following principles derived from the CIS Docker Benchmark:

### 1. Host Configuration
* Container runtime is updated regularly.
* Access to the Docker daemon is restricted.

### 2. Container Images and Build File
* **Rootless**: Containers run as non-root users (`USER 10001`).
* **Minimal Base Images**: We use Alpine or Distroless base images to reduce the attack surface.
* **Healthchecks**: Docker/Kubernetes health checks (liveness/readiness probes) are configured.
* **No Secrets in Images**: Gitleaks and Trivy ensure secrets are not baked into images.

### 3. Container Runtime
* **Read-Only Root Filesystem**: Enforced via Pod Security Context.
* **No Privilege Escalation**: `allowPrivilegeEscalation: false` is set for all containers.
* **Capabilities Dropped**: `capabilities: drop: ["ALL"]` is enforced.
