# Payment Service

The Payment Processing microservice for the Production-Grade E-Commerce Platform.

## Features
- Manages the financial state machine of an order (`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`).
- Intercepts asynchronous events (`OrderCreatedEvent`) to initialize payment records.
- Provides REST APIs to manually trigger payment capture using mocked payment tokens (e.g., Stripe/PayPal simulation).
- Emits events (`PaymentCompletedEvent`, `PaymentFailedEvent`) to inform the Order Service to finalize or reject orders.
- Supports administrative refunds.

## Architecture
- **Database:** PostgreSQL (`payment_db`) managed via Flyway.
- **Event Consumer:** Listens to `order.exchange` for `order.created` routing keys.
- **Event Publisher:** Publishes to `payment.exchange`.
- **Payment Mocking:** The `processPayment` method includes a basic mock validator. Passing a token containing the word `"fail"` will force a `FAILED` payment state. Otherwise, it will succeed.

## API Endpoints
- `GET /api/v1/payments/orders/{orderId}` - Check payment status for an order.
- `POST /api/v1/payments` - Process a payment (Submit Payment Method / Token).
- `POST /api/v1/payments/orders/{orderId}/refund` - Refund an order (Admin Only).

## Configuration
Requires the following environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`
- `JWT_SECRET` (Must match the Auth Service to validate tokens).

## Running Locally
```bash
mvn clean install
mvn spring-boot:run
```
