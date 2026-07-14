# Cart Service

The Shopping Cart microservice for the Production-Grade E-Commerce Platform.

## Features
- Manages user shopping carts utilizing Redis for blazing-fast operations and transient storage.
- Inter-service communication with Product Service via OpenFeign to validate pricing, availability, and active status.
- Event Publishing to RabbitMQ (`CartCreated`, `CartUpdated`, `CartCleared`).
- Automatic TTL expiration for abandoned carts (30 days default).

## Architecture
- **State Store:** Redis (No relational database). Key structure uses the `cart` namespace mapped to the `userId`.
- **Synchronous Communication:** Uses `spring-cloud-starter-openfeign` to blockingly verify product inventory and price during `ADD` or `UPDATE` operations to prevent invalid items from entering the cart.
- **Asynchronous Communication:** Emits domain events to `cart.exchange` for analytical tracking or promotional follow-ups (abandoned cart emails).

## API Endpoints
- `GET /api/v1/cart` - Get current user's cart.
- `GET /api/v1/cart/summary` - Get quick summary (item count, subtotal) for UI header badges.
- `POST /api/v1/cart/items` - Add item to cart.
- `PUT /api/v1/cart/items/{itemId}` - Update item quantity.
- `DELETE /api/v1/cart/items/{itemId}` - Remove item from cart.
- `DELETE /api/v1/cart` - Clear entire cart.

## Configuration
Requires the following environment variables:
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`
- `PRODUCT_SERVICE_URL` (Internal cluster URL to resolve the Product Service).
- `JWT_SECRET` (Must match the Auth Service to validate tokens).

## Running Locally
```bash
mvn clean install
mvn spring-boot:run
```
