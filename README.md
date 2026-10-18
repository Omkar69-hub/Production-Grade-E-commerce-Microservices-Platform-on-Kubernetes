# LUMIÈRE — Luxury Clothing Discovery & Referral Platform

A microservices platform built using Java 21 / Spring Boot 3 and React 19 / TypeScript / Vite, designed for modern cloud-native containerized architecture on Kubernetes. 

**LUMIÈRE** operates as a curated luxury clothing discovery and partner referral showcase. All customer purchases, payments, shipping, deliveries, and returns occur directly on official external partner brand websites. Direct customer cart mutations, order creation, and mock payments are guarded and disabled by default.

---

## Platform Overview & Referral Model

* **Clothing-Only Discovery**: The catalog exclusively features luxury women's, men's, and bespoke designer apparel.
* **External Partner Referral**: Each catalog piece links directly to the partner brand's official store (`affiliate_url`). Customer checkout, payments, delivery, and returns are handled entirely by external brand websites.
* **Pricing in INR**: Product pricing is denominated in Indian Rupees (INR, ₹). Any unverified, missing, or zero pricing displays fail-closed as **"Price on Inquiry"** with direct inquiry routing.
* **Internal Checkout Guarding**: Customer checkout routes (`/cart`, `/checkout`, `/orders/success`) and mutation endpoints are disabled by default (`ENABLE_INTERNAL_CHECKOUT=false`, `VITE_ENABLE_INTERNAL_CHECKOUT=false`). Internal services retain administrative reporting, auditing, and refund management capabilities.
* **Decoupled Microservices**: Core domain services (API Gateway, Auth, Product, Cart, Order, Payment, Notification) maintain loose coupling via synchronous REST and asynchronous event-driven messaging with RabbitMQ.

---

## Key Architectural Components

| Component                          | Implementation & Role                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **API Gateway**                    | Spring Cloud Gateway with centralized routing, configurable CORS origin validation, and fail-closed checkout filters.     |
| **Authentication Service**         | JWT authentication, in-memory access tokens, HTTP-only SameSite cookie refresh lifecycle, and dynamic admin bootstrapping. |
| **Product Service**                | Curated clothing catalog with luxury attributes (designer, materials, care, referral URL) backed by PostgreSQL & Redis.  |
| **Cart & Order Services**          | Internal cart and order lifecycle services, guarded by fail-closed feature flags (`ENABLE_INTERNAL_CHECKOUT=false`).       |
| **Payment Service**                | Internal mock payment gateway, guarded by fail-closed feature flags; administrative refund APIs preserved for governance.  |
| **Notification Service**           | Asynchronous event notification consumer triggered via RabbitMQ message queues.                                           |
| **React Luxury Frontend**          | Atelier editorial frontend built with React 19, TypeScript, Vite, and Tailwind CSS.                                       |
| **Container & Orchestration**      | Multi-stage non-root Dockerfiles, Kubernetes manifests, Helm charts, and Argo CD GitOps pipelines.                        |

---

## Technology Stack

| Category                    | Technologies                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| **Backend**                 | Java 21, Spring Boot 3.x, Spring Security, Spring Cloud Gateway, Spring Data JPA, Spring Validation |
| **Frontend**                | React 19, Vite, TypeScript                                                                          |
| **Databases**               | PostgreSQL 16, Redis 7                                                                              |
| **Messaging**               | RabbitMQ                                                                                            |
| **Containerization**        | Docker, Docker Compose                                                                              |
| **Container Orchestration** | Kubernetes                                                                                          |
| **Package Management**      | Helm                                                                                                |
| **Infrastructure as Code**  | Terraform                                                                                           |
| **Cloud Platform**          | AWS (EKS, VPC, IAM, RDS, ElastiCache, Route53)                                                      |
| **CI/CD**                   | GitHub Actions                                                                                      |
| **GitOps**                  | Argo CD                                                                                             |
| **Monitoring**              | Prometheus, Grafana, Loki, Fluent Bit, Alertmanager                                                 |
| **Testing**                 | JUnit 5, Mockito, Testcontainers, Postman, Newman, K6                                               |
| **Security**                | Trivy, Gitleaks, Checkov, RBAC, Network Policies, JWT                                               |

---

## Architecture Highlights

* API Gateway serving as the single entry point
* Independent Spring Boot microservices
* Database-per-Service architecture
* Event-driven communication with RabbitMQ
* Redis distributed caching
* Kubernetes-native deployment
* GitOps deployment using Argo CD
* Infrastructure provisioned with Terraform
* Enterprise observability stack
* Zero-Trust security model

