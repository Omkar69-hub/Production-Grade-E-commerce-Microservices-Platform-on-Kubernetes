# API Gateway

The edge routing service for the Production-Grade E-Commerce Platform.

## Features
- Provides a single unified entry point for all frontend and mobile applications.
- Routes requests to the appropriate backend microservices based on path predicates (`/api/v1/auth/**`, `/api/v1/products/**`, etc.).
- Implements CORS (Cross-Origin Resource Sharing) globally so frontend applications (e.g. React/Vite) can safely communicate with the platform.
- Implements Circuit Breaking using Resilience4j to gracefully degrade if the `auth-service` or `product-service` become unresponsive.
- Operates statelessly on the Reactor/Netty WebFlux stack for high throughput and low latency.

## Architecture
- **Framework:** Spring Cloud Gateway
- **Resilience:** Spring Cloud CircuitBreaker (Resilience4j)
- **Security:** Security is delegated downstream. The Gateway simply forwards the `Authorization` header to the specific microservices which then invoke their respective Servlet `JwtFilter` to validate claims.

## Endpoints / Routing Table
| Path | Downstream Service |
|------|--------------------|
| `/api/v1/auth/**` | `auth-service` |
| `/api/v1/products/**` | `product-service` |
| `/api/v1/cart/**` | `cart-service` |
| `/api/v1/orders/**` | `order-service` |
| `/api/v1/payments/**` | `payment-service` |

## Configuration
Requires the following environment variables (defaults to localhost ports):
- `AUTH_SERVICE_URL`
- `PRODUCT_SERVICE_URL`
- `CART_SERVICE_URL`
- `ORDER_SERVICE_URL`
- `PAYMENT_SERVICE_URL`

### CORS Configuration
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://lumiere.com,https://admin.lumiere.com`).
  - **Development Default:** When running under the `dev` profile without this variable, the gateway permits standard localhost origins (`http://localhost:80`, `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:80`, `http://127.0.0.1:3000`, `http://127.0.0.1:5173`).
  - **Production Requirement:** In the `prod` profile, explicit allowed origins are mandatory. Localhost fallback is strictly disabled, and the gateway will refuse to start if no allowed origins are configured.
- `CORS_ALLOWED_ORIGIN_PATTERNS`: Optional comma-separated regex/wildcard origin patterns (e.g., `https://*.lumiere.com`) retained for backward compatibility.

### Feature Flags
- `ENABLE_INTERNAL_CHECKOUT`: Controls whether internal cart mutations, direct order creation, status simulation, and mock payment initiation are permitted at the edge.
  - **Default:** `false` (disabled by default; safe even when environment variable is omitted).
  - **Behavior:** Enforced by `InternalCheckoutGuardFilter` (`order = -10`). When disabled, customer mutations (`POST/PUT/DELETE /api/v1/cart/**`, `POST /api/v1/orders/**`, `POST /api/v1/payments`) are intercepted fail-closed and return HTTP 403 Forbidden with standard `ErrorResponse` JSON. Historical reads (`GET`), admin refunds, authentication, catalog browsing, and health checks remain fully functional.
  - **Production Requirement:** Must remain `false` for LUMIÈRE production deployments.

## Running Locally
```bash
mvn clean install
mvn spring-boot:run
```
