# Microservices Source Code

This directory contains the source code for all microservices in the platform.

## Services
*   `api-gateway/`: Spring Cloud Gateway for routing and authentication.
*   `auth-service/`: JWT Issuance and User Management.
*   `product-service/`: Product Catalog Management.
*   `cart-service/`: Redis-backed shopping cart.
*   `order-service/`: Order orchestration and event publishing.
*   `payment-service/`: Payment processing (Mocked Stripe).
*   `notification-service/`: Email/SMS event listener.
*   `frontend/`: React SPA.

## Tech Stack
*   Java 21, Spring Boot 3
*   React 19, TypeScript
*   Docker (Multi-stage builds)