---

## Configuration & Environment Variables

| Variable | Scope | Description & Accepted Formats | Development Default | Production Requirement |
| :--- | :--- | :--- | :--- | :--- |
| `CORS_ALLOWED_ORIGINS` | API Gateway | Comma-separated list of allowed origins (e.g., `https://lumiere.com,https://admin.lumiere.com`). | Localhost origins (`http://localhost:*`, `http://127.0.0.1:*`) | **Required**. Gateway refuses to start in `prod` profile without explicit allowed origins; localhost fallback is strictly disabled. |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | API Gateway | Comma-separated regex/wildcard origin patterns (e.g., `https://*.lumiere.com`). Retained for backward compatibility. | `http://localhost:*`, `http://127.0.0.1:*` | Optional fallback pattern if explicit origins are not enumerated. |
| `VITE_API_GATEWAY_URL` | React Frontend | API Gateway endpoint. Supports either `/api` (relative reverse proxy) or full HTTPS URL (e.g., `https://api.lumiere.com`). | `http://localhost:8080` (or `/api`) | **Required**. Built-in build-time validator rejects missing values and `localhost`/`127.0.0.1` fail-closed. `/api` is recommended to leverage Nginx reverse-proxying without CORS overhead. |
| `ADMIN_EMAIL` | Auth Service | Email address for initial administrator account bootstrap. | None (bootstrap skipped) | Optional. Initial admin created only when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are supplied. |
| `ADMIN_PASSWORD` | Auth Service | Password (8–50 characters) for initial administrator account. | None (bootstrap skipped) | Optional. Hashed via BCrypt. Overwrites/reactivations are strictly prohibited (idempotent). |
| `ENABLE_INTERNAL_CHECKOUT` | Backend Services (`api-gateway`, `cart-service`, `order-service`, `payment-service`) | Feature flag disabling internal customer checkout mutations and mock payment processing. Values: `true` or `false`. | `false` (disabled by default) | **Must remain disabled (`false`) in production**. When disabled, direct customer cart creation/modification, order creation, and mock payments are rejected with HTTP 403 Forbidden fail-closed. Historical reads, admin refunds, and health endpoints remain functional. |
| `VITE_ENABLE_INTERNAL_CHECKOUT` | React Frontend | Feature flag controlling customer checkout routing and UI elements. Values: `'true'` or `'false'`. | `false` (disabled by default) | **Must remain disabled (`false`) in production**. When disabled, customer access to `/cart`, `/checkout`, and `/orders/success` is redirected to `/collection`; header shopping bag icon and checkout triggers are disabled. |
| `COOKIE_SECURE` | Auth Service | Enforces `Secure` flag on HTTP-only refresh token cookie. Values: `true` or `false`. | `false` (allows HTTP in local dev) | **Required `true` in production**. Ensures refresh token cookie is only transmitted over HTTPS. |
| `COOKIE_SAME_SITE` | Auth Service | Controls `SameSite` attribute for refresh token cookie. Values: `Strict`, `Lax`, or `None`. | `Strict` | **Required `Strict` or `Lax`**. Protects refresh token cookie against cross-site request forgery. |
| `COOKIE_DOMAIN` | Auth Service | Domain attribute for refresh token cookie. | None (restricted to issuing host) | Optional. Configure if sharing session cookies across subdomains (e.g., `.lumiere.com`). |
| `COOKIE_PATH` | Auth Service | Path scope for refresh token cookie. | `/api/v1/auth` | **Recommended `/api/v1/auth`**. Restricts cookie transmission strictly to auth endpoints. |

---

## Database Migrations & Catalog Invariant

* **Active Migrations**:
  - `auth-service`: Flyway migrations `V1__init_auth_schema.sql` through `V4__neutralize_default_admin.sql` reside on the active classpath.
  - `product-service`: Flyway migrations `V1__init_product_schema.sql` through `V4__add_lumiere_clothing_attributes.sql` reside on the active classpath.
* **Proposed Catalog Migration (`V5__seed_lumiere_clothing_catalog.sql`)**:
  - The luxury clothing seed migration is maintained strictly in `services/product-service/proposed-migrations/V5__seed_lumiere_clothing_catalog.sql`.
  - **Status: PROPOSED / UNEXECUTED**. It has NOT been added to active Flyway migrations and has NOT been run against any database. Separate operational review, dry-run testing, and explicit authorization are mandatory prior to future execution. Existing migrations remain strictly unmodified.

