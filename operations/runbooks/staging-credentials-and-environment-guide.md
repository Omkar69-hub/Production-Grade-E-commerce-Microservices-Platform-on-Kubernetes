# LUMIÈRE — Staging Credentials & Environment Setup Guide

**Architecture:** Cloudflare Pages (Frontend) + Oracle Cloud Always Free Ampere A1 (Backend)  
**Security Profile:** Private Staging Cluster (Zero Development Credentials, Fail-Closed Security)  
**Budget:** ₹0 First  

---

## 1. Overview & Architecture Boundary

The LUMIÈRE staging environment operates with a decoupled edge-and-cloud architecture:

1. **Frontend (Cloudflare Pages):**
   - Serves React 18 SPA as static assets compiled by Vite.
   - Operates on Cloudflare's global edge network (e.g., `https://lumiere-staging.pages.dev` or custom domain).
   - Connects to the backend via HTTPS XHR/Fetch requests.
   - SPA routing is managed by [`services/frontend/public/_redirects`](file:///c:/Users/Asus/OneDrive/Desktop/Production-Grade%20E-Commerce%20Microservices%20Platform%20on%20Kubernetes/Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes/services/frontend/public/_redirects).
2. **Backend (Oracle Cloud Always Free Ampere A1 ARM64 VM):**
   - Hosts all 7 backend microservices (`api-gateway`, `auth`, `product`, `cart`, `order`, `payment`, `notification`).
   - Runs supporting data tiers: PostgreSQL 16, Redis 7, RabbitMQ 3, and Mailpit.
   - Orchestrated via [`docker/docker-compose.staging.yml`](file:///c:/Users/Asus/OneDrive/Desktop/Production-Grade%20E-Commerce%20Microservices%20Platform%20on%20Kubernetes/Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes/docker/docker-compose.staging.yml).
   - Completely isolated: PostgreSQL, Redis, and RabbitMQ have **zero public host ports exposed**.
   - API Gateway binds to `127.0.0.1:8080`, intended to sit behind a Cloudflare Tunnel or local Nginx reverse proxy.

---

## 2. Environment Variables Specification

The staging environment strictly enforces fail-closed variable interpolation (`:?`). The following exact variable names are required:

| Variable Name | Required By | Format & Constraints | Purpose |
|---|---|---|---|
| `DB_USER` | `postgres`, all microservices | Alphanumeric identifier (e.g., `lumiere_staging_user`) | PostgreSQL application user |
| `DB_PASSWORD` | `postgres`, all microservices | High-entropy alphanumeric (48+ chars, >280 bits entropy) | PostgreSQL user password |
| `DB_NAME` | `postgres`, all microservices | Alphanumeric (default: `ecommerce_db`) | Primary database name |
| `REDIS_PASSWORD` | `redis`, `auth`, `product`, `cart` | High-entropy alphanumeric (48+ chars, >280 bits entropy) | Redis `requirepass` auth token |
| `RABBITMQ_USER` | `rabbitmq`, microservices | Alphanumeric identifier (e.g., `lumiere_staging_rabbit`) | Dedicated message broker user |
| `RABBITMQ_PASSWORD` | `rabbitmq`, microservices | High-entropy alphanumeric (48+ chars, >280 bits entropy) | RabbitMQ application password |
| `JWT_SECRET` | All 7 microservices | High-entropy alphanumeric (64 chars, >380 bits entropy, min 32 UTF-8 bytes) | HMAC-SHA256 JWT signing key |
| `COOKIE_SECURE` | `auth-service` | Boolean (`true`) | Enforces `Secure` flag on refresh & CSRF cookies |
| `COOKIE_SAME_SITE` | `auth-service` | `None` (cross-site) or `Lax` (shared apex domain) | Browser cookie handling policy |
| `CORS_ALLOWED_ORIGINS`| `api-gateway`, `auth-service` | Comma-separated HTTPS URLs (e.g., `https://lumiere-staging.pages.dev`) | Whitelisted browser frontend origins |
| `CORS_ALLOWED_ORIGIN_PATTERNS`| `api-gateway` | Wildcard pattern (e.g., `https://*.pages.dev`) | Allows dynamic Cloudflare preview builds |
| `SPRING_PROFILES_ACTIVE` | All microservices | String (`prod`) | Enforces fail-closed production security profile |
| `ADMIN_EMAIL` | `auth-service` | Valid email address | Optional bootstrap admin account email |
| `ADMIN_PASSWORD` | `auth-service` | High-entropy alphanumeric (48+ chars, >280 bits entropy) | Optional bootstrap admin account password |
| `ENABLE_INTERNAL_CHECKOUT` | `api-gateway`, `cart`, `order`, `payment` | Boolean (`false`) | Enforces luxury editorial referral model |
| `JAVA_OPTS` | All Java microservices | JVM flags (`-XX:+UseZGC -Xms128m -Xmx256m`) | Memory tuning for OCI Ampere A1 (ARM64) |

---

## 3. Local Secret Generation Script

A dedicated PowerShell utility is located at [`scripts/generate-staging-secrets.ps1`](file:///c:/Users/Asus/OneDrive/Desktop/Production-Grade%20E-Commerce%20Microservices%20Platform%20on%20Kubernetes/Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes/scripts/generate-staging-secrets.ps1).

### 3.1 Security Principles of the Generator
- **Operating-System CSPRNG:** Uses `[System.Security.Cryptography.RandomNumberGenerator]` to produce high-entropy cryptographic bytes.
- **Strict Character Safety:** Uses alphanumeric charsets (`[A-Za-z0-9]`) to avoid shell metacharacters (`$`, `"`, `'`, `#`, `\`, newlines) that break Docker Compose, bash, or Spring property parsers.
- **Zero Information Leak:** Never echoes, logs, or prints secret values to the terminal or console.
- **Windows NTFS Permission Hardening:** Automatically executes `icacls.exe` to strip inherited permissions and grant Full Control strictly to the current Windows user (`$env:USERNAME`).
- **Overwrite Protection:** Aborts with an error if `.env.staging` already exists unless explicitly passed the `-Force` switch.

### 3.2 Execution Instructions

Open a PowerShell terminal on Windows 11 and run:

```powershell
# Step 1: Navigate to repository root
cd "c:\Users\Asus\OneDrive\Desktop\Production-Grade E-Commerce Microservices Platform on Kubernetes\Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes"

# Step 2: Validate generation logic without writing to disk
powershell -ExecutionPolicy Bypass -File .\scripts\generate-staging-secrets.ps1 -DryRun

# Step 3: Generate the actual .env.staging file
powershell -ExecutionPolicy Bypass -File .\scripts\generate-staging-secrets.ps1 `
    -StagingFrontendOrigin "https://lumiere-staging.pages.dev" `
    -CustomStagingDomain "https://staging.yourdomain.com" `
    -AdminEmail "admin@staging.lumiere.internal"
```

### 3.3 Overwrite Protection & Safe Re-generation
If `.env.staging` already exists, running the script will safely fail:
```text
Target file '...\.env.staging' already exists. To prevent accidental secret loss or credential divergence, this script will not overwrite it without the -Force switch.
```
To explicitly regenerate all credentials:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\generate-staging-secrets.ps1 -Force
```

---

## 4. Cloudflare Pages Configuration Guide

Configure the frontend build settings in the **Cloudflare Dashboard** (*Workers & Pages → Pages → Create Project*):

### 4.1 Build & Deployment Settings

| Setting | Value | Notes |
|---|---|---|
| **Framework preset** | `Vite` | Select Vite from the dropdown |
| **Root directory** | `services/frontend` | Tells Cloudflare to run inside the frontend subfolder |
| **Build command** | `npm run build` | Compiles TypeScript and runs Vite production build |
| **Build output directory** | `dist` | Contains compiled HTML, CSS, JS, and `_redirects` |
| **Node.js Version** | `20` or `22` | Set `NODE_VERSION=20` in Environment Variables |

### 4.2 Cloudflare Pages Environment Variables

Set in **Project Settings → Environment Variables**:

| Variable | Staging Value | Purpose |
|---|---|---|
| `VITE_API_GATEWAY_URL` | `https://api-staging.yourdomain.com` | Target backend URL embedded into client-side JS bundle |
| `VITE_ENABLE_INTERNAL_CHECKOUT` | `false` | Disables internal cart, checkout, and mock payment buttons |
| `NODE_VERSION` | `20` | Specifies modern Node runtime for Cloudflare build container |

> [!CAUTION]
> **CRITICAL SECURITY RULE: NEVER PUT SECRETS IN CLOUDFLARE PAGES**  
> Every variable starting with `VITE_*` is embedded directly into client-side JavaScript (`dist/assets/*.js`) during build and is completely visible to any website visitor via browser Developer Tools.
> 
> **NEVER** configure `DB_PASSWORD`, `REDIS_PASSWORD`, `RABBITMQ_PASSWORD`, `JWT_SECRET`, or `ADMIN_PASSWORD` in Cloudflare Pages.

### 4.3 SPA Deep Routing Rule (`_redirects`)
Vite automatically copies [`services/frontend/public/_redirects`](file:///c:/Users/Asus/OneDrive/Desktop/Production-Grade%20E-Commerce%20Microservices%20Platform%20on%20Kubernetes/Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes/services/frontend/public/_redirects) into `dist/`.  
Content:
```text
/*    /index.html   200
```
This instructs Cloudflare Pages to serve `index.html` for any client-side route (`/collection`, `/editorial`, `/login`) while returning an HTTP 200 status code, preventing 404 errors on browser reload.

---

## 5. Backend Deployment on OCI Always Free (Ampere A1)

### 5.1 Prerequisites on the OCI Ampere VM
1. An OCI Compute Instance running **Ubuntu 22.04 LTS (AArch64)** or **Oracle Linux 9 (AArch64)** with the `VM.Standard.A1.Flex` shape (e.g., 4 OCPU, 24 GB RAM).
2. Docker Engine and Docker Compose v2 installed:
   ```bash
   sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
   sudo usermod -aG docker $USER
   ```

### 5.2 Securely Transferring Staging Configuration
Transfer `.env.staging` and the repository to the OCI VM using SSH/SCP:

```bash
# From your local machine:
scp .env.staging <oci-user>@<oci-vm-ip>:/opt/lumiere/.env.staging
```

On the OCI VM, restrict permissions:
```bash
chmod 600 /opt/lumiere/.env.staging
```

### 5.3 Launching the Staging Backend
Inside the repository directory on the OCI VM:

```bash
# Validate configuration and variable interpolation without starting containers
docker compose --env-file /opt/lumiere/.env.staging -f docker/docker-compose.staging.yml config --quiet

# Launch the staging backend stack in detached mode
docker compose --env-file /opt/lumiere/.env.staging -f docker/docker-compose.staging.yml up -d
```

### 5.4 Verifying Service Health
Check container health and startup logs:

```bash
# Verify all 11 containers report "healthy"
docker compose -f docker/docker-compose.staging.yml ps

# Inspect API Gateway logs
docker compose -f docker/docker-compose.staging.yml logs -f api-gateway
```

### 5.5 Mailpit Web UI Access (Local Loopback)
Because Mailpit Web UI is bound to `127.0.0.1:8025`, it is not exposed publicly. To view emails captured during staging:
```bash
# Establish an SSH port forward from your local workstation:
ssh -L 8025:localhost:8025 <oci-user>@<oci-vm-ip>
# Open http://localhost:8025 in your local browser
```

---

## 6. Secret Rotation & Incident Recovery Procedures

### 6.1 Rotating Database Passwords
1. Generate new credentials using `scripts/generate-staging-secrets.ps1 -Force`.
2. Update user password inside PostgreSQL:
   ```bash
   docker exec -it staging-postgres psql -U <current_user> -d postgres -c "ALTER USER lumiere_staging_user WITH PASSWORD '<new_password>';"
   ```
3. Update `.env.staging` and restart backend services:
   ```bash
   docker compose --env-file /opt/lumiere/.env.staging -f docker/docker-compose.staging.yml up -d --force-recreate
   ```

### 6.2 Rotating the JWT Signing Key
1. Updating `JWT_SECRET` in `.env.staging` and restarting `auth-service` and `api-gateway` immediately invalidates all active user sessions.
2. In-flight access tokens and refresh tokens will be rejected. Users must log in again to establish a new session family.

### 6.3 Rotating Redis or RabbitMQ Passwords
1. Update credentials in `.env.staging`.
2. Restart infrastructure and dependent microservices:
   ```bash
   docker compose --env-file /opt/lumiere/.env.staging -f docker/docker-compose.staging.yml up -d --force-recreate
   ```

---

## 7. Operational Compliance Checklist

- [x] High-entropy credentials (>256 bits) generated via OS CSPRNG.
- [x] Zero secrets printed to terminal, logs, reports, or committed to Git.
- [x] `.env.staging` strictly ignored by `.gitignore` (`.gitignore:44`).
- [x] Cloudflare Pages `public/_redirects` SPA rewrite verified.
- [x] Internal checkout strictly disabled (`ENABLE_INTERNAL_CHECKOUT=false`).
- [x] Database, Redis, and RabbitMQ isolated from public host ports.
- [x] MailHog replaced with native ARM64 Mailpit (`axllent/mailpit`).
- [x] Proposed catalog migration V5 preserved unexecuted outside Flyway classpath.
