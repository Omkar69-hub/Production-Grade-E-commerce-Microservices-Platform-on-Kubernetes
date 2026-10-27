# LUMIÈRE — Master Project Documentation (`BUILD.md`)

> **Document Type:** Master Architectural & Operational Specification  
> **Status:** Authoritative Single Source of Truth (SSOT)  
> **Repository Root:** `Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes/`  
> **Current Version:** `1.1.0` (Pre-Production / Local Staging Hardening)  
> **Last Updated:** 2026-10-19  

---

## 1. Project Overview & Business Model

### 1.1 Vision & Mission
**LUMIÈRE** is an atelier luxury fashion discovery, curation, and brand-referral showcase platform. It delivers a polished, editorial shopping experience that helps customers explore haute couture, bespoke apparel, designer capsules, and luxury clothing collections before connecting with official maison destinations.

### 1.2 Core Business Rules & Operational Constraints
1. **Discovery & Referral Model (Not an Inventory-Owning Retailer):**
   - LUMIÈRE does not hold retail inventory, warehouse garments, or process direct customer transactions for referred items.
   - Customers discover curated apparel and follow verified, official outbound brand links (`affiliate_url` / maison destinations) to complete purchases.
   - External partner houses and brands independently manage sales, payments, taxation, packaging, fulfillment, shipping, returns, exchanges, and post-purchase customer care.
2. **Referral Integrity & Checkout Guarding:**
   - Referred apparel items must never be routed through internal cart, order, or payment workflows.
   - Direct customer cart mutations (`POST/PUT/DELETE /api/v1/cart/**`), customer order creation (`POST /api/v1/orders`), and internal mock payment processing (`POST /api/v1/payments`) are **strictly disabled by default** via `ENABLE_INTERNAL_CHECKOUT=false` and `VITE_ENABLE_INTERNAL_CHECKOUT=false`.
   - Internal checkout must remain disabled unless explicitly authorized by the project owner for a separately defined, non-referral use case.
3. **Catalog Representation & Editorial Integrity:**
   - Static catalog concepts, editorial lookbooks, runway captures, and preview items must never be misrepresented as live warehouse inventory or verified physical stock.
   - Unverified prices must never be displayed as confirmed market prices.
4. **Currency & Pricing Standard:**
   - All customer-facing prices across the platform must be denominated exclusively in **Indian Rupees (INR, ₹)** with standard Indian number grouping (e.g., `₹1,85,000`).
   - If an item's price is unverified, missing, zero, or awaiting maison confirmation, the platform must fail closed to display **"Price on Inquiry"** alongside an inquiry trigger. Hardcoded foreign currencies (USD, EUR) or arbitrary zero amounts are strictly prohibited.
5. **Business Model Invariant:**
   - All future frontend UI enhancements, luxury redesigns, and backend microservice expansions must preserve this luxury discovery and referral model.

---

## 2. Current Project Status

### 2.1 Status Classifications
Every component, feature, and task is classified using one of six precise verification states:
* **Verified:** Confirmed by an actual check, live command execution, or reliable repository evidence.
* **Reported Complete:** Stated as completed in a previous stage report but not independently reverified in the current session.
* **Implemented, Integration Unverified:** Code exists in the repository, but end-to-end integration across services has not been confirmed.
* **In Progress:** Work has commenced but remains incomplete.
* **Planned:** Proposed and documented in the roadmap, but implementation has not started.
* **Blocked / Awaiting Approval:** Cannot proceed until a dependency, user decision, or formal authorization is resolved.

### 2.2 System-Wide Status Matrix

| Subsystem / Component | Current State | Verification Evidence / Repository Finding |
| :--- | :--- | :--- |
| **Homepage Ticker Cleanup** | **Verified** | Repeated blue brand ticker removed from `services/frontend/src/pages/home/HomePage.tsx`; 214/214 Vitest tests pass. |
| **Frontend Authentication UI** | **Verified** | Email normalization, mutable role set, name validation, and error response mapping (`message`/`detail`) implemented in `LoginPage.tsx`, `RegisterPage.tsx`, and `AuthService.ts`. |
| **Frontend Production Build** | **Verified** | Clean Vite production build completes in 2.36s with both relative `/api` and HTTPS gateway configurations (`services/frontend/vite.config.ts`). |
| **Cloudflare Pages Deployment** | **Verified** | Frontend preview hosted at `pages.dev` with `public/_redirects` SPA rewrite. Live serving commit empirically verified as `950f292` / `7e90936` via bundle asset hashes. |
| **Frontend Experience & Prototype Audit** | **Verified** | Stage 15A completed: 214/214 Vitest tests pass, production Vite build verified (4.31s), reference prototype `lumiere-prototype.html` analyzed, and live UI/UX audit documented. |
| **Editorial Design System & Referral Safety** | **Verified** | Stage 15B-1 completed: Editorial palette (parchment, ink, cobalt, lime), Fraunces + Instrument Sans typography, fail-closed ATELIER_INQUIRY referral model; 231/231 tests pass (18 test files); production build verified in 2.15s. |
| **Interactive Editorial Discovery** | **Verified** | Stage 15B-2 completed: Editorial runway track with mouse drag-to-scroll & click suppression, accessible garment colorway swatches with roving tabindex & fail-closed static palette chips, curated occasion accordion panels; 249/249 tests pass (19 test files); production build verified in 2.02s. |
| **Cloudflare Access Protection** | **In Progress / Unverified** | Zero Trust Access protection proposed for staging `pages.dev` URL, but live enforcement is not verified. Site treated as publicly reachable. |
| **Local PostgreSQL (`auth-stack-postgres`)** | **Verified Rotated & Healthy** | Live password for `lumiere_staging_user` rotated to replacement; network TCP SCRAM-SHA-256 authentication verified against container bridge IP; container healthy on port 5432. |
| **Local Redis (`auth-stack-redis`)** | **Verified Active (Old Password)** | Container running and healthy on internal network, port 6379 internal. Pending separate Redis rotation stage. |
| **Local Auth Service (`auth-stack-auth-service`)** | **Verified Active & Connected** | Recreated with transitional configuration (`.env.transitional`); Actuator reports `db: UP` (with new password) and `redis: UP` (with current password). |
| **Local API Gateway (`auth-stack-api-gateway`)** | **Blocked / Ready** | Configured in `docker/docker-compose.auth.yml` for host loopback binding `127.0.0.1:8088:8080`. Container stopped; awaiting Redis rotation before start. |
| **Host Port 8080 Process (PID 8160)** | **Verified Active** | Windows host process `java.exe` (PID 8160) listening on `0.0.0.0:8080`. Must not be terminated. Port 8088 chosen to avoid collision. |
| **Host Port 8088 Availability** | **Verified Free** | Confirmed no active TCP listener on port 8088 via `Get-NetTCPConnection`. |
| **Staging Credential Rotation** | **In Progress** | Stage 14B-1 completed (external secrets prepared); Stage 14B-2 completed (PostgreSQL live rotation and auth-service continuity verified); Redis rotation pending. |
| **External Secrets Directory (`.lumiere`)** | **Verified Created & Protected** | `C:\Users\Asus\.lumiere\.env.staging` created with restricted NTFS ACLs (`OMKAR\Asus`, `SYSTEM`, `Administrators`), outside repository and OneDrive. |
| **Product Service (`product-service`)** | **Implemented, Integration Unverified** | Spring Boot microservice running Flyway V1–V4. Unrelated container currently unhealthy in background compose stack. |
| **Catalog Migration V5** | **Planned / Unexecuted** | `V5__seed_lumiere_clothing_catalog.sql` strictly preserved in `proposed-migrations/`. Execution gated by checklist and approval. |
| **Cart, Order, Payment Services** | **Implemented, Integration Unverified** | Internal checkout guard active (`ENABLE_INTERNAL_CHECKOUT=false`). Containers unhealthy in background compose stack. |
| **Notification Service & RabbitMQ** | **Implemented, Integration Unverified** | RabbitMQ healthy in background stack; notification-service container currently unhealthy. |
| **Database Backups (Stage 8B)** | **Verified** | Physical custom dumps for `auth_db`, `product_db`, `order_db`, `payment_db` with SHA-256 hashes and verified sandbox restores documented in `backups/database/backup_20261015_173115/`. |

---

## 3. Architecture & Technology Stack

### 3.1 Architecture Overview
LUMIÈRE employs a decoupled, edge-and-microservices architecture designed for resilience, strict separation of concerns, and zero public exposure of backend data tiers:

```
[ Customer Browser / Client ]
             │
             ▼ HTTPS
┌───────────────────────────────────────────────┐
│           Cloudflare Edge Network             │
│  - Cloudflare Pages (React 19 SPA)            │
│  - SPA Routing via public/_redirects          │
│  - Future Cloudflare Access (Zero Trust)      │
└──────────────────────┬────────────────────────┘
                       │
                       ▼ HTTPS (XHR / Fetch)
┌───────────────────────────────────────────────┐
│        LUMIÈRE API Gateway (Spring Cloud)     │
│  - Local Host Loopback: 127.0.0.1:8088        │
│  - Internal Container Port: 8080              │
│  - CORS Filtering & Allowed Origins Guard     │
│  - Internal Checkout Guard (Fail-Closed 403)  │
│  - Resilience4j Circuit Breakers & Fallbacks  │
└───────┬──────────────┬──────────────┬─────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐
│ auth-service ││product-serv. ││ cart, order, │
│  (Port 8080) ││  (Port 8082) ││ payment, not.│
└───────┬──────┘└───────┬──────┘└──────────────┘
        │               │
   ┌────┴────┐     ┌────┴────┐
   ▼         ▼     ▼         ▼
┌──────┐ ┌─────┐ ┌──────┐ ┌──────┐
│Postgr│ │Redis│ │Postgr│ │Rabbit│
│ auth │ │ 7   │ │ prod │ │  MQ  │
└──────┘ └─────┘ └──────┘ └──────┘
```

### 3.2 Frontend Stack
* **Framework:** React 19.2.7 with TypeScript 6.0.2
* **Build Tool & Bundler:** Vite 8.1.1 (ESM modules, custom production build security validator)
* **UI Component Library:** Material UI (MUI) 9.2.0 (`@mui/material`, `@mui/icons-material`, Emotion)
* **State Management:**
  * Redux Toolkit 2.12.0 (`@reduxjs/toolkit`, `react-redux`): In-memory authentication state (access tokens, user profile).
  * TanStack React Query 5.101.2 (`@tanstack/react-query`): Server-state caching and catalog query invalidation.
* **Client-Side Routing:** React Router DOM 7.18.1 (`react-router-dom`) with route-level lazy loading (`Suspense`).
* **HTTP Client:** Axios 1.18.1 with automatic CSRF header injection (`X-XSRF-TOKEN`), request interceptors, and 401 refresh lifecycle handling.
* **Forms & Validation:** React Hook Form 7.81.0 with Zod 4.4.3 resolvers.
* **Testing Suite:** Vitest 4.1.10, jsdom 29.1.1, Testing Library (`@testing-library/react`, `jest-dom`).
* **Hosting Platform:** Cloudflare Pages with `public/_redirects` routing `/* -> /index.html 200`.

### 3.3 Backend Microservices Stack
All backend services are built with **Java 21** and **Spring Boot 3**, leveraging Spring Cloud Gateway, Spring Security 6, Spring Data JPA, and Hibernate:

1. **`api-gateway` (Port 8080 container / 8088 host):**
   * Reactive Spring Cloud Gateway (Netty engine).
   * Enforces CORS origins (`CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_ORIGIN_PATTERNS`).
   * Enforces `InternalCheckoutGuardFilter` (blocks `/api/v1/cart/**`, `/api/v1/orders/**`, `/api/v1/payments/**` with HTTP 403 when checkout is disabled).
   * Resilience4j circuit breakers with custom fallback endpoints (`/fallback/auth`, `/fallback/products`).
2. **`auth-service` (Port 8080/8081):**
   * User registration, authentication, and credential management.
   * Session tokens: Short-lived HMAC-SHA256 JWT access tokens (15 minutes).
   * Refresh tokens: Stored as SHA-256 hashes in PostgreSQL `refresh_tokens` table; issued via HTTP-only, `SameSite=Strict`/`None`, `Secure` cookies.
   * Token revocation: Automatic family revocation upon detected refresh-token reuse; Redis token blacklisting.
   * CSRF defense: Double-submit `XSRF-TOKEN` cookie validated against incoming `X-XSRF-TOKEN` header on state-changing operations.
   * Admin bootstrapping: Idempotent initialization via `ADMIN_EMAIL` and `ADMIN_PASSWORD` (skips if administrator already exists).
3. **`product-service` (Port 8082):**
   * Catalog, category hierarchy, clothing attributes, and brand management.
   * PostgreSQL database: `product_db`. Flyway migrations V1–V4 active.
   * Proposed migration `V5__seed_lumiere_clothing_catalog.sql` isolated in `proposed-migrations/`.
4. **`cart-service` (Port 8083):**
   * Redis-backed shopping cart management with database persistence. Guarded by `ENABLE_INTERNAL_CHECKOUT`.
5. **`order-service` (Port 8084):**
   * Relational order management and saga state machine. Guarded by `ENABLE_INTERNAL_CHECKOUT`.
6. **`payment-service` (Port 8085):**
   * Payment transaction records and refund processing. Guarded by `ENABLE_INTERNAL_CHECKOUT`.
7. **`notification-service` (Port 8086):**
   * Asynchronous event consumer (RabbitMQ); email notifications via Mailpit / SMTP.

### 3.4 Infrastructure & Data Tiers
* **Relational Persistence:** PostgreSQL 16 (Alpine). Logical databases initialized via `docker/init-dbs.sql`:
  `auth_db`, `product_db`, `cart_db`, `order_db`, `payment_db`, `notification_db`.
