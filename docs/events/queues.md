# Queue Design

## 1. Naming Convention
Queues are named according to the consumer service and the event they intend to process.
*   **Format:** `{service-name}.{event-action}.queue`
*   *Example:* `payment-service.order-created.queue`
*   *Example:* `notification-service.payment-completed.queue`

## 2. Queue Properties
All application queues MUST be configured with the following properties:
*   **Type:** `quorum` (Ensures data is replicated across RabbitMQ nodes).
*   **Durable:** `true` (Survives broker restarts).
*   **x-dead-letter-exchange:** `ecommerce.dlx.exchange`
*   **x-dead-letter-routing-key:** `{queue-name}.dlq` (e.g., `payment-service.order-created.queue.dlq`).

## 3. Competing Consumers
Multiple instances (Pods) of a microservice will connect to the *same* queue. RabbitMQ will round-robin messages between the pods, allowing us to scale event processing horizontally.
