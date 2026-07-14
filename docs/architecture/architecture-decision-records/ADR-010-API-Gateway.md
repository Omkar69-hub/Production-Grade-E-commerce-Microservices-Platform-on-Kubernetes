# ADR-010: Why API Gateway

*   **ADR Number:** 010
*   **Title:** Adoption of Spring Cloud Gateway
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
Our e-commerce platform consists of multiple microservices. Exposing every microservice directly to the public internet creates a massive attack surface and forces the frontend client to manage complex routing and cross-origin (CORS) rules.

## Problem Statement
We need a single entry point into the system that can handle cross-cutting concerns like routing, authentication validation, and rate limiting, offloading these responsibilities from individual microservices.

## Decision
We will deploy an **API Gateway** (using Spring Cloud Gateway) as the single point of entry for all external traffic.

## Alternatives Considered
*   **Direct Client-to-Microservice:** Rejected. Forces the client to make multiple network calls for a single view, exposes internal architecture, and duplicates authentication logic across all services.
*   **NGINX / HAProxy:** Considered. While performant, they lack native integration with the Spring ecosystem (e.g., Eureka/Consul if used later) and are harder for Java developers to extend with custom pre/post filters.
*   **Kong / API6:** Considered. Excellent tools, but Spring Cloud Gateway is chosen to keep the tech stack homogenous (Java/Spring) for the development team.

## Advantages
*   **Routing:** Abstracts internal microservice routing. The client only calls `/api/v1/...` and the gateway handles internal DNS resolution.
*   **Authentication:** The gateway validates the JWT signature centrally. Backend services only need to trust the gateway and parse the forwarded claims.
*   **Rate Limiting:** Protects backend services from DDoS attacks or runaway clients using Redis-backed rate limiting.
*   **Logging & Tracing:** Centralized point to inject correlation IDs and log all incoming external requests.
*   **API Aggregation:** Can theoretically aggregate responses from multiple services to reduce client round-trips.

## Disadvantages
*   **Single Point of Failure:** If the gateway goes down, the entire system is inaccessible.
*   **Performance Bottleneck:** All traffic flows through the gateway, requiring careful scaling.

## Risks
*   Complex routing rules can become difficult to maintain over time.

## Consequences
All external traffic must route through the gateway. Microservices should not be exposed via Kubernetes LoadBalancers or NodePorts directly.

## Operational Impact
Moderate. Requires deploying and scaling the gateway pods highly available (HPA).

## Performance Impact
Introduces a slight network hop, but saves the backend services from having to execute expensive authentication verification logic repeatedly.

## Security Impact
Significantly improves security by narrowing the attack surface to a single protected entry point.

## Cost Impact
Requires dedicated compute resources for the gateway pods.

## Future Considerations
If API composition (Backend-For-Frontend) becomes too complex, we may split the gateway into multiple BFFs (e.g., one for Mobile, one for Web).

## References
*   Microservices Patterns: API Gateway Pattern
