# Sprint Plan

*Assuming 2-week sprints.*

## Sprint 1: Project Setup & IaC
*   **Goal:** Establish repository structure and base cloud infrastructure.
*   **Tasks:**
    *   Create GitHub repository and folder structure.
    *   Write Terraform code for AWS VPC and subnets.
    *   Write Terraform code for EKS cluster.
    *   Configure GitHub Actions for Terraform validation.

## Sprint 2: Core Microservices Foundation
*   **Goal:** Build foundational microservices and API Gateway.
*   **Tasks:**
    *   Initialize Spring Boot projects for API Gateway, Auth, and Product services.
    *   Implement basic JWT authentication.
    *   Create Dockerfiles for the services.
    *   Push initial images to GHCR.

## Sprint 3: Kubernetes & GitOps Basics
*   **Goal:** Deploy core services to Kubernetes using GitOps.
*   **Tasks:**
    *   Write Helm charts for core services.
    *   Install ArgoCD on EKS.
    *   Configure ArgoCD to sync Helm charts to the Dev namespace.
    *   Verify routing through API Gateway Ingress.

## Sprint 4: Transactional Services
*   **Goal:** Develop Cart and Order services.
*   **Tasks:**
    *   Implement Cart Service with Redis backend.
    *   Implement Order Service with PostgreSQL backend.
    *   Write unit and integration tests.
    *   Deploy to Dev environment via ArgoCD.

## Sprint 5: Event-Driven Architecture
*   **Goal:** Integrate asynchronous communication.
*   **Tasks:**
    *   Provision RabbitMQ cluster.
    *   Develop Payment Service and Notification Service.
    *   Implement message publishing from Order Service.
    *   Implement message consumption in Notification Service.

## Sprint 6: Frontend Development
*   **Goal:** Build the user interface.
*   **Tasks:**
    *   Initialize React application.
    *   Implement login/registration pages.
    *   Implement product catalog and cart UI.
    *   Integrate with API Gateway.

## Sprint 7: Observability
*   **Goal:** Implement monitoring and logging.
*   **Tasks:**
    *   Deploy kube-prometheus-stack via Helm.
    *   Deploy Loki and Fluent Bit.
    *   Create custom Grafana dashboards for business metrics.
    *   Configure AlertManager rules.

## Sprint 8: Hardening & Release
*   **Goal:** Prepare for production launch.
*   **Tasks:**
    *   Run Load Tests and Security Tests (Trivy, Checkov).
    *   Implement Kubernetes Network Policies.
    *   Configure HPA and Pod Disruption Budgets.
    *   Production deployment.
