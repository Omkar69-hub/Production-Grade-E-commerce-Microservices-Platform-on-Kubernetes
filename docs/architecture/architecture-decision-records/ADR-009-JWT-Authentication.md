# ADR-009: Why JWT Authentication

*   **ADR Number:** 009
*   **Title:** Adoption of JSON Web Tokens (JWT) for Authentication
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
Our microservices architecture requires a mechanism to authenticate users and authorize requests across multiple independent services without introducing a centralized bottleneck.

## Problem Statement
Traditional session-based authentication requires maintaining state on the server (e.g., in memory or a shared Redis cluster) and looking up the session ID on every request. This couples services and adds latency.

## Decision
We will use **JSON Web Tokens (JWT)** for stateless authentication and authorization.

## Alternatives Considered
*   **Session Authentication:** Rejected. Maintaining server-side session state violates the stateless principle of our microservices and complicates horizontal scaling.
*   **OAuth2 / OIDC:** Considered. While OAuth2 is an industry standard, implementing a full authorization server is overkill for our current MVP scope. We may adopt Keycloak (OIDC) in the future, which also uses JWTs under the hood.
*   **API Keys:** Rejected for end-users as they lack expiration and granular claim management. API keys will only be used for external machine-to-machine integrations.

## Advantages
*   **Stateless:** Microservices can cryptographically verify the JWT locally (using a shared public key) without calling the Auth service or querying a database.
*   **Scalable:** No server-side session state to synchronize across pods.
*   **Rich Payload:** JWTs carry user claims (roles, user ID) directly in the token, eliminating the need to query the database for user roles on every request.

## Disadvantages
*   **Token Invalidation:** JWTs cannot be easily revoked before they expire because there is no central session store.
*   **Payload Size:** JWTs are larger than simple session IDs, slightly increasing network payload size.

## Risks
*   **Security:** If the private signing key is compromised, attackers can forge tokens.
*   **XSS/CSRF:** Storing JWTs insecurely on the frontend exposes them to theft.

## Consequences
We must implement a short expiration time for access tokens (e.g., 15 minutes) and use refresh tokens (stored securely in HttpOnly cookies) to mitigate the revocation issue. The API Gateway will handle token validation.

## Operational Impact
Low. The Auth service manages key rotation.

## Performance Impact
Positive. Eliminates network hops for authentication verification.

## Security Impact
Requires strict key management and secure frontend storage practices.

## Cost Impact
None.

## Future Considerations
Migrate to a dedicated Identity and Access Management (IAM) solution like Keycloak if we need to support social logins or third-party OAuth integrations.

## References
*   RFC 7519 (JSON Web Token)
