# LUMIÈRE Platform Status

**Current Status: Remediation & Security Hardening Complete (Fixes 1–5)**  
**Target Architecture: Clothing-Only Discovery & Referral Platform**  
**Environment State: Pre-Production / Staging Hardening (Not Live or Cloud-Provisioned)**

---

## 1. Executive Summary

LUMIÈRE is an atelier luxury fashion platform dedicated exclusively to clothing discovery and curated partner referrals. All customer purchases, payments, shipping, order fulfillment, and returns occur directly on official external partner brand websites. Internal customer checkout and mock payment workflows are strictly disabled by default.

The platform architecture comprises a suite of Java 21 / Spring Boot 3 microservices coordinated through an API Gateway, paired with a React 19 / TypeScript / Vite luxury discovery interface.

Following the Stage 9 remediation initiative (Fixes 1–5), the codebase has undergone comprehensive security hardening, session management overhaul, cleanup of legacy artifacts, and secret hygiene auditing.

> [!IMPORTANT]
> **Operational Boundary & Live Verification Disclaimer**  
> All security controls, service guardrails, and referral contracts have been validated through local unit, integration, and contract test suites (`TEST-ONLY` and `SOURCE-INSPECTED`). The platform **has not been deployed to a live public cloud cluster**, cloud infrastructure is not actively provisioned, and live third-party penetration testing has not occurred. Claims of "live production readiness" are strictly avoided until live staging validation is completed.

---

## 2. Core Platform Model & Business Rules

1. **Clothing-Only Discovery & Referral Showcase**:
   - The platform exclusively catalogs women's, men's, and bespoke luxury apparel.
   - Products feature high-resolution imagery, designer attribution, composition details, care guidelines, and verified external referral links (`affiliate_url`).
   - Customer acquisition redirects to official designer/brand websites for checkout, payment processing, fulfillment, and customer support.

2. **Pricing Policy (INR & Fallback Behavior)**:
   - All catalog pricing is denominated in Indian Rupees (INR, ₹).
   - If pricing is unverified, missing, zero, or pending boutique confirmation, the platform fails closed to display **"Price on Inquiry"** alongside an inquiry trigger. Hardcoded non-INR currencies (USD/EUR) or arbitrary zero amounts are prohibited.

3. **Internal Checkout & Mock Payment Guarding**:
   - Direct customer cart mutations (`POST/PUT/DELETE /api/v1/cart/**`), customer order creation (`POST /api/v1/orders`), and mock payment execution (`POST /api/v1/payments`) are disabled by default (`ENABLE_INTERNAL_CHECKOUT=false`).
   - The API Gateway enforces fail-closed HTTP 403 Forbidden responses on guarded routes.
   - The React frontend disables shopping bag UI actions and redirects `/cart`, `/checkout`, and `/orders/success` to `/collection` (`VITE_ENABLE_INTERNAL_CHECKOUT=false`).
   - Administrative query endpoints, historical order queries, and payment refund capabilities remain operational for administrative governance.

---

## 3. Remediation & Hardening Progress (Fixes 1–5)

| Milestone | Scope | Implementation Details | Verification Status |
| :--- | :--- | :--- | :--- |
| **Fix 1** | Default Admin Neutralization | Seeded default admin account deactivated via migration `V4__neutralize_default_admin.sql` (locked, disabled, scrambled password). Optional bootstrapping via `ADMIN_EMAIL` and `ADMIN_PASSWORD` through idempotent `AdminBootstrapService`. | `TEST-ONLY` (JUnit tests pass; DB schema validated) |
| **Fix 2** | API Gateway CORS Hardening | Replaced wildcard/permissive CORS with explicit environment-driven configuration (`CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_ORIGIN_PATTERNS`). Gateway fails closed on startup in `prod` profile if allowed origins are unspecified. | `TEST-ONLY` (Gateway unit & WebFlux tests pass) |
| **Fix 3** | Internal Checkout Guarding | Introduced `ENABLE_INTERNAL_CHECKOUT` and `VITE_ENABLE_INTERNAL_CHECKOUT`. Enforced fail-closed behavior across API Gateway `InternalCheckoutGuardFilter`, backend service layers (`CartService`, `OrderService`, `PaymentService`), and React frontend routes. | `TEST-ONLY` (Frontend route tests pass; backend service tests pass) |
| **Fix 4** | In-Memory Auth & Refresh Lifecycle | Completely purged tokens from `localStorage`/`sessionStorage`. Access tokens reside strictly in memory (Redux). Refresh tokens are stored in HTTP-only, `SameSite=Strict` cookies with cryptographically secure SHA-256 hash persistence, family revocation upon reuse, and CSRF header validation (`X-XSRF-TOKEN`). | `TEST-ONLY` (Vitest auth lifecycle tests pass; Spring Security filter tests pass) |
| **Fix 5** | Repo Cleanup, Secret Hygiene & Docs | Removed untracked/obsolete binary (`k3d.exe`), stale database dumps (`postgres_backup.sql`, `product_backup.sql`), redundant compose file (`committed_docker_compose.yml`), and `scratch/` directory. Hardened `.gitignore` and `.env.example`. Documented secret rotation guidelines and aligned platform identity. | `SOURCE-INSPECTED` & `TEST-ONLY` |

