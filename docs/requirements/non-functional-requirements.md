# Non-Functional Requirements (NFRs)

## 1. Performance & Scalability
*   **NFR-1.1 (Latency):** 95% of API requests must complete within 200ms.
*   **NFR-1.2 (Throughput):** The system must support at least 1,000 concurrent active users.
*   **NFR-1.3 (Auto-Scaling):** Kubernetes Horizontal Pod Autoscaler (HPA) must scale microservices up when CPU utilization exceeds 70% or memory exceeds 80%.
*   **NFR-1.4 (Caching):** Frequently accessed data (e.g., product catalog) must be cached using Redis to reduce database load.

## 2. Availability & Reliability
*   **NFR-2.1 (Uptime):** The platform must guarantee 99.99% (Four Nines) availability.
*   **NFR-2.2 (Redundancy):** All microservices must have a minimum of 2 replicas spread across multiple Availability Zones in AWS EKS.
*   **NFR-2.3 (Resilience):** The system must gracefully handle downstream service failures using circuit breakers and fallback mechanisms.

## 3. Security
*   **NFR-3.1 (Authentication):** All external API calls (except public product endpoints) must be authenticated using JWT via the API Gateway.
*   **NFR-3.2 (Encryption in Transit):** All external communication must be secured using TLS 1.2+.
*   **NFR-3.3 (Secrets Management):** Sensitive configuration (DB passwords, API keys) must be injected via Kubernetes Secrets and managed securely (e.g., AWS Secrets Manager or Sealed Secrets).
*   **NFR-3.4 (Vulnerability Scanning):** Docker images must be scanned for CVEs using Trivy before deployment.

## 4. Observability & Monitoring
*   **NFR-4.1 (Metrics):** All services must expose Prometheus metrics via the `/actuator/prometheus` endpoint.
*   **NFR-4.2 (Centralized Logging):** Application logs must be collected by Fluent Bit, aggregated in Loki, and queryable in Grafana.
*   **NFR-4.3 (Tracing):** Distributed tracing must be implemented (using OpenTelemetry/Zipkin) to track requests across microservice boundaries.

## 5. Maintainability & Deployability
*   **NFR-5.1 (CI/CD):** Code merges to the `main` branch must automatically trigger testing and building via GitHub Actions.
*   **NFR-5.2 (GitOps):** Deployments to Kubernetes must be automated via ArgoCD using the GitOps pattern.
*   **NFR-5.3 (Zero-Downtime Deployments):** Microservices must be deployed using Kubernetes Rolling Updates with defined readiness and liveness probes.
