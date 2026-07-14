# Logging Guidelines

## 1. Structured JSON Logging
All applications output logs in JSON format to standard out (`stdout`). We do not write to log files on disk in Kubernetes.
*   Fluent Bit reads `stdout`, enriches logs with Kubernetes metadata, and ships them to Loki.

## 2. Mandatory Context (MDC)
Every log line must include:
*   `traceId` (Injected by Micrometer Tracing/Brave)
*   `spanId` (Injected by Micrometer Tracing/Brave)
*   `userId` (Extracted from JWT and added to SLF4J MDC)

## 3. Log Levels
*   **ERROR:** System failures requiring immediate attention (e.g., DB down). Triggers PagerDuty.
*   **WARN:** Recoverable errors, retries, or suspicious user behavior (e.g., 5 failed logins).
*   **INFO:** Significant lifecycle events (e.g., Application started, Order #123 completed). Do not log every request at INFO.
*   **DEBUG:** Detailed flow information. Disabled in production. Used for local troubleshooting.

## 4. Sensitive Data Masking
*   **NEVER log:** Passwords, full credit card numbers, CVVs, JWTs, or raw API keys.
*   Use standard masking utilities from `common-library` to redact PII (Personally Identifiable Information) before logging.