---

## Verification Status vs. Live Cloud Deployment Disclaimer

> [!IMPORTANT]
> **Empirical Validation vs. Production Status**  
> All security hardening, route guards, fail-closed CORS policies, and session lifecycle mechanisms have been verified exclusively through automated unit, integration, and contract test suites (`TEST-ONLY` and `SOURCE-INSPECTED`).  
> **The platform has not been deployed to a live public cloud environment**, cloud infrastructure is not actively provisioned, and live end-to-end affiliate tracking or third-party penetration testing has not been executed. This codebase should be considered pre-production staging-ready, not a live deployment.

---

## Remaining Staging & Security Roadmap

1. **Secret Store Integration**: Externalize credentials (`DB_PASSWORD`, `JWT_SECRET`, Redis/RabbitMQ credentials) to an external secret store (AWS Secrets Manager, HashiCorp Vault, or External Secrets Operator).
2. **Credential Rotation**: Rotate any credentials historically committed or used in development environments.
3. **Formal Catalog Migration Execution**: Execute `V5__seed_lumiere_clothing_catalog.sql` following pre-import verification checklists and disaster recovery runbooks.
4. **Cloud Infrastructure Provisioning**: Deploy Terraform modules to AWS EKS, configure Route53, and establish ACM TLS termination.
5. **Live Staging End-to-End Validation**: Validate live referral URL attribution, CSRF token exchange, and traffic scaling under load.


## Repository Structure

| Directory     | Purpose                                                       |
| ------------- | ------------------------------------------------------------- |
| `services/`   | Backend microservices and React frontend                      |
| `docs/`       | Architecture, ADRs, API documentation, requirements, planning |
| `docker/`     | Dockerfiles and Docker Compose configurations                 |
| `kubernetes/` | Kubernetes manifests                                          |
| `helm/`       | Helm charts                                                   |
| `terraform/`  | AWS Infrastructure as Code                                    |
| `argocd/`     | GitOps deployment manifests                                   |
| `monitoring/` | Prometheus, Grafana, Loki, Fluent Bit, Alertmanager           |
| `security/`   | Security configurations and compliance documentation          |
| `operations/` | Production runbooks, backup, disaster recovery                |
| `tests/`      | API, integration, load, security, and validation tests        |
| `scripts/`    | Automation scripts                                            |
| `.github/`    | GitHub Actions workflows                                      |

---

## Enterprise Capabilities

* Production-ready architecture
* Cloud-native deployment
* Horizontal auto-scaling
* Self-healing workloads
* Infrastructure as Code
* GitOps continuous deployment
* Secure authentication
* Distributed caching
* Event-driven architecture
* Centralized logging
* Metrics and dashboards
* Health monitoring
* Disaster recovery planning
* Backup strategy
* Production hardening
* Security compliance

---

## DevOps & Platform Engineering

This project demonstrates practical implementation of:

* Docker containerization
* Kubernetes orchestration
* Helm packaging
* Terraform infrastructure provisioning
* GitHub Actions CI/CD
* Argo CD GitOps
* Prometheus monitoring
* Grafana dashboards
* Loki centralized logging
* Fluent Bit log collection
* RBAC
* Network Policies
* External Secrets
* Trivy image scanning
* Checkov Infrastructure scanning
* Gitleaks secret detection

---

## Skills Demonstrated

### Software Engineering

* Java 21
* Spring Boot
* REST APIs
* Spring Security
* JWT Authentication
* Domain-Driven Design
* Event-Driven Architecture
* Database-per-Service

### DevOps

* Docker
* Kubernetes
* Helm
* GitHub Actions
* Argo CD
* Terraform
* CI/CD
* GitOps

### Cloud Engineering

* AWS EKS
* IAM
* RDS
* ElastiCache
* Networking
* High Availability
* Auto Scaling

### Site Reliability Engineering

* Monitoring
* Alerting
* Logging
* Disaster Recovery
* Backup Strategy
* Production Runbooks

---

## License

This project is licensed under the **MIT License**.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the **Software**), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the conditions of the MIT License.

See the **LICENSE** file for the complete license text.

---

## Acknowledgements

This repository was developed as a comprehensive cloud-native engineering project to demonstrate modern enterprise software development, DevOps, Platform Engineering, Infrastructure as Code, GitOps, Security, Observability, and Site Reliability Engineering practices.

It serves as a portfolio-quality reference implementation for recruiters, hiring managers, and engineers interested in production-grade microservices architecture.
