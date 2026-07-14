# Order Service

The Order Management microservice for the Production-Grade E-Commerce Platform.

## Features
- Order lifecycle management (Creation, Confirmation, Failure).
- Translates Shopping Cart contents into immutable `Order` and `OrderItem` records.
- Synchronously checks and deducts inventory from the Product Service during creation.
- Synchronously clears the Shopping Cart from the Cart Service post-creation.
- Reacts asynchronously to Payment Service events (`COMPLETED`, `FAILED`) to progress the Order State Machine.

## Architecture
- **Database:** PostgreSQL (`order_db`) managed via Flyway.
- **Synchronous Communication:** Uses `spring-cloud-starter-openfeign` to call `cart-service` and `product-service`. Auth tokens are propagated manually via method parameters passing the Bearer token down.
- **Asynchronous Events (Publish):** `OrderCreatedEvent`, `OrderConfirmedEvent`, `OrderCancelledEvent` are published to `order.exchange`.
- **Asynchronous Events (Consume):** Listens to `order.payment.queue` bound to `payment.exchange` to receive `PaymentEvent`s.

## API Endpoints
- `GET /api/v1/orders` - Get current user's order history (Paginated).
- `GET /api/v1/orders/{id}` - Get details of a specific order.
- `POST /api/v1/orders` - Create a new order from the current shopping cart.

## Order Status State Machine
`PENDING` -> `CONFIRMED` (If Payment `COMPLETED`)
`PENDING` -> `PAYMENT_FAILED` (If Payment `FAILED`)

## Configuration
Requires the following environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`
- `PRODUCT_SERVICE_URL`, `CART_SERVICE_URL`
- `JWT_SECRET` (Must match the Auth Service to validate tokens).

## Running Locally
```bash
mvn clean install
mvn spring-boot:run
```