* **In-Memory Cache & Token Store:** Redis 7 (Alpine). Password-protected via `requirepass`.
* **Message Broker:** RabbitMQ 3 with AMQP and management UI.
* **Containerization:** Docker Compose files:
  * `docker/docker-compose.auth.yml`: Minimal 4-container authentication stack (Postgres, Redis, Auth Service, API Gateway).
  * `docker/docker-compose.staging.yml`: Staging 7-service full stack with resource limits for Oracle Cloud Ampere A1.
  * `docker/docker-compose.yml` / `docker-compose.dev.yml`: Local full development environment.
* **Orchestration:** Kubernetes manifests (`kubernetes/`) and Helm charts (`helm/ecommerce`).

---

## 4. Repository & Directory Structure

```
Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes/
├── .github/                       # CI/CD workflows, GitHub Actions
├── backups/                       # Physical database backups and verification manifests
│   └── database/
│       └── backup_20261015_173115/ # Verified Stage 8B dump files & manifest.json
├── docker/                        # Container compose specifications
│   ├── docker-compose.auth.yml    # Minimal authentication stack (Postgres, Redis, Auth, Gateway)
│   ├── docker-compose.staging.yml # Full staging stack (OCI Ampere A1 profile)
│   ├── docker-compose.dev.yml     # Local developer compose stack
│   ├── docker-compose.yml         # Base stack specification
│   └── init-dbs.sql               # Logical database initialization script
├── docs/                          # Architectural decision records, diagrams, and specs
│   ├── architecture/              # System architecture, networking, and deployment docs
│   ├── database/                  # Schema design, indexing, and pre-import checklists
│   └── contracts/                 # API contracts, circuit breaker policies, SLAs
├── helm/                          # Helm charts for Kubernetes deployments
│   └── ecommerce/                 # Microservices chart templates and values
├── kubernetes/                    # Raw Kubernetes manifests (Deployments, Services, ConfigMaps)
├── operations/                    # Runbooks, checklists, and SRE procedures
│   └── runbooks/
│       ├── staging-credentials-and-environment-guide.md # Credential rotation & env guide
│       └── catalog-migration-recovery-runbook.md        # V5 rollback and recovery procedures
├── scripts/                       # Operational PowerShell and Bash utility scripts
│   └── generate-staging-secrets.ps1 # Cryptographic CSPRNG staging secret generator
├── services/                      # Application source code
│   ├── api-gateway/               # Spring Cloud Gateway reactive reverse proxy
│   ├── auth-service/              # Spring Security / JWT authentication microservice
│   ├── cart-service/              # Shopping cart microservice
│   ├── frontend/                  # React 19 / TypeScript / Vite luxury web client
│   │   ├── public/_redirects      # Cloudflare Pages SPA rewrite configuration
│   │   ├── src/
│   │   │   ├── components/        # Reusable UI components (ProductCard, Navbar, Footer)
│   │   │   ├── config/            # API gateway URL validator & Axios configuration
│   │   │   ├── data/              # BRANDS_DATA (28 Indian & international luxury houses)
│   │   │   ├── pages/             # Route pages (HomePage, ProductListPage, BrandDetailPage)
│   │   │   ├── routes/            # AppRoutes.tsx (lazy routing, checkout guards)
│   │   │   └── store/             # Redux store (in-memory authSlice, cartSlice)
│   │   ├── tests/                 # Vitest test suites (214 tests passing)
│   │   └── vite.config.ts         # Vite build configuration & fail-closed URL validator
│   ├── notification-service/      # Email notification microservice
│   ├── order-service/             # Order management microservice
│   ├── payment-service/           # Payment processing & refund microservice
│   └── product-service/           # Catalog & clothing microservice
│       └── proposed-migrations/   # Unexecuted V5 catalog migration
├── shared/                        # Shared Java libraries
│   └── common-library/            # Common DTOs, ErrorResponse, and GlobalExceptionHandler
├── BUILD.md                       # Master project documentation (THIS DOCUMENT)
├── CHANGELOG.md                   # Chronological version changelog
├── PROJECT_RULES.md               # GSD methodology rules and verification protocols
├── PROJECT_STATUS.md              # High-level platform status and remediation summary
└── README.md                      # Repository introduction and architectural overview
```

---

## 5. Frontend Features & Status

### 5.1 Storefront & Clothing Discovery
* **Curated Homepage (`HomePage.tsx`):**
  * Atelier editorial aesthetic featuring curated capsules: *Haute Outerwear & Trench*, *Evening Gowns & Draped Silks*, *Heritage Sherwanis & Bandhgalas*, *Artisanal Handloom Sarees*, and *Sartorial Suiting*.
  * Clean hero presentation with authenticity guarantees and atelier craftsmanship dossiers.
  * Repeated blue brand ticker link row was removed in Stage 13A; brand navigation preserved via top navigation and dedicated Brand Directory.
* **Brand Directory (`BrandDirectoryPage.tsx` & `BrandDetailPage.tsx`):**
  * Curated directory of 28 Indian and international luxury houses (`services/frontend/src/data/brandsData.ts`).
  * Houses include Sabyasachi, Tarun Tahiliani, Manish Malhotra, Raw Mango, Anamika Khanna, Ritu Kumar, Anita Dongre, Rohit Bal, Shantnu & Nikhil, Gaurav Gupta, Abu Jani Sandeep Khosla, Etro, Burberry, Ralph Lauren, Tom Ford, and others.
  * Strict domain-boundary matching (`verifiedDomain` / `approvedDomains`). Disclaimer explicitly states editorial curation does not constitute cryptographic ownership or formal commercial contracts.
* **Product Catalog & Details (`ProductListPage.tsx` & `ProductDetailPage.tsx`):**
  * Displays high-resolution imagery, designer attribution, composition, fabric care guidelines, and referral purchase actions.
  * Pricing: Standardized in INR (₹). Fails closed to "Price on Inquiry" if missing or zero.
* **Wishlist & Comparison:** Local state management for saved curation items.

### 5.2 Authentication & Security Controls
* **Session Lifecycle (`tokenStorage.ts` & `authSlice.ts`):**
  * Access tokens stored strictly in Redux in-memory state; **never stored in `localStorage` or `sessionStorage`**.
  * Refresh token managed via HTTP-only cookie. Automatic silent refresh on 401 via Axios interceptors.
* **State-Changing CSRF Protection:**
  * Backend issues `XSRF-TOKEN` cookie; Axios reads this cookie and injects `X-XSRF-TOKEN` header on mutation requests (`POST`, `PUT`, `DELETE`).
* **Registration & Login Validation (Stage 13A Fixes):**
  * Form submissions sanitize emails (`.trim().toLowerCase()`).
  * Name validation enforced (`@Size(min=2, max=100)`).
  * Error handling checks both `detail` and `message` properties in API responses.
  * Rejects HTML SPA fallback responses (`<!doctype html>`) from misconfigured gateways or edge proxies.

### 5.3 Cloudflare Pages Deployment Configuration
* **Hosting Target:** Cloudflare Pages (free-tier edge network).
* **Build Root Directory:** `services/frontend`
* **Build Command:** `npm run build` (runs `tsc -b && vite build`)
* **Output Directory:** `dist`
* **SPA Routing:** Configured via `services/frontend/public/_redirects` (`/*  /index.html  200`).
* **Environment Variables:**
  * `VITE_API_GATEWAY_URL`: Must be `/api` (for reverse-proxy setups) or a valid HTTPS URL (e.g., `https://api.lumiere.com`). Build strictly rejects localhost or empty strings in production mode.
  * `VITE_ENABLE_INTERNAL_CHECKOUT`: Set to `false` to redirect `/cart`, `/checkout`, and `/orders/success` to `/collection`.

---

## 6. Backend Services & Integration Status

| Service | Directory | Port | Relational DB | Active Migrations | Health Check Endpoint | Test Suite Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`api-gateway`** | `services/api-gateway` | 8080 (8088 host) | None | None | `/actuator/health` | 21/21 Unit & WebFlux tests pass |
| **`auth-service`** | `services/auth-service` | 8080 (8081 dev) | `auth_db` | V1–V4 | `/actuator/health` | 45/45 Unit & Integration tests pass |
| **`product-service`** | `services/product-service` | 8082 | `product_db` | V1–V4 (V5 unexecuted) | `/actuator/health` | Unit tests pass; V5 unexecuted |
| **`cart-service`** | `services/cart-service` | 8083 | `cart_db` | None (JPA ddl-auto) | `/actuator/health` | Security tests pass; integration unverified |
| **`order-service`** | `services/order-service` | 8084 | `order_db` | V1 | `/actuator/health` | Security tests pass; integration unverified |
| **`payment-service`**| `services/payment-service` | 8085 | `payment_db` | V1 | `/actuator/health` | Security tests pass; integration unverified |
| **`notification-service`**| `services/notification-service` | 8086 | `notification_db` | None | `/actuator/health` | Integration unverified |

### 6.1 Authentication Stack vs. Full Stack
To maintain low resource overhead and focus on stable authentication, the platform currently operates in a **minimal authentication stack** mode:
* **Running & Verified:** `auth-stack-postgres`, `auth-stack-redis`, `auth-stack-auth-service`.
* **Configured & Awaiting Start:** `auth-stack-api-gateway` (mapped to host `127.0.0.1:8088:8080`).
* **Idle / Background:** `product-service`, `cart-service`, `order-service`, `payment-service`, `notification-service`.

---

## 7. Data, Migrations, and Backup/Restore Status

### 7.1 Logical Databases & Flyway History
All relational schemas reside in PostgreSQL 16:
* **`auth_db`:**
  * `V1__init_auth_schema.sql`: Users, roles, and refresh tokens tables.
  * `V2__update_admin_password.sql`: Historical migration.
  * `V3__create_user_addresses.sql`: Customer address book schema.
  * `V4__neutralize_default_admin.sql`: Neutralized hardcoded default admin account (account disabled, password scrambled).
* **`product_db`:**
  * `V1__init_product_schema.sql`: Base products, categories, and inventory.
  * `V3__add_brand_to_product.sql`: Brand attribution column.
  * `V4__add_categories_and_attributes.sql`: Apparel category hierarchy and luxury clothing attributes.
* **`order_db` & `payment_db`:** Base schema migrations applied.

### 7.2 Proposed Migration V5 (`V5__seed_lumiere_clothing_catalog.sql`)
* **Location:** `services/product-service/proposed-migrations/V5__seed_lumiere_clothing_catalog.sql`
* **Status:** **PROPOSED / STRICTLY UNEXECUTED.**
* **Scope:** 14 canonical luxury clothing products (Sabyasachi, Tarun Tahiliani, Manish Malhotra, Raw Mango, Anamika Khanna, Ritu Kumar) with `PRICE_UPON_INQUIRY` and official referral URLs.
* **Execution Gates:** Must satisfy all gates in `docs/database/pre-import-verification-checklist.md` and obtain explicit user authorization before execution.

### 7.3 Verified Physical Database Backups (Stage 8B)
* **Archive Location:** `backups/database/backup_20261015_173115/`
* **Format:** PostgreSQL custom archive format (`pg_dump -Fc`).
* **Verified Dump Files & Cryptographic Hashes:**
  * `auth_db_20261015_173115.dump` (11,317 bytes)  
    SHA-256: `B49B3B9BC8C9BFD462A83D0BC7C49696242EADCD745795EE0965F5DF0472D3E1`
  * `product_db_20261015_173115.dump` (9,412 bytes)  
    SHA-256: `6CE89B8F827D8E44D5B5464140EB3AA54A3D035014D5B36B2F03B3DB9303015E`
  * `order_db_20261015_173115.dump` (11,828 bytes)
  * `payment_db_20261015_173115.dump` (5,334 bytes)
* **Restore Verification:** Documented in `backup_manifest.json`. All 4 databases were restored to isolated sandbox databases (`stage8b_verify_*`), row counts verified for exact match, constraints validated, and sandboxes dropped cleanly.

---

## 8. Infrastructure & Deployment Architecture

### 8.1 Local Minimal Authentication Stack (`docker-compose.auth.yml`)
* Designed for low memory footprint (~600–800 MB RAM) to run on local developer machines or small cloud instances.
* Services: `postgres:16-alpine`, `redis:7-alpine`, `ecommerce/auth-service:latest`, `ecommerce/api-gateway:latest`.
* Networking: Private Docker bridge `auth-internal-network`.
* Host Binding: Gateway bound to `127.0.0.1:8088`. Zero public or external port exposure.
* Persistence: Named volumes `auth-postgres-data` and `auth-redis-data`.

### 8.2 Staging Architecture (`docker-compose.staging.yml`)
* Target: Oracle Cloud Infrastructure (OCI) Always Free Ampere A1 (ARM64, 4 OCPU, 24 GB RAM).
* Budget: ₹0 First policy.
* Orchestrates all 7 microservices, PostgreSQL, Redis, RabbitMQ, and Mailpit.
* API Gateway binds to `127.0.0.1:8080`, designed to sit behind a secure Cloudflare Tunnel (cloudflared).

### 8.3 Production Architecture (Planned)
* Target: AWS EKS or Kubernetes cluster provisioned via Terraform (`terraform/`).
* Continuous Delivery: Argo CD GitOps (`argocd/`) using App-of-Apps pattern.
* Ingress: AWS ALB / NGINX Ingress Controller with TLS certificate termination.

---

## 9. Environment Configuration Specification

> [!IMPORTANT]
> **Zero Credential Exposure Rule:** Only environment variable **names** and their functional descriptions are recorded. Secret values, keys, and passwords must never appear in this document.

