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

## Running Locally
```bash
mvn clean install
mvn spring-boot:run
```
