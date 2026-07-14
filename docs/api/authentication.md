# Authentication & Authorization Architecture

## 1. JWT Flow Overview
The platform utilizes stateless JSON Web Tokens (JWT) for authentication.
1.  Client submits credentials (`email`/`password`) to `/api/v1/auth/login`.
2.  Auth Service verifies credentials against PostgreSQL.
3.  Auth Service generates an `access_token` (JWT) and a `refresh_token` (opaque string).
4.  Client includes the `access_token` in the `Authorization: Bearer <token>` header for subsequent requests.
5.  API Gateway intercepts requests, validates the JWT signature, and drops invalid requests (401 Unauthorized).
6.  API Gateway forwards the validated request (with claims passed in internal headers) to backend microservices.

## 2. Token Lifetimes
*   **Access Token (JWT):** 15 minutes. Short-lived to minimize the risk of token theft.
*   **Refresh Token:** 7 days. Stored as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie in the browser to prevent XSS exfiltration.

## 3. Refresh Token Flow
1.  When the `access_token` expires, the client calls `/api/v1/auth/refresh`.
2.  The browser automatically attaches the `refresh_token` HttpOnly cookie.
3.  Auth Service verifies the refresh token against the Redis session store (to ensure it hasn't been revoked).
4.  If valid, Auth Service returns a new `access_token` and rotates the `refresh_token`.

## 4. User Roles (RBAC)
*   **`CUSTOMER`:** Standard authenticated user. Can manage their own cart, place orders, and view their own order history.
*   **`ADMIN`:** Platform administrator. Can add/modify products, view all users' orders, and access administrative dashboards.
*   **`SYSTEM`:** Internal machine-to-machine role for scheduled jobs or external integrations.

## 5. Authorization Rules
Authorization happens at two levels:
*   **API Gateway (Coarse-grained):** Ensures routes like `/api/v1/admin/**` can only be accessed by tokens containing the `ADMIN` role.
*   **Microservice (Fine-grained):** Ensures a `CUSTOMER` can only fetch orders where `order.userId == jwt.sub` (preventing IDOR vulnerabilities).

## 6. Token Revocation
Because JWTs are stateless, immediate revocation of an *access token* is impossible. However, upon user logout or password reset, the *refresh token* is immediately deleted from Redis, forcing the user to re-authenticate when their 15-minute access token expires.