| Variable Name | Applied To | Functional Purpose |
| :--- | :--- | :--- |
| `DB_USER` | Postgres, Auth Service, Microservices | Relational database application username. |
| `DB_PASSWORD` | Postgres, Auth Service, Microservices | High-entropy relational database password. |
| `DB_NAME` | Postgres, Microservices | Primary database name (e.g., `auth_db`). |
| `REDIS_PASSWORD` | Redis, Auth Service, Gateway | Authentication token for Redis `requirepass`. |
| `REDISCLI_AUTH` | Redis container | Password variable for secret-safe health checks. |
| `JWT_SECRET` | Auth Service, Gateway, Microservices | 256-bit+ HMAC-SHA256 signing secret for access tokens. |
| `ADMIN_EMAIL` | Auth Service | Email address for optional initial administrator bootstrap. |
| `ADMIN_PASSWORD` | Auth Service | High-entropy password for initial administrator bootstrap. |
| `CORS_ALLOWED_ORIGINS` | Gateway, Auth Service | Comma-separated list of approved frontend HTTPS origins. |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Gateway | Wildcard pattern for Cloudflare Pages preview builds. |
| `COOKIE_SECURE` | Auth Service | Enforces `Secure` flag on refresh & CSRF cookies (`true` in staging/prod). |
| `COOKIE_SAME_SITE` | Auth Service | Cookie `SameSite` policy (`Strict` for same-domain, `None` for cross-site). |
| `COOKIE_DOMAIN` | Auth Service | Cookie domain restriction attribute (empty for current origin). |
| `COOKIE_PATH` | Auth Service | Cookie path scope (restricted to `/api/v1/auth`). |
| `ENABLE_INTERNAL_CHECKOUT` | Gateway, Cart, Order, Payment | Feature toggle enforcing editorial referral model (`false`). |
| `VITE_ENABLE_INTERNAL_CHECKOUT` | Frontend | Client-side route toggle redirecting cart/checkout to collection (`false`). |
| `VITE_API_GATEWAY_URL` | Frontend | Backend API endpoint URL (`/api` or full HTTPS URL). |
| `GATEWAY_BIND_IP` | API Gateway (Docker) | Host interface IP binding (strictly `127.0.0.1`). |
| `GATEWAY_PORT` | API Gateway (Docker) | Host loopback port mapping (`8088`). |
| `SPRING_PROFILES_ACTIVE` | All Java Microservices | Spring profile (enforces `prod` fail-closed security). |
| `JAVA_OPTS` | All Java Microservices | JVM heap tuning and garbage collection flags. |

---

## 10. Security Posture & Known Risks

### 10.1 Staging Credential Remediation (Stage 13E)
* **Incident:** The contents of a local `.env.staging` file were previously disclosed in a chat transcript.
* **Remediation Policy:** All credentials in that file are treated as **permanently compromised**.
* **Storage Relocation:** Active secrets must be relocated to `C:\Users\Asus\.lumiere\.env.staging`, outside the repository and outside the OneDrive synchronization directory.
* **Windows NTFS ACLs:** Secured via `icacls` to restrict access strictly to the local Windows user profile (`$env:USERNAME`).
* **OneDrive Cloud Retention Risk:** Deleting the local file from disk does **not** purge cloud versions. The file remains in the OneDrive Cloud Recycle Bin for 30 days and in OneDrive Version History. Full remediation requires rotating all credentials so that old values in cloud storage are entirely invalid, followed by manual user purging of the OneDrive Web Recycle Bin.

### 10.2 Secret-Safe Execution Mechanics
* **PowerShell History & Arguments:** Passwords must never be passed via CLI arguments (`redis-cli -a`, `psql -c`), string interpolation, or PowerShell pipelines. Operations use .NET `System.Diagnostics.Process` with UTF-8 byte streams piped to stdin, immediate memory array clearing, and error sanitization.
* **PostgreSQL Validation:** Tested via ephemeral container `/tmp/.pgpass` file with strict `0600` permissions and guaranteed cleanup in a `finally` block.
* **Redis Health Check:** Uses `REDISCLI_AUTH` environment variable to eliminate `argv` process-table leakage.

### 10.3 Preserved Invariants During Credential Rotation
* `JWT_SECRET` is preserved verbatim to prevent cross-service token invalidation.
* PostgreSQL and Redis named volumes (`auth-postgres-data`, `auth-redis-data`) are preserved without recreation or reset.
* Existing database administrator account is preserved (`AdminBootstrapService` skips initialization if admin email exists).
* Windows host PID 8160 (`java.exe` on port 8080) and unrelated containers remain untouched.

---

## 11. Completed Stages & Change History

### Chronological Milestones
* **Initial Development (Stages 1–7):**
  * Scaffolded Spring Boot microservices and React frontend.
  * Established PostgreSQL database schemas, Redis caching, RabbitMQ event topics, Dockerfiles, and Helm charts.
* **Stage 8 (Catalog & Discovery Foundation):**
  * Transitioned platform identity to luxury clothing discovery and brand referrals.
  * Curated `BRANDS_DATA` registry of 28 Indian and international luxury houses.
  * Stage 8B: Executed verified database backup and sandbox restoration test for all 4 databases (`backup_20261015_173115`).
  * Stage 8F: Authored catalog recovery runbook and pre-import verification checklist.
* **Stage 9 (Remediation & Security Hardening — Commit `950f292`):**
  * **Fix 1:** Default admin neutralization migration `V4__neutralize_default_admin.sql` and `AdminBootstrapService`.
  * **Fix 2:** Configurable fail-closed Gateway CORS (`CorsConfig.java`).
  * **Fix 3:** Internal checkout guard filters in Gateway, Cart, Order, and Payment services (`ENABLE_INTERNAL_CHECKOUT`).
  * **Fix 4:** In-memory session management, HTTP-only refresh cookies, SHA-256 token hashing, family reuse revocation, and CSRF protection.
  * **Fix 5:** Repository cleanup (removed `k3d.exe`, stale dumps, hardened `.gitignore`, created `generate-staging-secrets.ps1`).
* **Stage 10–12 (Edge Deployment Preparation — Commit `7e90936`):**
  * Configured Cloudflare Pages frontend deployment with `public/_redirects` SPA rewrite.
  * Created `apiConfigValidator.ts` and Vite production build validator enforcing HTTPS or `/api`.
* **Stage 13A (Live Auth Diagnosis & Homepage Cleanup):**
  * Removed repeated blue brand ticker links from `HomePage.tsx`.
  * Fixed authentication defect: normalized email handling (`.trim().toLowerCase()`).
  * Fixed Hibernate bug: converted immutable `Set.of(...)` to mutable `HashSet` for user roles.
  * Added `@Size(min=2, max=100)` name constraints to `RegisterRequest.java`.
  * Added account active check (`!user.isActive()`).
  * Frontend: rejected HTML SPA fallbacks in `AuthService.ts`; aligned error toast to inspect `detail || message`.
* **Stage 13B–13D (Minimal Auth Stack Setup & Port Remediation):**
  * Created `docker/docker-compose.auth.yml` containing Postgres, Redis, Auth Service, and API Gateway.
  * Successfully started `auth-stack-postgres`, `auth-stack-redis`, and `auth-stack-auth-service` (all healthy).
  * Identified host port 8080 collision with existing PID 8160; remapped gateway host port to `127.0.0.1:8088:8080`.
* **Stage 14A (Read-Only Security Preflight & hba Discovery):**
  * Identified PostgreSQL `pg_hba.conf` rule `host all all 127.0.0.1/32 trust` which invalidates loopback TCP password tests; established requirement to target network bridge address (`172.25.0.3`) for SCRAM enforcement.
  * Verified Compose project identity is `docker` and named volumes are `docker_auth-postgres-data` and `docker_auth-redis-data`.
  * Verified Actuator `/actuator/health` component granularity (`db: UP`, `redis: UP`).
* **Stage 14B-1 (Protected External Staging Secrets Preparation):**
  * Created `C:\Users\Asus\.lumiere\.env.staging` outside repository and OneDrive with restricted NTFS ACLs.
  * Generated new 48-char CSPRNG alphanumeric secrets for `DB_PASSWORD`, `REDIS_PASSWORD`, `RABBITMQ_PASSWORD`, `ADMIN_PASSWORD`.
  * Preserved `JWT_SECRET` verbatim; preserved loopback bindings `GATEWAY_PORT=8088` and `GATEWAY_BIND_IP=127.0.0.1`.
  * Verified 30/30 environment variables; validated against Compose schemas with `config -q`.
* **Stage 14B-2 (PostgreSQL Live Rotation & Auth-Service Continuity):**
  * Prepared temporary protected `C:\Users\Asus\.lumiere\.env.transitional` (new `DB_PASSWORD` + active `REDIS_PASSWORD`).
  * Rotated PostgreSQL live password for `lumiere_staging_user` via container Unix socket stdin.
  * Proved network TCP SCRAM-SHA-256 password enforcement against container bridge IP (`172.25.0.3`): invalid password fatally rejected; new replacement password authenticated and succeeded (`SELECT 1`).
* **Stage 14B-3A (Redis Secret-Handling Hardening Complete):**
  * Created file-backed secret `C:\Users\Asus\.lumiere\redis_password.txt` with restricted NTFS ACLs (`OMKAR\Asus`, `SYSTEM`, `Administrators`).
  * Updated `docker/docker-compose.auth.yml` and `docker/docker-compose.staging.yml`:
    - Replaced `--requirepass` CLI argument with an ephemeral in-container config generator (`echo "requirepass $(cat /run/secrets/redis_password)" > /tmp/redis.conf && exec redis-server /tmp/redis.conf`).
    - Replaced `redis-cli -a $$REDIS_PASSWORD` with `REDISCLI_AUTH="$$(cat /run/secrets/redis_password)" redis-cli ping`.
    - Removed `REDIS_PASSWORD` from container environment metadata.
    - Mounted file-backed secret `secrets: - redis_password` (`target: /run/secrets/redis_password`).
  * Validated both Compose files cleanly with `docker compose config -q` (zero errors).
  * Confirmed no containers were restarted/recreated and zero credentials were rotated in this configuration stage.
* **Stage 14B-3B (Redis Credential Rotation & Auth-Service Continuity Complete):**
  * Streamed `AUTH` and `CONFIG SET requirepass` via in-memory stdin pipe to `auth-stack-redis` with zero password exposure in argv or process table.
  * Verified immediate rejection of old credential (`WRONGPASS`) and acceptance of new credential (`OK | PONG`).
  * Recreated `auth-stack-redis` using `docker compose -p docker --env-file "C:\Users\Asus\.lumiere\.env.staging" -f docker/docker-compose.auth.yml up -d --force-recreate redis`.
  * Verified `docker_auth-redis-data` volume preserved, file-backed secret mounted read-only (`/run/secrets/redis_password`), `REDIS_PASSWORD` absent from container environment, and zero passwords in `Cmd` or `Healthcheck`.
  * Recreated `auth-stack-auth-service` using `C:\Users\Asus\.lumiere\.env.staging` (`-p docker`).
  * Verified Actuator `/actuator/health` reports `status: UP` with `db: UP` and `redis: UP` (`version: 7.4.11`).
  * Confirmed PostgreSQL remains healthy with row counts preserved (`users`: 1, `user_roles`: 1, `user_addresses`: 0, `flyway_schema_history`: 3).
  * Confirmed all 11 preservation gates passed.
* **Stage 14B-4 (API Gateway Loopback Startup & Routing Verification Complete):**
  * Started `auth-stack-api-gateway` using `docker compose -p docker --env-file "C:\Users\Asus\.lumiere\.env.staging" -f docker/docker-compose.auth.yml up -d --no-deps api-gateway`.
  * Verified host port binding is strictly loopback: `127.0.0.1:8088->8080/tcp`. Confirmed zero listeners on `0.0.0.0` or `::` for port 8088.
  * Empirically proved external isolation: direct HTTP requests to host LAN IP (`http://192.168.31.205:8088`) timed out / were refused.
  * Verified PID 8160 remained active and undisturbed on host port 8080.
  * Verified gateway routing:
    - Gateway health `GET /actuator/health`: HTTP 200 OK (`status: UP`).
    - Routed validation `POST /api/v1/auth/login` (`{}`): HTTP 400 Bad Request with RFC-7807 Bean Validation errors from `auth-service`.
    - Protected endpoint `GET /api/v1/auth/me`: HTTP 403 Forbidden (Authentication enforcement active).
    - Invalid route `GET /api/v1/nonexistent-route-404`: HTTP 404 Not Found.
  * Confirmed PostgreSQL, Redis, and auth-service remained healthy and untouched.
* **Stage 14E (Secure API Gateway Image Alignment Complete):**
  * Rebuilt `ecommerce/api-gateway:latest` using `C:\Users\Asus\.lumiere\.env.staging` with `--no-deps`.
  * Verified packaged classes: `CorsConfig.class` and `InternalCheckoutGuardFilter.class` compiled and active.
  * Verified CORS dynamic origin policy and internal checkout guard mutation blocking (`ENABLE_INTERNAL_CHECKOUT=false`).
* **Stage 14D (Safe Removal of Compromised Root Environment File Complete):**
  * Deleted obsolete repository-root `.env.staging` after proving 0 active runtime dependencies, zero commits in Git history, and pristine external secret permissions.
* **Stage 14G (Controlled JWT and RabbitMQ Credential Rotation Complete):**
  * Rotated `JWT_SECRET` to a 512-bit CSPRNG key (128 hex chars) in `C:\Users\Asus\.lumiere\.env.staging`. Recreated `auth-service` and `api-gateway`. Proved old, tampered, and foreign tokens are rejected (403 Forbidden).
  * Provisioned application user `lumiere_staging_rabbit` and migrated dependent services.
  * Decommissioned default `guest` account from RabbitMQ. Verified 0 connections on `guest`.
  * Preserved queue messages: 8 in `notification.dlq` and 1 in `notification.payment.queue`.
