# Security Guidelines

## 1. JWT & Stateless Auth
*   Microservices must remain completely stateless. Do not use HTTP Sessions (`HttpSession`).
*   The `SecurityContextHolder` is populated on every request by a stateless JWT filter.

## 2. Password Encryption
*   Passwords must be hashed using `BCryptPasswordEncoder` with a strength of at least 10 rounds.
*   Raw passwords must never be logged or returned in an API response.

## 3. Secrets Management
*   NEVER hardcode secrets, API keys, or database passwords in `application.yml` or source code.
*   Locally, use environment variables.
*   In Kubernetes, rely on `External Secrets Operator` to pull secrets from AWS Secrets Manager and inject them as environment variables.

## 4. OWASP Top 10 Protections
*   **SQL Injection:** Always use JPA/Hibernate or parameterized queries. Never concatenate strings for SQL.
*   **XSS:** React handles this natively by escaping output. APIs must also validate input aggressively.
*   **CSRF:** Disabled in our Spring Security config because we use stateless JWTs sent via Authorization headers, immune to standard CSRF attacks. (Note: Refresh tokens in cookies require `SameSite=Strict`).
*   **Least Privilege:** Kubernetes Pods run under dedicated Service Accounts (IRSA) with access limited strictly to the AWS resources they require.
