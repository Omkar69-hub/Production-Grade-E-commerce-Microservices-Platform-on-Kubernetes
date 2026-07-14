# Notification Service

The Notification and Messaging microservice for the Production-Grade E-Commerce Platform.

## Features
- Listens to multiple topic exchanges (`auth.exchange`, `order.exchange`, `payment.exchange`) to broadcast emails or SMS to users based on system events.
- Employs a Dead Letter Queue (DLQ) strategy for notification failures (e.g. SMTP server down).
- Sends Welcome Emails on `UserRegisteredEvent`.
- Sends Order Confirmation Emails on `OrderConfirmedEvent`.
- Sends Payment Failed Emails on `OrderCancelledEvent` or `PaymentFailedEvent`.
- Fully decoupled, stateless, and relies on Spring Mail.

## Architecture
- **Event Consumer:** Subscribes to AMQP queues using Spring AMQP (`@RabbitListener`).
- **Database:** None (Stateless).
- **Communication:** Retrieves missing user context (like email addresses) dynamically via OpenFeign client calls to the Auth Service if the event does not contain it.

## Configuration
Requires the following environment variables:
- `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `AUTH_SERVICE_URL`

## Local Development (MailHog)
By default, the `dev` profile uses `localhost:1025` for SMTP. You can run MailHog locally using Docker to capture outbound emails without actually sending them:
```bash
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```
Access the MailHog UI at `http://localhost:8025`.

## Running Locally
```bash
mvn clean install
mvn spring-boot:run
```