* **Stage 14H (Downstream Network Repair and Security Verification Complete):**
  * **Root Cause:**
    - Network segregation: `auth-stack-postgres` and `auth-stack-redis` resided exclusively on `docker_auth-internal-network`. Downstream application services (`order-service`, `product-service`, `payment-service`, `cart-service`) resided on `docker_infrastructure-network` and `docker_backend-network`, causing `UnknownHostException: postgres` for `DB_HOST=postgres` and connection failures to `REDIS_HOST=redis`.
    - Database user fallback: Downstream services in `docker-compose.yml` defaulted to `DB_USER=ecommerce_user` instead of `lumiere_staging_user`.
    - Redis authentication: Downstream caching in `product-service` and `cart-service` lacked `REDIS_PASSWORD=${REDIS_PASSWORD:-}` in `docker-compose.yml`.
    - Gateway downstream routes: `auth-stack-api-gateway` in `docker-compose.auth.yml` was not connected to `docker_backend-network` and lacked downstream URL routing definitions (`PRODUCT_SERVICE_URL`, `CART_SERVICE_URL`, `ORDER_SERVICE_URL`, `PAYMENT_SERVICE_URL`).
  * **Minimal Network & Configuration Repair (Zero Data Store Restarts):**
    - Connected running `auth-stack-postgres` to `docker_infrastructure-network` with alias `postgres` (0 restarts).
    - Connected running `auth-stack-redis` to `docker_infrastructure-network` with alias `redis` (0 restarts).
    - Connected running `auth-stack-api-gateway` to `docker_backend-network` with alias `api-gateway`.
    - Updated `docker-compose.yml`: Added `REDIS_PASSWORD=${REDIS_PASSWORD:-}` to `product-service` and `cart-service`.
    - Updated `docker-compose.auth.yml`: Added external `docker_backend-network` and mapped downstream service URLs.
    - Recreated only downstream application services (`order-service`, `product-service`, `payment-service`, `cart-service`) with `--no-deps` using `C:\Users\Asus\.lumiere\.env.staging`.
  * **Empirical Database Migrations Executed:**
    - `product_db`: 3 Flyway migrations applied (`V1__init_product_schema.sql`, `V3__add_brand_to_product.sql`, `V4__add_categories_and_attributes.sql`). Schema at Version 4.
    - `order_db`: 3 Flyway migrations applied (`V1__init_order_schema.sql`, `V2__update_order_address.sql`, `V3__create_order_status_history.sql`). Schema at Version 3.
    - `payment_db`: 1 Flyway migration applied (`V1__init_payment_schema.sql`). Schema at Version 1.
    - `auth_db`: 4 Flyway migrations intact (Version 4).
  * **Downstream JWT Verification (100% Passed):**
    - `product-service`: Public `GET /api/v1/products` returned 200 OK; Unauthenticated `POST /api/v1/products` returned 401 Unauthorized; Tampered token returned 401 Unauthorized.
    - `order-service`: Unauthenticated `GET /api/v1/orders` returned 401 Unauthorized; Tampered token returned 401 Unauthorized; Valid newly signed JWT token returned 200 OK.
    - `cart-service`: Unauthenticated `GET /api/v1/cart` returned 401 Unauthorized; Tampered token returned 401 Unauthorized; Valid newly signed JWT token returned 200 OK.
    - `payment-service`: Unauthenticated `GET /api/v1/payments/orders/{uuid}` returned 401 Unauthorized; Tampered token returned 401 Unauthorized; Valid newly signed JWT token passed authentication to controller, returning 404 Not Found (safe, zero record insertion verified).
  * **RabbitMQ Least-Privilege Assessment:**
    - 5 services (`cart-service`, `order-service`, `payment-service`, `product-service`, `notification-service`) connected via `lumiere_staging_rabbit`. Exactly 0 connections on `guest`.
    - 3 active consumers verified on `payment.order.queue`, `notification.order.queue`, and `order.payment.queue`.
    - Exact queue preservation verified: 8 messages in `notification.dlq` and 1 message in `notification.payment.queue`.
    - Mapped least-privilege per-service permission regexes for future production deployment.
  * **Preservation & Invariants:**
    - PostgreSQL (`auth-stack-postgres`) and Redis (`auth-stack-redis`) had 0 restarts; persistent volumes intact.
    - Gateway strictly bound to `127.0.0.1:8088`.
    - Host PID 8160 (`java`) intact and untouched.
    - Container logs verified clean of secrets, passwords, and tokens.
* **Stage 14I (RabbitMQ Per-Service Least-Privilege Hardening Complete):**
  * **Objective:** Replace the shared `lumiere_staging_rabbit` account with separate, least-privilege credentials for `order-service`, `payment-service`, `notification-service`, `cart-service`, and `product-service`.
  * **Topology & Permission Discovery:**
    - `product-service`: Producer only. Configures and writes to `product.exchange`. Read disabled (`^$`).
    - `cart-service`: Producer only. Configures and writes to `cart.exchange`. Read disabled (`^$`).
    - `order-service`: Publishes to `order.exchange`; consumes `order.payment.queue`; binds `order.payment.queue` to `payment.exchange`. In AMQP 0-9-1, `queue.bind` requires `write` permission on the queue and `read` on the exchange. Permissions: configure `^(order\.exchange|payment\.exchange|order\.payment\.queue)$`, write `^(order\.exchange|order\.payment\.queue)$`, read `^(order\.payment\.queue|payment\.exchange)$`.
    - `payment-service`: Publishes to `payment.exchange`; consumes `payment.order.queue`; binds `payment.order.queue` to `order.exchange`. Permissions: configure `^(payment\.exchange|order\.exchange|payment\.order\.queue)$`, write `^(payment\.exchange|payment\.order\.queue)$`, read `^(payment\.order\.queue|order\.exchange)$`.
    - `notification-service`: Consumes `notification.order.queue`; binds queues to `auth.exchange`, `order.exchange`, `payment.exchange`, and `notification.dlx`. Permissions: configure `^(auth\.exchange|order\.exchange|payment\.exchange|notification\.dlx|notification\..*)$`, write `^(notification\..*)$`, read `^(auth\.exchange|order\.exchange|payment\.exchange|notification\..*)$`.
  * **Execution Mechanics:**
    - Generated 5 unique 48-char CSPRNG secrets via Python `secrets.choice(string.ascii_letters + string.digits)`.
    - Provisioned non-admin accounts (`tags: []`) via stdin stream to RabbitMQ without CLI argument exposure.
    - Stored credentials in protected external environment file `C:\Users\Asus\.lumiere\.env.staging` with restricted NTFS ACLs.
    - Updated `docker/docker-compose.yml` and `docker/docker-compose.staging.yml` to support per-service credential overrides with fallback to shared variables.
    - Migrated services sequentially with `--no-deps`.
  * **Empirical Verification:**
    - 5/5 active AMQP connections authenticated under service-specific accounts.
    - 3/3 AMQP consumers registered and active on `payment.order.queue`, `notification.order.queue`, and `order.payment.queue`.
    - Preserved queues and messages: exactly 8 messages in `notification.dlq` and 1 in `notification.payment.queue`.
    - Verified permission matrix: all allowed actions succeed; cross-service publish and consume attempts are strictly denied (`nomatch`).
    - Shared `lumiere_staging_rabbit` account decommissioned after confirming 0 dependencies.
    - 0 restarts on PostgreSQL and Redis; host PID 8160 intact; loopback binding strictly `127.0.0.1:8088`.
* **Stage 14J (Notification SMTP Health Repair Complete):**
  * **Root Cause:**
    - `notification-service` reported `unhealthy` because Spring Boot Actuator's `MailHealthIndicator` evaluates SMTP socket connectivity to `${spring.mail.host}:${spring.mail.port}` (`mailhog:1025`).
    - The existing `mailhog` container was in `Exited (255)` state due to lacking `restart: always` in `docker-compose.yml`.
    - In Docker embedded DNS, stopped containers do not resolve, causing `java.net.UnknownHostException: mailhog`, which pulled `/actuator/health` to `status: DOWN` (HTTP 503).
  * **Minimal Repair Applied:**
    - Updated `mailhog` in `docker/docker-compose.yml`: added `restart: always`, removed public host SMTP port `1025:1025`, restricted Web UI strictly to loopback `127.0.0.1:8025:8025`, and kept on `infrastructure-network`.
    - Updated `notification-service` in `docker/docker-compose.yml`: added `mailhog: condition: service_started` to `depends_on`.
    - Recreated `mailhog` via `docker compose up -d mailhog`.
    - `mailhog` hostname immediately resolved from `notification-service` (`172.23.0.10`), and port 1025 opened.
    - `MailHealthIndicator` transitioned to `UP`, aggregate `/actuator/health` reached `UP` (HTTP 200), and Docker marked `notification-service` `healthy` with 0 restarts.
  * **Empirical Verification:**
    - Controlled local test message dispatched via internal SMTP handshake without external routing; verified present in MailHog message store via loopback API (`http://127.0.0.1:8025/api/v2/messages`).
    - RabbitMQ dedicated account `lumiere_notification_service` verified connected with active consumer on `notification.order.queue`.
    - Preserved queues and messages: exactly 8 messages in `notification.dlq` and 1 in `notification.payment.queue`.
    - 100% of platform services now report `Up (healthy)` across the entire stack.
    - Zero data store restarts (`auth-stack-postgres`, `auth-stack-redis`); host PID 8160 intact; gateway loopback strictly `127.0.0.1:8088`.
* **Stage 15A (Cloudflare Pages Deployment & Frontend Experience Audit Complete):**
  * **Objective:** Verify live Cloudflare Pages deployment, identify edge deployed commit, audit frontend build and test suites, analyze responsive behavior, and evaluate design direction against `lumiere-prototype.html`.
  * **Repository & Build Audit:**
    - Branch: `main` (synchronized with `origin/main` at `950f292`).
    - Last frontend commit: `7e90936` (commit `950f292` modified backend/docs without changing frontend source).
    - Uncommitted working directory modifications: Stage 13A changes in `HomePage.tsx` (ticker removal), `LoginPage.tsx`, `RegisterPage.tsx`, `AuthService.ts`, and untracked `stage13aAuthAndHomepageCleanup.test.tsx`.
    - Test Suite: 17/17 test files passed, 214/214 Vitest unit/integration tests passed (100% pass rate in 107.08s).
    - Production Build: Clean Vite build completes in 4.31s (`$env:VITE_API_GATEWAY_URL="/api"; tsc -b && vite build`) producing `dist/assets/index-0A4qfaq8.js` and `index-DC1kQYhY.css`.
  * **Cloudflare Pages Verification (`production-grade-e-commerce-microservices-platform-on-kube.pages.dev`):**
    - Live URL responds with HTTP 200 OK via Cloudflare edge (CF-RAY: BOM datacenter).
    - Cloudflare API tokens, `CLOUDFLARE_ACCOUNT_ID`, and `wrangler` CLI authentication are not configured locally. Cloudflare Pages edge responses do not expose deployment SHA headers.
    - Empirical bundle analysis of live `/assets/index-Cj3KegE4.js`:
      * Live bundle loads `HomePage-BWK-bMjQ.js`, which contains the animated horizontal marquee brand ticker (`marquee-track`, `marqueeBrands`).
      * Shared vendor chunk hashes (`rolldown-runtime-QTnfLwEv.js`, `Button-wlVcuJqK.js`, `tokenStorage-DywDF2dj.js`, `domainVerifier-C3eMxfuR.js`, `brandsData-DSF8Rx8q.js`, `index-DC1kQYhY.css`) match commit `7e90936` / `950f292`.
      * Concluded with certainty: The deployed build at the edge is commit `950f292` (or `7e90936`), preceding the uncommitted working directory changes of Stage 13A.
  * **Frontend Experience & Integrity Findings:**
    - Discovery/Referral Integrity: Customer checkout is disabled (`ENABLE_INTERNAL_CHECKOUT=false`), routing `/cart`, `/checkout`, and `/orders/success` to `/collection`.
    - Pricing Standard: Customer prices use INR (₹) or fail closed to "Price on Inquiry" paired with "Atelier Consultation" and "View Dossier" actions.
    - Identified Defect: In `ProductDetailPage.tsx` and `ProductCard.tsx`, products from the database lacking referral metadata fall back to `INTERNAL_PURCHASE` and render an "Acquire Piece" button with quantity counter and bag icon, visually conflicting with the discovery/referral model despite backend mutation blocking.
    - Responsive Layout: Tested via browser automation (1280x800 desktop and 375x667 mobile). Sticky header, navigation drawer, category tabs, and brand directory collapse cleanly.
  * **Design Reference & Prototype Alignment:**
    - Located reference prototype: `lumiere-prototype.html` in `Downloads/` (backed up to conversation artifacts).
    - Reference aesthetic features: `Fraunces` variable optical serif headlines, `Instrument Sans` body, warm linen cream (`#fbf6ec`), midnight ink (`#1a1420`), electric cobalt (`#3a3ce0`), lime (`#d8f25a`), and midnight aubergine (`#2b1238`) evening themes, horizontal drag-to-scroll tracks, and color swatch switchers.
    - Prioritized redesign plan formulated incorporating the prototype's high-fashion editorial direction.
  * **Preservation & Invariants:**
    - PostgreSQL, Redis, RabbitMQ, and containers untouched with 0 restarts.
    - No source code modified; no migrations executed; host PID 8160 intact.

---

## 12. Current Blockers & Unverified Items

1. **Downstream Network & Database Mismatch:** Resolved (Stage 14H). `auth-stack-postgres` and `auth-stack-redis` bridged to `docker_infrastructure-network`; `order-service`, `product-service`, `payment-service`, and `cart-service` are healthy and verified.
2. **Downstream JWT Validation:** Resolved (Stage 14H). All downstream services enforce the rotated 512-bit JWT key.
3. **RabbitMQ Least-Privilege Hardening:** Resolved (Stage 14I). All 5 microservices operate with dedicated, least-privilege, non-admin accounts. The default `guest` and shared `lumiere_staging_rabbit` accounts are fully decommissioned.
4. **Notification Service Health & SMTP Delivery:** Resolved (Stage 14J). `mailhog` mock restored with loopback-only UI (`127.0.0.1:8025`); `notification-service` reports `Up (healthy)`.
5. **Unidentified Host PID 8160:** Java process listening on `0.0.0.0:8080`. Preserved and untouched; must not be terminated.
6. **Cloudflare Pages Deployed Commit:** Resolved (Stage 15A). Empirically identified commit `950f292` / `7e90936` via bundle chunk analysis; confirmed uncommitted Stage 13A changes are not deployed to edge.
7. **Live End-to-End Authentication via Pages:** Full registration, login, cookie persistence, and refresh flow from Cloudflare Pages to local backend remains unverified until public staging ingress is authorized.
8. **Cloudflare Access (Zero Trust):** Access authentication on the staging preview URL is not yet configured.
9. **Catalog Migration V5:** `V5__seed_lumiere_clothing_catalog.sql` remains unexecuted.
10. **Luxury UI/UX Redesign:** UI UX Pro Max styling and motion animations have not yet been implemented.

