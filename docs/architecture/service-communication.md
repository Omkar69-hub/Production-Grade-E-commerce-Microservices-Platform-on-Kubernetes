# Service Communication Strategy

## 1. Communication Paradigms
The platform utilizes a hybrid communication approach, leveraging both synchronous REST APIs for immediate operations and asynchronous messaging for eventual consistency and decoupling.

## 2. Synchronous Communication (REST APIs)
*   **Protocol:** HTTP/1.1 with JSON payloads.
*   **Use Cases:** Client-facing interactions (e.g., adding to cart, fetching products), and read-heavy inter-service calls where immediate consistency is required.
*   **Resiliency (Circuit Breakers):** Spring Cloud CircuitBreaker (Resilience4j) is used for all synchronous calls. If a downstream service is unresponsive, the circuit opens, preventing cascading failures and serving a fallback response.
*   **Timeouts & Retries:** Strict timeouts (e.g., 2 seconds) are enforced. Exponential backoff retries are configured for transient HTTP 5xx errors.

## 3. Asynchronous Communication (RabbitMQ)
*   **Protocol:** AMQP over RabbitMQ.
*   **Use Cases:** Fire-and-forget events where immediate response is not required (e.g., Order Placed Event, Payment Processed Event).
*   **Event Flow Example (Checkout):**
    1.  Order Service receives POST request. It validates the request and creates a "PENDING" order.
    2.  Order Service publishes an `OrderCreatedEvent` to RabbitMQ.
    3.  Payment Service consumes the event, processes payment, and publishes `PaymentCompletedEvent` (or Failed).
    4.  Order Service consumes `PaymentCompletedEvent` and updates order status to "PAID".
    5.  Notification Service consumes `PaymentCompletedEvent` and sends an email.
    6.  Cart Service consumes `PaymentCompletedEvent` and clears the user's cart.

## 4. Idempotency & Message Delivery
*   **At-Least-Once Delivery:** RabbitMQ ensures messages are delivered. Consumers MUST be idempotent.
*   **Idempotency Keys:** Every message contains a unique `eventId`. Consumers track processed `eventId`s (typically in a database table or Redis cache) to ignore duplicate messages.

## 5. Dead Letter Queues (DLQ)
Messages that fail to be processed after a configured number of retries (e.g., due to parsing errors or persistent downstream failures) are routed to a DLQ. SREs can inspect the DLQ, fix the underlying issue, and replay the messages without data loss.

## 6. API Versioning
APIs are versioned via URI path (e.g., `/api/v1/products`). Breaking changes require a new version (v2) while v1 is deprecated gracefully. Internal inter-service calls use internal headers for versioning.
