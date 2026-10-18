# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-18 (Stage 9 Remediation & Security Hardening)

### Security
- **Fix 1 (Default Admin Neutralization)**: Added Flyway migration `V4__neutralize_default_admin.sql` to lock, disable, and scramble the seeded default administrator account. Implemented idempotent `AdminBootstrapService` to dynamically create a secure administrator only when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are explicitly supplied via environment variables.
- **Fix 2 (Configurable Gateway CORS)**: Replaced wildcard and overly permissive CORS configurations with strict environment-variable-driven origin evaluation (`CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_ORIGIN_PATTERNS`). Enforced fail-closed Gateway initialization under `prod` profile if allowed origins are missing.
- **Fix 3 (Internal Checkout & Mock Payment Guarding)**: Enforced fail-closed rejection on customer cart modifications, order creation, and mock payment execution via `ENABLE_INTERNAL_CHECKOUT` (`InternalCheckoutGuardFilter`, `CartService`, `OrderService`, `PaymentService`). Guarded frontend routes `/cart`, `/checkout`, `/orders/success` via `VITE_ENABLE_INTERNAL_CHECKOUT` to redirect to `/collection`. Preserved administrative queries and refunds.
- **Fix 4 (In-Memory Session & Refresh-Token Lifecycle)**: Removed access tokens and credentials from browser `localStorage` and `sessionStorage`. Stored access tokens strictly in memory (Redux). Implemented HTTP-only, `SameSite=Strict`, path-restricted refresh token cookies with cryptographically secure token rotation, SHA-256 token hashing, and family revocation upon reuse. Implemented state-changing CSRF defense using double-submit cookie validation (`XSRF-TOKEN` / `X-XSRF-TOKEN`).
- **Fix 5 (Secret Hygiene Audit & Git Safety)**: Audited tracked repository files for exposed credentials and plain text secret fallbacks. Formulated rotation procedures for historical development credentials and recommended external secret stores (Vault / External Secrets Operator).

### Removed
- **Fix 5 (Repository Cleanup)**: Removed tracked Windows binary (`k3d.exe`), stale database dumps (`postgres_backup.sql`, `product_backup.sql`), redundant root compose file (`committed_docker_compose.yml`), and obsolete test script directory (`scratch/verify_phase1.py`).
- Cleaned and hardened `.gitignore` to prevent committing `.env` variations, executables (`*.exe`), database backups (`*backup*.sql`), and scratch directories.

### Changed
- Aligned documentation (`README.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`) to reflect LUMIÈRE's business model as a luxury clothing discovery and referral showcase where customer transactions occur on external brand websites.
- Standardized product pricing policy on Indian Rupees (INR, ₹) with fail-closed "Price on Inquiry" display for unverified prices.
- Documented that proposed catalog migration `V5__seed_lumiere_clothing_catalog.sql` remains strictly preserved in `services/product-service/proposed-migrations/` and requires separate operational review and authorization before execution.

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