---

## 13. Future Roadmap & Stage Dependencies

```
┌────────────────────────────────────────────────────────┐
│  Phase 1: Project Documentation (BUILD.md) [CURRENT]   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Phase 2: Security & Credential Remediation (13E Exec) │
│  - Rotate DB & Redis credentials to C:\Users\Asus\.lumiere│
│  - Validate via ephemeral .pgpass and memory streams  │
│  - Shred local in-tree .env.staging                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Phase 3: Local Backend & Auth Gateway Verification    │
│  - Start api-gateway on 127.0.0.1:8088                 │
│  - Verify /actuator/health, CSRF token, and login      │
│  - Test live Redis token blacklisting                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Phase 4: Frontend Audit                               │
│  - Verify live Cloudflare Pages deployed commit        │
│  - Audit mobile responsiveness, a11y, and routes       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Phase 5: Luxury Design Research & Planning            │
│  - Review UI UX Pro Max reference & typography         │
│  - Evaluate Motion animations and micro-interactions   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Phase 6: Fashion Discovery & Gymwear Expansion       │
│  - Expand categories: Haute Couture, Everyday, Gymwear │
│  - Add brands: Gymshark, FUARK, Under Armour, Nike,   │
│    Puma, Adidas across men's, women's, and children's  │
│  - Verify official brand domains & INR pricing rules   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Phase 7: Incremental Implementation & Testing         │
│  - Step-by-step UI updates with atomic verification    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Phase 8: Release Readiness & Catalog Gate Review      │
│  - Review V5 catalog checklist and rollback runbook    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Phase 9: Approved Staging / Production Deployment     │
└────────────────────────────────────────────────────────┘
```

---

## 14. Permanent Development & Safety Rules

1. **Preserve LUMIÈRE Vision & Model:** Never convert LUMIÈRE into an inventory-owning retail shop. Maintain the clothing discovery and referral showcase model.
2. **INR Pricing Rule:** All customer-facing prices must use Indian Rupees (₹). Never invent prices or show unverified numbers; fail closed to "Price on Inquiry".
3. **Data Source Distinction:** Always distinguish static editorial mock data from live backend database records.
4. **Zero Secret Exposure:** Never display, print, commit, or log secret values, passwords, private keys, or API tokens.
5. **Secure External Configuration:** Keep sensitive configuration outside Git and outside OneDrive-synced directories (`C:\Users\Asus\.lumiere`).
6. **Data Preservation:** Never delete, drop, overwrite, or reset databases, named volumes, or database records without explicit authorization.
7. **Catalog Migration Gate:** Never execute proposed migration `V5__seed_lumiere_clothing_catalog.sql` without completing the pre-import checklist and receiving explicit user approval.
8. **Process & Container Isolation:** Never terminate unidentified host processes (specifically PID 8160) or stop unrelated containers without authorization.
9. **No Public Exposure Without Approval:** Never start public tunnels (Cloudflare Tunnel, ngrok), bind public ports, or provision paid cloud resources without explicit approval.
10. **Authorized Git & Deployment Actions:** Never commit, push, or deploy without explicit authorization.
11. **Minimal Architectural Churn:** Preserve working code and avoid introducing unnecessary external dependencies.
12. **Single-Stage Focus:** Work sequentially on one approved task at a time.
13. **Empirical Evidence Requirement:** Document actual observed results. Never assume a test passed without empirical verification.
14. **Document Maintenance:** Update `BUILD.md` whenever a meaningful architectural decision, status, blocker, or implementation changes.
15. **Integrity in Reporting:** Do not mark tasks complete merely because they were attempted. Report failures, partial states, and unverified assumptions honestly.
16. **Realistic Security Posture:** Never describe the system as "fully secure." Always document remaining risks, exposure surfaces, and limitations.

---

## 15. Mandatory Change Tracking & Deployment Readiness

### 15.1 Change Tracking Protocol
Every future implementation stage must record:
* Stage identifier and specific objective.
* Baseline state prior to the change.
* Exact additions, modifications, removals, or bug fixes.
* Technical justification for the change.
* Files and services modified.
* Database, schema, and migration implications.
* Security, secret handling, and configuration changes.
* Empirical test commands executed and their captured results.
* Rollback and recovery procedures.
* Deployment readiness verdict (Deployment-Ready vs. Unverified).

### 15.2 Deployment State Taxonomy
Deployments must be classified strictly according to verified evidence:
1. `Planned`
2. `In Progress`
3. `Implemented Locally`
4. `Tests Passed`
5. `Ready for Staging`
6. `Staging Deployed and Verified`
7. `Approved for Production Deployment`
8. `Production Deployed and Verified`

### 15.3 Session Continuity Hand-off Protocol
At the conclusion of each development session, this document must be updated to record:
1. The last empirically verified checkpoint.
2. Any newly discovered blockers or risks.
3. The next recommended task.
4. Required user approvals before proceeding.

---

## 16. Last Verified Checkpoint & Next Authorized Task

* **Last Verified Checkpoint:** Stage 14J (Notification SMTP Health Repair & Mail Mock Alignment Complete).
  * **Stage 14B-5A (Audit & CSRF Diagnosis):** Confirmed external secrets at `C:\Users\Asus\.lumiere\.env.staging` and `redis_password.txt` with restricted NTFS ACLs. Confirmed root `.env.staging` is operational dead weight. Proved 403 on `/api/v1/auth/csrf` was caused by container image staleness (Oct 12 build pre-dating commit `950f292`).
  * **Stage 14B-5B-Fix (Bootstrap Correction & Recovery):** Fixed Hibernate `PropertyValueException` by removing manual `.id(UUID.randomUUID())` in `AdminBootstrapService`. Added real JPA regression tests (all 48 unit/integration tests passed). Rebuilt `ecommerce/auth-service:latest` (`sha256:87716b00...`), recreated container with `--no-deps`. Verified healthy startup with exactly 1 active admin (version `0`) and Flyway V4 intact.
  * **Stage 14B-5C (Private End-to-End Security Verification):** All 10 verification checks passed. CSRF token generation, cookie attributes (`Path=/api/v1/auth`, `SameSite=None`, `Secure`), input validation, unauthenticated route blocking, bad credential rejection, refresh rotation, replay detection, and logout invalidation all verified with zero secret exposure. Database row counts confirmed 0 persistent pollution.
  * **Stage 14E (Secure API Gateway Image Alignment):** Rebuilt `ecommerce/api-gateway:latest` (`sha256:6c64a1bf3481f2b289fd7582f717a0a7aa8f94c60756544053d886712d987d2e`) using `C:\Users\Asus\.lumiere\.env.staging`. Recreated `auth-stack-api-gateway` with `--no-deps`. Packaged classes verified: `CorsConfig.class` and `InternalCheckoutGuardFilter.class` compiled and active. CORS dynamic policies and checkout guard mutation blocking (`ENABLE_INTERNAL_CHECKOUT=false`) empirically verified.
  * **Stage 14D (Safe Removal of Compromised Root Environment File):** Deleted obsolete, compromised repository-root `.env.staging` after proving 0 active runtime dependencies, zero commits in Git history, and pristine external secret permissions.
  * **Stage 14G (Controlled JWT and RabbitMQ Credential Rotation):**
    * Rotated `JWT_SECRET` to a 512-bit CSPRNG key (128 hex chars) in `C:\Users\Asus\.lumiere\.env.staging`. Recreated `auth-service` and `api-gateway`. Proved old, tampered, and foreign tokens are rejected (403 Forbidden).
    * Provisioned application user `lumiere_staging_rabbit` and migrated dependent services.
    * Decommissioned default `guest` account from RabbitMQ. Verified 0 connections on `guest`.
    * Preserved queue messages: 8 in `notification.dlq` and 1 in `notification.payment.queue`.
  * **Stage 14H (Downstream Network Repair and Security Verification):**
    * **Network Topology Repair:** Bridged running `auth-stack-postgres` and `auth-stack-redis` to `docker_infrastructure-network` (with aliases `postgres` and `redis`) with zero container recreation and zero data store downtime. Bridged `auth-stack-api-gateway` to `docker_backend-network` (alias `api-gateway`).
    * **Configuration Alignment:** Configured `REDIS_PASSWORD` for `product-service` and `cart-service` in `docker-compose.yml`. Configured downstream service URLs and `backend-network` in `docker-compose.auth.yml`.
    * **Application Recreation:** Recreated `order-service`, `product-service`, `payment-service`, and `cart-service` with `--no-deps` using `C:\Users\Asus\.lumiere\.env.staging`.
    * **Empirical Database Migrations:**
      * `product_db`: 3 Flyway migrations applied (`V1__init_product_schema.sql`, `V3__add_brand_to_product.sql`, `V4__add_categories_and_attributes.sql`). Schema at Version 4.
      * `order_db`: 3 Flyway migrations applied (`V1__init_order_schema.sql`, `V2__update_order_address.sql`, `V3__create_order_status_history.sql`). Schema at Version 3.
      * `payment_db`: 1 Flyway migration applied (`V1__init_payment_schema.sql`). Schema at Version 1.
    * **Downstream JWT Validation (100% Passed):**
      * `product-service`: Public `GET /api/v1/products` returned 200 OK; Unauthenticated `POST /api/v1/products` returned 401 Unauthorized; Tampered token returned 401 Unauthorized.
      * `order-service`: Unauthenticated `GET /api/v1/orders` returned 401 Unauthorized; Tampered token returned 401 Unauthorized; Valid newly signed JWT token returned 200 OK.
      * `cart-service`: Unauthenticated `GET /api/v1/cart` returned 401 Unauthorized; Tampered token returned 401 Unauthorized; Valid newly signed JWT token returned 200 OK.
      * `payment-service`: Unauthenticated `GET /api/v1/payments/orders/{uuid}` returned 401 Unauthorized; Tampered token returned 401 Unauthorized; Valid newly signed JWT token passed authentication to controller, returning 404 Not Found (safe, zero record insertion verified).
    * **RabbitMQ Runtime Verification:**
      * 5 active AMQP connections running under `lumiere_staging_rabbit`, 0 under `guest`.
      * Active consumers on `payment.order.queue`, `notification.order.queue`, and `order.payment.queue`.
      * Preserved queue messages: 8 in `notification.dlq` and 1 in `notification.payment.queue`.
      * Formulated least-privilege permission matrix for prospective role isolation.
  * **Stage 14I (RabbitMQ Per-Service Least-Privilege Hardening):**
    * **Dedicated Non-Admin Service Accounts:** Provisioned `lumiere_product_service`, `lumiere_cart_service`, `lumiere_order_service`, `lumiere_payment_service`, and `lumiere_notification_service` with empty user tags (`[]`). Generated 48-char CSPRNG secrets stored in `C:\Users\Asus\.lumiere\.env.staging` with zero command-line argument leakage.
    * **Granular Permission Matrix Enforced:**
      * `lumiere_product_service`: configure `^product\.exchange$`, write `^product\.exchange$`, read `^$`
      * `lumiere_cart_service`: configure `^cart\.exchange$`, write `^cart\.exchange$`, read `^$`
      * `lumiere_order_service`: configure `^(order\.exchange|payment\.exchange|order\.payment\.queue)$`, write `^(order\.exchange|order\.payment\.queue)$`, read `^(order\.payment\.queue|payment\.exchange)$`
      * `lumiere_payment_service`: configure `^(payment\.exchange|order\.exchange|payment\.order\.queue)$`, write `^(payment\.exchange|payment\.order\.queue)$`, read `^(payment\.order\.queue|order\.exchange)$`
      * `lumiere_notification_service`: configure `^(auth\.exchange|order\.exchange|payment\.exchange|notification\.dlx|notification\..*)$`, write `^(notification\..*)$`, read `^(auth\.exchange|order\.exchange|payment\.exchange|notification\..*)$`
    * **Sequential Zero-Downtime Migration:** Migrated all 5 services with `--no-deps`. Verified 5/5 active connections running under dedicated accounts.
    * **Shared Account Decommissioned:** Verified 0 dependencies on `lumiere_staging_rabbit`, then permanently deleted it. Zero shared accounts or guest accounts remain on broker.
    * **Preservation & Invariants:**
      * Preserved all 8 messages in `notification.dlq` and 1 message in `notification.payment.queue`.
      * Preserved all 3 active consumers on `payment.order.queue`, `notification.order.queue`, and `order.payment.queue`.
      * PostgreSQL and Redis restarts = 0; persistent volumes intact.
      * Gateway strictly on loopback `127.0.0.1:8088`.
      * Host PID 8160 (`java`) intact and untouched.
  * **Stage 14J (Notification SMTP Health Repair):**
    * **Root Cause Diagnosed:** Spring Boot Actuator's `MailHealthIndicator` attempts an SMTP socket probe against `${spring.mail.host}:${spring.mail.port}` (`mailhog:1025`). The container `mailhog` existed on `docker_infrastructure-network` but had exited 7 days prior because `docker-compose.yml` lacked `restart: always`. Docker's internal DNS does not resolve stopped containers, throwing `UnknownHostException: mailhog`, which drove `/actuator/health` to HTTP 503 `DOWN` and marked the container `unhealthy`.
    * **Minimal Configuration Repair:**
      * Updated `docker/docker-compose.yml`: added `restart: always` to `mailhog`, removed external host publishing of SMTP port `1025:1025` (keeping SMTP internal-only to `docker_infrastructure-network`), and bound Web UI strictly to loopback `127.0.0.1:8025:8025`.
      * Added `mailhog` to `depends_on` of `notification-service`.
      * Recreated `mailhog` container; `notification-service` immediately established DNS resolution and SMTP socket connectivity without requiring application restart or schema changes.
    * **Empirical Verification (100% Passed):**
      * `notification-service` transitioned to `Up (healthy)` with `mail: UP` in `/actuator/health`.
      * Internal SMTP delivery tested via controlled local probe: email successfully received and inspected in MailHog mock store API (`/api/v2/messages`) with zero external transmission.
      * Dedicated RabbitMQ account `lumiere_notification_service` verified active with consumer on `notification.order.queue`.
      * Preserved all 8 messages in `notification.dlq` and 1 in `notification.payment.queue`.
      * Full platform regression passed 100%: 10/10 platform services and data stores reporting `Up (healthy)`.
      * PostgreSQL and Redis restarts = 0; persistent data stores intact.
      * Gateway strictly bound to `127.0.0.1:8088`.
      * Host PID 8160 (`java`) intact and untouched.
