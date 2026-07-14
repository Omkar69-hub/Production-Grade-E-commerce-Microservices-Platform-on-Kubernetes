# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-13

### Added
- **Core Microservices**: API Gateway, Auth, Product, Cart, Order, Payment, and Notification services using Spring Boot 3 and Java 21.
- **Frontend App**: React 19 SPA with Tailwind CSS.
- **Message Broker**: RabbitMQ integration for asynchronous, event-driven communication (OrderCreated, PaymentProcessed).
- **Databases**: PostgreSQL for persistent relational data; Redis for distributed caching and session management.
- **Containerization**: Optimized, multi-stage Dockerfiles for all services ensuring non-root execution and minimal image size.
- **Kubernetes Deployment**: Comprehensive Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets, Ingress).
- **Helm Charts**: Abstracted Kubernetes configurations into reusable Helm charts with environment-specific values.
- **Infrastructure as Code**: Terraform modules for provisioning AWS VPC, EKS, RDS, and ElastiCache.
- **GitOps**: Argo CD configurations using the App of Apps pattern for automated continuous delivery.
- **Observability**: Prometheus ServiceMonitors, Grafana Dashboards, and Spring Boot Actuator integration.
- **Security**: Kubernetes Network Policies, RBAC, Pod Security Standards, Checkov/Trivy configs.
- **Operations & SRE**: Disaster Recovery plans, Backup CronJobs, PodDisruptionBudgets, and Incident Response runbooks.
- **Testing**: Postman API collections, K6 load test scripts, and Kubernetes smoke tests.
- **Documentation**: ADRs, architecture diagrams, portfolio summaries, and comprehensive READMEs.

### Changed
- N/A (Initial Release)

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- Implemented default deny-all network policies.
- Enforced read-only root filesystems across all containers.