---

## 4. Database Migrations Status & Invariant

* **Active Migrations**:
  - `auth-service`: `V1__init_auth_schema.sql` through `V4__neutralize_default_admin.sql` (Active Flyway classpath).
  - `product-service`: `V1__init_product_schema.sql` through `V4__add_lumiere_clothing_attributes.sql` (Active Flyway classpath).
* **Proposed Migration**:
  - `V5__seed_lumiere_clothing_catalog.sql` is strictly preserved in `services/product-service/proposed-migrations/`.
  - **Status: PROPOSED / UNEXECUTED**. It has NOT been added to active Flyway migration paths and has NOT been run against any database. Execution requires formal schema review, staging dry-run validation, and explicit administrative authorization.

---

## 5. Configuration & Environment Variables

The following environment variables control runtime behavior and security postures:

* `ADMIN_EMAIL`: Email for initial administrator bootstrap (Auth Service).
* `ADMIN_PASSWORD`: Password for initial administrator bootstrap (Auth Service).
* `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins (API Gateway). Required in production.
* `CORS_ALLOWED_ORIGIN_PATTERNS`: Optional fallback regex pattern for allowed origins (API Gateway).
* `VITE_API_GATEWAY_URL`: Frontend API Gateway endpoint (`/api` or full HTTPS URL). Build fails closed if invalid.
* `ENABLE_INTERNAL_CHECKOUT`: Backend toggle for internal cart/checkout/payment endpoints (`false` by default).
* `VITE_ENABLE_INTERNAL_CHECKOUT`: Frontend toggle for internal cart/checkout routes (`false` by default).
* `COOKIE_SECURE`: Controls `Secure` flag on refresh cookie (must be `true` in production with HTTPS).
* `COOKIE_SAME_SITE`: Controls `SameSite` attribute on refresh cookie (`Strict` or `Lax`).
* `COOKIE_DOMAIN`: Domain attribute for refresh cookie (empty for current origin).
* `COOKIE_PATH`: Path restriction for refresh cookie (`/api/v1/auth`).

---

## 6. Remaining Staging & Production Readiness Milestones

Before any live public cloud deployment or production launch, the following gates must be completed:

1. **Secret Store Integration**:
   - Transition from local environment placeholders to external secret management (AWS Secrets Manager, HashiCorp Vault, or Kubernetes External Secrets Operator).
   - Rotate all historical development credentials (`DB_PASSWORD`, `JWT_SECRET`, default admin credentials).
2. **Authorized Catalog Migration**:
   - Review and execute `V5__seed_lumiere_clothing_catalog.sql` in a dedicated staging environment following the pre-import verification checklist and recovery runbook.
3. **Infrastructure & TLS Provisioning**:
   - Provision cloud resources via Terraform in AWS VPC/EKS.
   - Configure TLS certificates (Let's Encrypt / AWS ACM) and verify end-to-end HTTPS.
4. **Live Referral Link Validation**:
   - Audit external affiliate URLs for HTTP 200 availability and partner attribution parameters.
5. **Live End-to-End Penetration & Load Testing**:
   - Perform authenticated security audits, CORS/CSRF penetration testing against live endpoints, and high-concurrency traffic tests.