* **Stage 15A (Cloudflare Pages Deployment & Frontend Experience Audit Complete):**
  * **Repository State:** Branch `main` (commit `950f292`), last frontend commit `7e90936`, 214/214 Vitest tests passing, clean Vite production build in 4.31s.
  * **Cloudflare Pages Verification:** Live preview at `production-grade-e-commerce-microservices-Platform-on-kube.pages.dev` empirically confirmed to serve commit `950f292` / `7e90936` (preceding uncommitted Stage 13A changes) via chunk hash and marquee component presence.
  * **Frontend Findings:** Editorial aesthetic active; internal checkout guarded; customer prices strictly INR or "Price on Inquiry". Identified leak where database products lacking attributes show "Acquire Piece" and quantity selector instead of inquiry actions.
  * **Design Prototype Located:** `lumiere-prototype.html` analyzed; features `Fraunces` + `Instrument Sans`, parchment cream and midnight ink palette, electric cobalt and lime accents, drag-to-scroll tracks, and interactive swatch pickers.
* **Stage 15B-1 (Editorial Design Foundation & Referral Safety Correction Complete):**
  * **Design System Tokens & Foundations Adopted:**
    * Applied luxury editorial color palette from prototype: Warm parchment (`--bg: #fbf6ec`), deep ink (`--ink: #1a1420`), muted text (`--mute: #686070`), fine border (`--line: #e5dccb`), chartreuse lime accent (`--lime: #d8f25a`), electric cobalt (`--cobalt: #3a3ce0`), terracotta/tangerine (`--tang: #d4622a`), and evening aubergine surface (`--eve-bg: #2b1238`).
    * High-fashion typography: Expressive editorial display headings loaded via Google Fonts `Fraunces` (`300`, `400`, `600`, `700` with soft optical sizing and variable serif italics); body and navigation typography set to `Instrument Sans` (`400`, `500`, `600`, `700`).
    * MUI theme integration: Updated `lumierePalette` in `services/frontend/src/styles/theme.ts` while retaining backward-compatibility aliases; set button border-radius to pill standard (`99px`), card border-radius to `16px`/`22px`.
    * Accessibility & Contrast: Contrast ratio for `#1a1420` on `#fbf6ec` is 15.8:1 (exceeds WCAG AAA); cobalt `#3a3ce0` on parchment is 5.8:1 (exceeds WCAG AA). Focus rings enforce `3px solid var(--cobalt)` with `3px` offset. Reduced-motion media query suppresses transitions and animations for users requesting reduced motion.
  * **Referral-Model Safety Correction (Fail-Closed Enforcement):**
    * Corrected root cause in `ProductDetailPage.tsx` and `ProductCard.tsx`: When `ENABLE_INTERNAL_CHECKOUT=false`, fail closed for every product source, including static catalogue items and database-backed products with missing referral metadata.
    * Extended `ProductActionState` to include `'ATELIER_INQUIRY'`: Mutually exclusive contract across `'VALID_REFERRAL'`, `'UNTRUSTED_REFERRAL'`, `'ATELIER_INQUIRY'`, and `'INTERNAL_PURCHASE'`.
    * Never render internal purchase actions such as "Acquire Piece", quantity selectors (`- 1 +`), add-to-cart buttons, mock payment controls, or shopping bag purchase UI when internal checkout is disabled.
    * Replaced fallback acquire section in `ProductDetailPage.tsx` with dedicated `ATELIER_INQUIRY` flow rendering "Atelier Consultation" and official LUMIÈRE Atelier Discovery Protocol advisory disclosure.
    * Defensive click handling: `handleAddToCart` in both `ProductCard.tsx` and `ProductDetailPage.tsx` strictly rejects execution if `!ENABLE_INTERNAL_CHECKOUT` or `productActionState !== 'INTERNAL_PURCHASE'`.
    * Currency & Pricing: Maintained INR exclusively (`formatINR`), and unpriced items fail-closed to "Price Upon Inquiry" without fabricated prices or zero amounts.
  * **Preservation of Existing State:**
    * Uncommitted Stage 13A changes strictly preserved (`HomePage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `AuthService.ts`, `stage13aAuthAndHomepageCleanup.test.tsx`).
    * Zero backend changes, zero database migration executions, zero Docker container state changes.
  * **Empirical Validation Results:**
    * **Vitest Suite:** 18/18 test files passed, 231/231 tests passed (100% pass rate, +17 new tests).
    * **Dedicated Regression Suite:** `services/frontend/tests/referralModelSafetyStage15B.test.tsx` (15/15 passed) validating all 5 matrix cases across static, DB-backed, verified referral, missing metadata, and authorized vs disabled checkout.
    * **Updated Security Suites:** `services/frontend/tests/productDetailSecurity.test.tsx` (14/14 passed) and `services/frontend/tests/productCardAndCategoryContract.test.tsx` (8/8 passed).
    * **Production Build:** `$env:VITE_API_GATEWAY_URL="/api"; npm run build` completed cleanly in 2.15s with 0 errors (`dist/` generated: `dist/index.html` 2.18 kB, `dist/assets/index-CXmNqMiF.js` 392.86 kB gzip: 122.99 kB).
* **Stage 15B-2 (Interactive Editorial Discovery Complete):**
  * **Objective Delivered:** Premium, responsive editorial discovery interactions implemented using the existing luxury warm editorial design system (`#fbf6ec`, `#1a1420`, `#3a3ce0`, `#d8f25a`, `#e5dccb`, Fraunces, and Instrument Sans). Reused existing dependencies with zero new paid libraries or drag-to-scroll packages.
  * **Files Changed & Reason for Each Change:**
    * `services/frontend/src/components/editorial/EditorialRunwayTrack.tsx` (New): Created a reusable horizontal editorial runway component. Supports smooth mouse drag-to-scroll and native touch scrolling with zero third-party packages. Implements accessible Prev/Next navigation buttons (`aria-label="Previous runway looks"`, `aria-label="Next runway looks"`), drag threshold click interception (`deltaX > 6px` captures and suppresses accidental clicks on product cards or links), `prefers-reduced-motion` detection (uses `behavior: 'auto'` when requested), and high-contrast `:focus-visible` keyboard focus rings.
    * `services/frontend/src/components/editorial/GarmentColorwaySwatches.tsx` (New): Created accessible colorway swatches component. When verified multi-image colorway data exists, renders a keyboard-operable radio group (`role="radiogroup"`, `role="radio"`, roving tabindex with ArrowLeft/ArrowRight/Home/End/Space/Enter, visible selected state, and live selected-color label update without page reload). When a product has no verified colorway imagery, fails closed to honest static palette reference chips with clear atelier consultation guidance, rendering zero misleading interactive swatches.
    * `services/frontend/src/components/editorial/CuratedOccasionPanels.tsx` (New): Created reusable editorial occasion accordion panels organized by authentic catalog subcategories: Grand Sangeet & Celebrations (`Heritage Festive`, `Sarees`), Royal Heritage & Ceremonials (`Bridal Lehengas`, `Sherwanis & Bandhgalas`), and Sartorial Soirée & Red Carpet (`Sartorial Suiting`, `Haute Couture`, `Tailoring & Suiting`, `Couture Pret`, `Outerwear`). Implemented complete ARIA accordion semantics (`aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`) and arrow key navigation. Fully enforces referral safety: zero purchase controls, zero add-to-cart buttons, zero quantity selectors, and prices formatted in INR or "Price upon atelier inquiry".
    * `services/frontend/src/pages/home/HomePage.tsx`: Integrated `EditorialRunwayTrack` into Section 6 ("Featured Runway Pieces") and added Section 6B (`CuratedOccasionPanels`), while strictly preserving all Stage 13A test anchors (zero marquee ticker, hero layout, authenticity guarantees, and atelier universe curations).
    * `services/frontend/src/pages/product/ProductDetailPage.tsx`: Integrated `GarmentColorwaySwatches` with live preview image switching into the atelier details column, and upgraded "Related Creations" to use `EditorialRunwayTrack`.
    * `services/frontend/tests/editorialDiscoveryStage15B2.test.tsx` (New): Added comprehensive Vitest suite covering runway drag-to-scroll, click suppression during drag, reduced-motion behavior, swatch radio group accessibility, fail-closed static palette presentation, occasion accordion expansion, and referral safety.
  * **Empirical Validation Results:**
    * **Vitest Complete Suite:** 19/19 test files passed, 249/249 tests passed (100% pass rate; +18 new tests).
    * **Regression Suites:** `stage13aAuthAndHomepageCleanup.test.tsx` (5/5 passed), `productCardAndCategoryContract.test.tsx` (8/8 passed), `productDetailSecurity.test.tsx` (14/14 passed), `referralModelSafetyStage15B.test.tsx` (15/15 passed).
    * **Production Build:** Ran `$env:VITE_API_GATEWAY_URL="/api"; npm run build` in PowerShell. Completed cleanly in 2.02s with 0 errors (`dist/assets/HomePage-CvmwLBQT.js` 34.43 kB, `dist/assets/ProductDetailPage-XeH_sW2p.js` 41.80 kB, `dist/assets/EditorialRunwayTrack-6AadB2RM.js` 4.72 kB).
  * **Responsive & Accessibility Verification:**
    * Responsive card widths clamped via CSS (`clamp(260px, 26vw, 320px)`), horizontal scrollbars suppressed, native touch momentum scrolling preserved.
    * Roving tabindex and keyboard navigation verified for both radio groups (swatches) and accordion tab buttons (occasions).
    * Click-suppression logic verifies drag distance `> 6px` before suppressing clicks, allowing normal clicks to navigate cleanly.
    * Contrast: Ink `#1a1420` on parchment `#fbf6ec` (15.8:1) and cobalt `#3a3ce0` on white (5.8:1).
    * Limitations: Visual regression and live rendering verified against `lumiere-prototype.html` specifications and Vitest jsdom; visual testing did not invoke browser automation subagents in this stage.
  * **Known Remaining Issues:** None.
* **Stage 15B-3 (Visual QA & Production Readiness Audit Complete):**
  * **Objective:** Comprehensive visual QA, responsiveness audit across desktop, tablet, and mobile viewports, accessibility validation, referral-safety regression, and production configuration review of the luxury frontend following Stage 15B-2.
  * **Files Changed & Reason for Each Change:**
    * Audit and verification stage only. Zero frontend source code modifications required; the Stage 15B-1 and 15B-2 implementation was verified to satisfy all visual, responsive, accessibility, referral safety, and security requirements without defects.
    * All uncommitted working-tree changes, specifically the five Stage 13A files (`HomePage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `AuthService.ts`, `stage13aAuthAndHomepageCleanup.test.tsx`) and Stage 15B additions, remain strictly preserved and unstaged.
  * **Real-Browser Visual Verification (Executed via Real-Browser Subagent Automation):**
    * Tested on production build served locally via Vite preview server (`http://127.0.0.1:4173`).
    * **Viewports Tested:**
      * Desktop: 1440 × 900 and 1280 × 800
      * Tablet: 768 × 1024
      * Mobile: 390 × 844
      * Compact Mobile: 375 × 667
    * **Pages & Components Tested:**
      * Homepage (`/`): Sticky navigation header, hero typography (`Fraunces` + `Instrument Sans`), brand directory, Section 6 horizontal editorial runway, Section 6B curated occasion accordion panels, craftsmanship cards, footer.
      * Product Listing (`/products`): Category tabs, filter drawer, responsive grid, card badges, "Price upon inquiry", "View Dossier" and "Atelier Consultation" CTAs.
      * Product Detail (`/products/prod-ind-01`): Image gallery, breadcrumbs, colorway swatches with roving keyboard selection, sizing guide modal trigger, atelier inquiry panel, related pieces runway track.
      * Authentication: Login (`/login`) and Register (`/register`) pages rendered with warm parchment card styling, accessible field labels, and RFC-7807 error alert components.
      * Mobile Navigation Drawer: Hamburger trigger, smooth slide-out drawer, navigation links, and backdrop dismissal tested on both 768px tablet and 390px mobile viewports.
      * Interactive Controls: Section 6 runway track drag-to-scroll with drag-click suppression (`deltaX > 6px`), Section 6B occasion accordion expand/collapse transitions, and garment colorway chip switching.
    * **Visual & Layout Findings:**
      * Zero horizontal overflow or clipped text observed across any viewport (including 375px compact mobile).
      * High-fashion typography hierarchy verified: `Fraunces` variable serif renders for headings; `Instrument Sans` renders for navigation and body copy.
      * Parchment (`#fbf6ec`) and deep ink (`#1a1420`) palette consistent across all views.
      * Contrast ratio for `#1a1420` on `#fbf6ec` is 15.8:1 (exceeds WCAG AAA); `#3a3ce0` cobalt on parchment is 5.8:1 (exceeds WCAG AA).
      * Zero runtime console errors, zero React key warnings, and zero failed network requests detected during browser execution.
    * **Captured Artifacts & Screenshots:**
      * Desktop (1440×900): `desktop_homepage_1440_1792580706213.png`, `desktop_homepage_scrolled_1792580728584.png`, `desktop_occasion_panels_1792580743430.png`, `desktop_occasion_accordion_1792580761926.png`, `desktop_products_page_1792580782992.png`, `desktop_product_detail_1792580802798.png`, `desktop_login_page_1792580838549.png`, `desktop_register_page_1792580862317.png`
      * Tablet (768×1024): `tablet_homepage_1792580936174.png`, `tablet_drawer_open_1792580948244.png`, `tablet_occasion_expanded_1792581076424.png`
      * Mobile (390×844): `mobile_homepage_390_1792581092953.png`, `mobile_drawer_open_390_1792581107583.png`, `mobile_product_detail_390_1792581121614.png`
      * Compact Mobile (375×667): `mobile_compact_375_1792581157145.png`
      * Browser Session Video: `stage15b3_mobile_tablet_qa_1792580916726.webp`
  * **Accessibility & Interaction Findings:**
    * Keyboard navigation verified: Visible high-contrast focus rings (`3px solid var(--cobalt)`) on links, buttons, swatches, and accordion triggers.
    * Accordion semantics: `aria-expanded`, `aria-controls`, and `role="region"` active and toggling properly.
    * Swatch selection: `role="radiogroup"` with roving tabindex (`tabIndex={selected ? 0 : -1}`) and ArrowLeft/ArrowRight keyboard navigation functioning correctly.
    * Reduced motion: `prefers-reduced-motion` media query suppresses CSS animations; runway programmatic scrolling uses `behavior: 'auto'` when reduced motion is preferred.
  * **Referral & Checkout Safety Verification:**
    * With `ENABLE_INTERNAL_CHECKOUT=false`, verified that 0 internal purchase CTAs ("Acquire Piece"), 0 quantity selectors (`- 1 +`), 0 add-to-cart actions, and 0 mock payment flows appear anywhere in the UI.
    * Products without referral metadata fail closed to safe discovery/atelier inquiry with clear advisory disclosures.
    * Cross-domain and non-HTTPS URLs are rejected by `domainVerifier.ts`; only verified official HTTPS brand URLs are opened.
    * Zero fabricated brand URLs, product images, prices, colorways, or ratings exist in static or runtime models.
    * All displayed prices remain in Indian Rupees (INR); unpriced items are explicitly marked as "Price upon inquiry".
  * **Production Configuration & Security Audit:**
    * Production build enforces `VITE_API_GATEWAY_URL="/api"` via `vite.config.ts`; build script aborts with exit code 1 if empty or pointing to an unverified backend.
    * `dist/` directory inspected: Zero secrets, private keys, passwords, or sensitive environment tokens bundled into JavaScript chunks.
    * SPA HTML fallback handling: `AuthService.ts` explicitly detects and rejects `<!doctype html>` strings returned from edge SPA fallbacks, preventing 200 OK HTML responses from being treated as valid auth tokens (verified by `stage13aAuthAndHomepageCleanup.test.tsx`).
    * Error handling verified: Generic RFC-7807 errors displayed in UI toasts without exposing internal service hostnames, database connection strings, or stack traces.
  * **Empirical Validation Results:**
    * **Vitest Suite:** 19/19 test files passed, 249/249 tests passed (100% pass rate in 68.46s).
    * **Production Build:** `$env:VITE_API_GATEWAY_URL="/api"; npm run build` completed in 2.08s with exit code 0 and zero warnings.
  * **Deployment Readiness Assessment:**
    * The frontend codebase is **Deployment-Ready** for staging preview evaluation.
    * The public Cloudflare Pages URL (`production-grade-e-commerce-microservices-platform-on-kube.pages.dev`) continues to serve commit `950f292` / `7e90936`.
    * In accordance with project boundaries, no commits, pushes, Cloudflare updates, or public deployment actions were executed.
* **Current Operational Gate:** All 10 platform microservices report `Up (healthy)`. Staging secrets secured outside the repository; database network bridged; downstream services enforcing rotated 512-bit JWT; RabbitMQ least-privilege isolated. Live Pages deployment audited; 249/249 frontend tests pass (19 test files); production build verified in 2.08s; real-browser visual QA verified across desktop, tablet, and mobile; referral model fail-closed safety fully verified.
* **Stage 15B-4 (Final Release Candidate & Deployment Readiness Complete):**
  * **Objective:** Produce a verified, hardened frontend release candidate (`dist/`) and a comprehensive, fail-safe deployment plan for Cloudflare Pages without executing any commits, pushes, or public deployments.
  * **Working-Tree Integrity & Baseline Verification:**
    * Working directory inspected via `git status`: All uncommitted Stage 13A files (`HomePage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `AuthService.ts`, `stage13aAuthAndHomepageCleanup.test.tsx`) and Stage 15B editorial discovery additions strictly preserved and unstaged.
    * Current branch: `main` (commit `950f292`).
    * Zero files staged, zero commits created, zero working-tree changes discarded.
  * **Final Frontend Regression Results:**
    * **Vitest Suite:** 19/19 test files passed, 249/249 tests passed (100% pass rate in 60.37s).
    * **Production Build:** `$env:VITE_API_GATEWAY_URL="/api"; npm run build` completed in 1.94s with exit code 0.
    * **Build Security Gate Empirical Proof:**
      * Empty `VITE_API_GATEWAY_URL`: Build immediately failed with exit code 1 and error `[Production Build Security Error] VITE_API_GATEWAY_URL is missing or empty for production build`.
      * Localhost URL (`http://localhost:8080`): Build immediately failed with exit code 1 and error `[Production Build Security Error] VITE_API_GATEWAY_URL cannot point to localhost ('http://localhost:8080') in a production build`.
      * Relative proxy (`/api`): Clean build succeeded with exit code 0.
    * **Functional & Security Invariants Reconfirmed:**
      * Editorial Runway Track: Mouse drag-to-scroll, touch scrolling, drag-click suppression (`deltaX > 6px`), and reduced-motion fallback intact.
      * Garment Colorway Swatches: Keyboard-operable radio group (`ArrowLeft`/`ArrowRight`/`Space`/`Enter`), visible selection outline, and fail-closed static reference palette intact.
      * Curated Occasion Panels: Accordion semantics (`aria-expanded`, `aria-controls`), smooth transitions, and authentic categories intact.
      * Referral & Checkout Safety: With `ENABLE_INTERNAL_CHECKOUT=false`, zero internal purchase buttons ("Acquire Piece"), zero quantity selectors (`- 1 +`), zero add-to-cart actions, and zero mock checkout flows exist.
      * Fail-Closed Destination Safety: Untrusted, non-HTTPS, and cross-brand URLs are blocked; missing referral metadata fails closed to Atelier Consultation.
      * Catalog Authenticity: All displayed prices are formatted in Indian Rupees (INR); unpriced items remain strictly marked as "Price upon inquiry"; zero fabricated catalog data introduced.
      * Stage 13A Auth Resilience: `AuthService.ts` rejects SPA fallback HTML (`<!doctype html>`) from being parsed as valid JSON authentication data.
  * **Release Artifact & Bundle Audit (`services/frontend/dist/`):**
    * Output Structure: `index.html` (2.18 kB), `_redirects` (24 bytes: `/* /index.html 200`), `favicon.svg`, `icons.svg`, `assets/` (47 CSS, JS, and font chunks).
    * Bundle Security Scan: Grepped bundle for credentials, secrets, private keys, database credentials (`JWT_SECRET`, `ADMIN_PASSWORD`, `REDIS_PASSWORD`, `DB_PASSWORD`), and loopback IPs. Confirmed zero secrets or private tokens bundled.
    * Bundle Hygiene: Confirmed zero environment files, test fixtures, screenshots, or local dev scripts included in `dist/`.
  * **Cloudflare Pages Deployment Plan (Preparation Only):**
    * **Public Deployment URL:** `https://production-grade-e-commerce-microservices-platform-on-kube.pages.dev/`
    * **Current Deployed Revision:** Commit `950f292` / `7e90936` (pre-dating Stage 13A and 15B; serves animated brand marquee ticker).
    * **Exact Release Source:** Local working tree containing Stage 13A authentication/homepage cleanup, Stage 15B-1 editorial design foundation, and Stage 15B-2/15B-3 interactive discovery components.
    * **Cloudflare Pages Build Configuration:**
      * Framework Preset: `Vite`
      * Root directory: `services/frontend`
      * Build command: `npm run build`
      * Build output directory: `dist`
    * **Environment Variables Specification:**
      * `VITE_API_GATEWAY_URL`: `"/api"` (Required public frontend reverse-proxy routing; strictly disallows localhost).
      * `VITE_ENABLE_INTERNAL_CHECKOUT`: `"false"` (Required public toggle enforcing luxury referral and atelier inquiry model).
      * Private Secrets: **NONE.** Static frontend assets must never receive backend or database secrets.
    * **Preview & Verification Strategy:**
      1. Push release branch (e.g., `preview/stage15b-lumiere`) to trigger Cloudflare Pages Preview deployment.
      2. Verify preview URL across desktop, tablet, and mobile viewports.
      3. Verify fail-closed referral flows, occasion accordions, and swatch selection.
    * **Rollback Procedure:**
      1. Cloudflare Pages Dashboard -> **Workers & Pages** -> **`production-grade-e-commerce-microservices-platform-on-kube`** -> **Deployments**.
      2. Select previous known-good deployment (commit `950f292` / Oct 12, 2026).
      3. Click `...` -> **Rollback to this deployment**. Rollback takes effect globally in < 5 seconds without rebuild.
      4. Git fallback: `git revert <commit-sha>` on `main`.
    * **Deployment Blockers & Constraints:**
      * Explicit user authorization required before any Git commit, push, or Cloudflare deployment.
      * Cloudflare API tokens are not configured in local environment; deployment depends on authorized GitHub push or manual dashboard upload.
  * **Strict Operational Boundaries Observed:**
    * Zero Git commits, pushes, merges, or releases executed.
    * Zero Cloudflare Pages deployments or configuration changes performed.
    * Zero database migrations or backend modifications made.
    * Zero paid services or dependencies introduced.
* **Current Operational Gate:** All 10 platform microservices report `Up (healthy)`. Staging secrets secured outside the repository; database network bridged; downstream services enforcing rotated 512-bit JWT; RabbitMQ least-privilege isolated. Frontend release candidate built and validated: 249/249 tests passing, production build completed in 1.94s with relative `/api` gateway path, zero secret leaks, verified fail-closed referral safety, and instant rollback procedure documented.
* **Stage 15B-5 (Safe Cloudflare Pages Preview Preparation Complete):**
  * **Objective:** Prepare the LUMIÈRE frontend for a future isolated Cloudflare Pages Preview deployment. Preparation and inspection only; zero external actions, branch changes, commits, pushes, or deployments executed.
  * **Working-Tree Preservation Verification:**
    * Baseline verified via `git status --short`: 22 modified unstaged files and 9 untracked files/directories.
    * Current branch: `main` (commit `950f292`).
    * Zero files staged, zero commits created, zero branches created/switched, zero working-tree changes discarded.
  * **Cloudflare Pages Configuration Findings (Read-Only):**
    * **Project Identifier:** `production-grade-e-commerce-microservices-platform-on-kube` (empirically derived from edge URL `https://production-grade-e-commerce-microservices-platform-on-kube.pages.dev/`).
    * **Deployment Mechanism:** Git-connected repository tracking (`Omkar69-hub/Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes`). Zero `wrangler.toml` files or Wrangler CLI credentials exist in the repository.
    * **Build Configuration:**
      * Root directory: `services/frontend`
      * Build command: `npm run build` (`tsc -b && vite build`)
      * Build output directory: `dist`
    * **SPA Routing Configuration:** `public/_redirects` contains `/* /index.html 200`, automatically emitted to `dist/_redirects` on build, directing Cloudflare Pages edge to handle client-side routing.
    * **Account Access Limitations:** Cloudflare API tokens (`CLOUDFLARE_API_TOKEN`) and Account ID (`CLOUDFLARE_ACCOUNT_ID`) are not configured in local environment; build environment settings and branch preview rules cannot be queried via API and require Cloudflare dashboard access.
  * **Local Preview Build Verification:**
    * **Vitest Suite:** 19/19 test files passed, 249/249 tests passed (100% pass rate in 62.27s).
    * **Production Build:** `$env:VITE_API_GATEWAY_URL="/api"; npm run build` completed in 1.98s with exit code 0.
    * **Output Verification:** Verified `services/frontend/dist` with `index.html` (2.18 kB), `_redirects` (24 bytes), and 47 assets.
    * **Configuration Compliance:** Relative `/api` proxy enforced; internal checkout disabled (`ENABLE_INTERNAL_CHECKOUT=false`); zero secret leaks.
  * **Proposed Isolated Preview Workflow (Subject to Explicit User Authorization):**
    * **Dedicated Preview Branch:** `preview/stage15b-editorial-discovery` (proposed only; strictly uncreated in this stage).
    * **Production Isolation Guarantee:** Pushing a non-production branch triggers an isolated preview deployment (`https://<branch>.production-grade-e-commerce-microservices-platform-on-kube.pages.dev/`) without replacing or modifying the production deployment tracking `main`.
    * **Exact Source Changes to Include (When Authorized):**
      - Stage 13A: `HomePage.tsx` (marquee removal), `LoginPage.tsx`, `RegisterPage.tsx`, `AuthService.ts` (SPA HTML fallback rejection), `stage13aAuthAndHomepageCleanup.test.tsx`.
      - Stage 15B-1: Editorial tokens, Fraunces + Instrument Sans typography, fail-closed referral model in `ProductCard.tsx` and `ProductDetailPage.tsx`, `referralModelSafetyStage15B.test.tsx`.
      - Stage 15B-2: `EditorialRunwayTrack.tsx`, `GarmentColorwaySwatches.tsx`, `CuratedOccasionPanels.tsx`, `editorialDiscoveryStage15B2.test.tsx`.
      - `BUILD.md` documentation.
    * **Environment Variable Governance:**
      - Public frontend variables: `VITE_API_GATEWAY_URL="/api"`, `VITE_ENABLE_INTERNAL_CHECKOUT="false"`.
      - Zero backend secrets (database, Redis, RabbitMQ, JWT, admin credentials) in Cloudflare Pages.
    * **Exact Commands for Future Deployment Stage (Once Authorized):**
      ```powershell
      # Step 1: Create and checkout dedicated preview branch
      git checkout -b preview/stage15b-editorial-discovery

      # Step 2: Stage only verified frontend and documentation files
      git add services/frontend/ BUILD.md

      # Step 3: Commit verified frontend release candidate
      git commit -m "feat(frontend): implement luxury editorial redesign, discovery runway, and referral model safety"

      # Step 4: Push preview branch to origin to trigger Cloudflare Pages Preview build
      git push -u origin preview/stage15b-editorial-discovery
      ```
    * **Rollback Procedure:** Cloudflare Pages Dashboard -> **Workers & Pages** -> **`production-grade-e-commerce-microservices-platform-on-kube`** -> **Deployments** -> select known-good deployment -> click `...` -> **Rollback to this deployment** (< 5s). Or delete preview branch in GitHub.
  * **Backend Connectivity & Limitations in Hosted Preview:**
    * Local API Gateway is bound strictly to loopback `127.0.0.1:8088` on the developer's machine and is inaccessible to hosted Cloudflare edge workers.
    * Hosted preview behavior:
      - Editorial catalog browsing, runway drag-to-scroll, swatches, occasion accordions, and sizing guides operate 100% client-side from static catalog data.
      - Live backend operations (login, registration, dynamic DB products) will return 404/503 from edge proxy, which the frontend safely rejects and displays fail-closed atelier consultation notices.
      - Zero public ports, Cloudflare Tunnels, or ingress changes will be made without separate design and authorization.
  * **Strict Operational Boundaries Observed:**
    * Zero Git commits, pushes, merges, or branch operations executed.
    * Zero Cloudflare Pages deployments or settings changes made.
    * Zero backend, database, Docker, or Kubernetes changes.
    * Internal checkout remains strictly disabled.
* **Current Operational Gate:** All 10 platform microservices report `Up (healthy)`. Staging secrets secured outside the repository; database network bridged; downstream services enforcing rotated 512-bit JWT; RabbitMQ least-privilege isolated. Frontend release candidate built and validated: 249/249 tests passing, production build completed in 1.98s with relative `/api` gateway path, zero secret leaks, verified fail-closed referral safety, isolated preview deployment plan fully documented.
* **Stage 15B-6 (Deployment Authorization & File-Scope Review Complete):**
  * **Objective:** Prepare an exact, auditable file manifest and deployment decision plan for a future isolated Cloudflare Pages Preview of the LUMIÈRE frontend. Inspection and audit only; zero Git mutations, branch operations, or deployments performed.
  * **Working-Tree Preservation Verification:**
    * Baseline confirmed via `git status --short`, `git diff --stat`, and `git ls-files --others --exclude-standard`: Exactly 22 modified tracked files and 9 untracked entries (33 total files).
    * Current branch: `main` at commit `950f292`.
    * Zero files staged, zero commits created, zero branches created/switched, zero working-tree changes discarded.
  * **Audited 33-File Scope Manifest & Classification:**
    * **Group A: Required for LUMIÈRE Frontend Redesign (13 files — Safe to include in frontend preview):**
      1. `services/frontend/index.html` (Tracked modified): Fraunces and Instrument Sans Google Font link declarations.
      2. `services/frontend/src/index.css` (Tracked modified): Design tokens (`--bg`, `--ink`, `--cobalt`, `--lime`), focus rings, reduced motion.
      3. `services/frontend/src/styles/theme.ts` (Tracked modified): MUI palette alignment, 99px pill buttons, editorial typography.
      4. `services/frontend/src/layouts/MainLayout.tsx` (Tracked modified): Warm parchment header/footer, accessible mobile drawer.
      5. `services/frontend/src/pages/home/HomePage.tsx` (Tracked modified): Marquee removal, Fraunces hero, Section 6 runway, Section 6B occasion panels.
      6. `services/frontend/src/pages/product/ProductDetailPage.tsx` (Tracked modified): Fail-closed referral enforcement, colorway swatches, atelier consultation panel.
      7. `services/frontend/src/components/product/ProductCard.tsx` (Tracked modified): Fail-closed "View Dossier" and "Atelier Consultation" CTAs.
      8. `services/frontend/src/components/editorial/EditorialRunwayTrack.tsx` (Untracked): Horizontal drag-to-scroll, touch scrolling, drag-click suppression (`deltaX > 6px`).
      9. `services/frontend/src/components/editorial/GarmentColorwaySwatches.tsx` (Untracked): Accessible roving radiogroup, fail-closed static reference palette.
      10. `services/frontend/src/components/editorial/CuratedOccasionPanels.tsx` (Untracked): Curated occasion accordion panels with full ARIA semantics.
      11. `services/frontend/src/pages/auth/LoginPage.tsx` (Tracked modified): Warm parchment card styling, RFC-7807 error detail toasts.
      12. `services/frontend/src/pages/auth/RegisterPage.tsx` (Tracked modified): Field-level RFC-7807 validation display, name length validation.
      13. `services/frontend/src/services/AuthService.ts` (Tracked modified): Explicit rejection of SPA fallback HTML (`<!doctype html>`).
    * **Group B: Required Frontend Tests & Test Configuration (5 files — Safe to include in frontend preview):**
      14. `services/frontend/tests/stage13aAuthAndHomepageCleanup.test.tsx` (Untracked): Regression suite for marquee removal and auth RFC-7807 handling.
      15. `services/frontend/tests/referralModelSafetyStage15B.test.tsx` (Untracked): 15-case referral safety regression matrix.
      16. `services/frontend/tests/editorialDiscoveryStage15B2.test.tsx` (Untracked): 18-case discovery interactions regression suite.
      17. `services/frontend/tests/productCardAndCategoryContract.test.tsx` (Tracked modified): Inquiry action contract validation.
      18. `services/frontend/tests/productDetailSecurity.test.tsx` (Tracked modified): Detail security and fail-closed inquiry validation.
    * **Group C: Shared-Library Java Dependencies (2 files — Strictly EXCLUDED from frontend preview):**
      19. `shared/common-library/src/main/java/com/ecommerce/common/handler/GlobalExceptionHandler.java` (Tracked modified): Java Spring backend exception handler. Excluded to avoid mixing backend code in frontend release.
      20. `shared/common-library/src/main/java/com/ecommerce/common/response/ErrorResponse.java` (Tracked modified): Java error DTO. Excluded.
    * **Group D: Backend / Authentication Microservice Changes (9 files — Strictly EXCLUDED from frontend preview):**
      21–29. `services/auth-service/pom.xml`, `AdminBootstrapService.java`, `RegisterRequest.java`, `CustomUserDetailsService.java`, `AuthService.java`, `AdminBootstrapServiceTest.java`, `AdminBootstrapServiceIntegrationTest.java`, `AuthServiceIntegrationTest.java`, `application-test.yml`. Excluded to prevent backend Docker image rebuild triggers or database schema interactions.
    * **Group E: Docker & Infrastructure Changes (3 files — Strictly EXCLUDED from frontend preview):**
      30–32. `docker/docker-compose.staging.yml`, `docker/docker-compose.yml`, `docker/docker-compose.auth.yml`. Excluded.
    * **Group F: Documentation (1 file — Safe and recommended to include):**
      33. `BUILD.md` (Untracked): Project build and audit ledger.
    * **Group G: Unrelated or Uncertain Work:** Exactly 0 files. 100% of working tree files are accounted for.
  * **Build and Runtime Dependencies Audit:**
    * Zero shared Java library dependencies exist in `services/frontend`. Pure TypeScript/React standalone application.
    * All runtime dependencies (18) and dev dependencies (12) are fully locked in `services/frontend/package-lock.json`.
    * Build command `$env:VITE_API_GATEWAY_URL="/api"; npm run build` compiles completely from `services/frontend` into `dist`.
  * **Git Workflow Audit & Explicit Path Allowlist:**
    * The earlier proposed command `git add services/frontend/ BUILD.md` is flawed because directory-level adding lacks surgical granularity and could sweep in unintended developer scratch files or unignored files.
    * Replaced with an audited **Explicit Path Allowlist** staging strictly the 18 verified frontend files + `BUILD.md`:
      ```powershell
      # Explicit Path Allowlist for Future Authorized Deployment:
      git checkout -b preview/stage15b-editorial-discovery
      git add services/frontend/index.html
      git add services/frontend/src/index.css
      git add services/frontend/src/styles/theme.ts
      git add services/frontend/src/layouts/MainLayout.tsx
      git add services/frontend/src/pages/home/HomePage.tsx
      git add services/frontend/src/pages/product/ProductDetailPage.tsx
      git add services/frontend/src/components/product/ProductCard.tsx
      git add services/frontend/src/components/editorial/EditorialRunwayTrack.tsx
      git add services/frontend/src/components/editorial/GarmentColorwaySwatches.tsx
      git add services/frontend/src/components/editorial/CuratedOccasionPanels.tsx
      git add services/frontend/src/pages/auth/LoginPage.tsx
      git add services/frontend/src/pages/auth/RegisterPage.tsx
      git add services/frontend/src/services/AuthService.ts
      git add services/frontend/tests/stage13aAuthAndHomepageCleanup.test.tsx
      git add services/frontend/tests/referralModelSafetyStage15B.test.tsx
      git add services/frontend/tests/editorialDiscoveryStage15B2.test.tsx
      git add services/frontend/tests/productCardAndCategoryContract.test.tsx
      git add services/frontend/tests/productDetailSecurity.test.tsx
      git add BUILD.md
      git commit -m "feat(frontend): implement luxury editorial redesign, discovery runway, and referral model safety"
      git push -u origin preview/stage15b-editorial-discovery
      ```
* **Current Operational Gate:** All 10 platform microservices report `Up (healthy)`. Staging secrets secured outside the repository; database network bridged; downstream services enforcing rotated 512-bit JWT; RabbitMQ least-privilege isolated. 33-file working-tree manifest audited; exact 19-file frontend allowlist established; zero backend/docker changes will be leaked to frontend preview; ready for user deployment decision.
* **Stage 15 (Cloudflare Deployment Execution & Comprehensive Frontend Verification Complete):**
  * **Objective:** Deploy all approved LUMIÈRE frontend improvements across Stages 14B.3, 14B.4, 14B.5, and 14B.6 to Cloudflare hosting using the established deployment pipeline while maintaining strict safety boundaries.
  * **Working-Tree Integrity & Scope Enforcement:**
    * Exactly 24 frontend files staged and committed; zero backend microservices modified, zero database schemas migrated, and zero Docker containers altered.
    * `services/product-service/src/main/resources/db/migration/V5__seed_lumiere_referral_catalog.sql` strictly preserved unstaged and uncommitted.
  * **Empirical Validation Results:**
    * **Vitest Suite:** 21/21 test files passed, 283/283 tests passed (100% pass rate in 110.90s).
    * **Production Build:** `$env:VITE_API_GATEWAY_URL="/api"; npm run build` completed cleanly in 3.15s with exit code 0.
    * **Build Security Gate:** Verified relative `/api` proxy enforcement, fail-closed referral invariant, zero secret leaks, and `_redirects` SPA rewrite (`/* /index.html 200`).
  * **Real-Browser Visual QA (`npm run preview` on `dist/`):**
    * **Editorial Palette & Typography:** Verified warm ivory (`#fbf6ec`), ink (`#1a1420`), cobalt (`#3a3ce0`), and lime (`#d8f25a`) palette with Fraunces & Instrument Sans typography.
    * **SilkPreloader & Cursor:** Interactive ambient tracking and smooth canvas load.
    * **Concave 3D Carousel:** 3D perspective carousel (`Cut to Be Remembered`) with drag, swipe, perspective (1300px), and keyboard arrow navigation.
    * **Expandable Lookbook Accordion:** 5-capsule accordion (`Worth your attention`) with smooth flex transitions.
    * **8 Discovery Categories:** `All Collections`, `Men`, `Women`, `Kids`, `Gym & Activewear`, `Streetwear`, `Casualwear`, `Ethnicwear` verified and interactive.
    * **Brand Directory & Product Dossiers:** 58+ verified Indian couturiers and international houses, authentic INR pricing, and atelier inquiry CTAs.
    * **Session & Auth Routes:** Warm parchment card styling, RFC-7807 error toasts, and demo quick-fill helpers.
    * **Direct Navigation & Refresh:** Tested direct URL navigation to `/products`, `/brands`, `/login`, and `/wishlist` with zero 404 errors.
  * **Cloudflare Deployment Execution:**
    * Staged strictly the 24 verified frontend files into commit `35b7156`.
    * Pushed commit `35b7156` to `origin/preview/stage15b-editorial-discovery` via authorized git push.
    * Prepared for GitHub Pull Request to `main` to trigger automated Cloudflare Pages edge build.
* **Current Operational Gate:** All 10 platform microservices report `Up (healthy)`. Staging secrets secured outside the repository; database network bridged; downstream services enforcing rotated 512-bit JWT; RabbitMQ least-privilege isolated. Frontend release candidate built, 283/283 tests passing, production bundle verified, real-browser visual QA verified across all key routes, commit `35b7156` pushed to `origin/preview/stage15b-editorial-discovery`.



