# Enterprise Test Strategy

## 1. Unit Testing
*   **Frameworks**: JUnit 5, Mockito.
*   **Scope**: Business logic, mappers, utility functions.
*   **Coverage Target**: Minimum 85% line coverage enforced via JaCoCo.
*   **Execution**: Runs on every commit in the CI pipeline.

## 2. Integration Testing
*   **Frameworks**: Spring Boot Test, Testcontainers.
*   **Scope**: Database interactions (PostgreSQL), Caching (Redis), Messaging (RabbitMQ).
*   **Execution**: Runs on every Pull Request. True integration is preferred over mocking for external infrastructure.

## 3. API & End-to-End (E2E) Testing
*   **Frameworks**: REST Assured (Service-level), Postman/Newman (Platform-level).
*   **Scope**: Validating REST contracts, authentication flows, and cross-service orchestration (e.g., placing an order triggering a payment and notification).
*   **Execution**: Runs against a staging or ephemeral environment post-deployment.

## 4. Load & Performance Testing
*   **Framework**: K6.
*   **Scope**: Critical paths (Product Catalog browsing, Cart operations, Checkout).
*   **Thresholds**: 95th percentile latency < 500ms; Error rate < 1%.
*   **Execution**: Scheduled nightly or prior to major releases.

## 5. Security Testing
*   **Frameworks**: OWASP ZAP (DAST), Trivy (Container scanning), Checkov (IaC scanning).
*   **Scope**: API endpoints, container images, Kubernetes manifests.
*   **Execution**: Static scanning on PRs; DAST running against the staging environment.

## 6. Resilience & Chaos Testing
*   **Scope**: Validating Circuit Breakers (Resilience4j) and graceful degradation when dependencies fail.
*   **Execution**: Manual or scheduled chaos engineering scenarios (e.g., terminating Redis pods).

## 7. Kubernetes Validation (Smoke Tests)
*   **Frameworks**: Bash scripts, Helm tests.
*   **Scope**: Ensuring Pods are ready, Services are routing traffic, and Probes are succeeding immediately after a deployment.
