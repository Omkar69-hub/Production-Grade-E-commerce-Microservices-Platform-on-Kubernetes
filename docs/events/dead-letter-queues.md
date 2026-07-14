# Event Retry & Dead Letter Strategy

## 1. Consumer Retry Policy
When a consumer (e.g., Payment Service) receives a message but encounters a transient error (e.g., the database connection drops temporarily), it must retry.

*   **Initial Processing:** Spring AMQP is configured with a `RetryTemplate`.
*   **Local Retries:** The consumer will retry processing the message 3 times locally (in-memory) with an exponential backoff (e.g., 1s, 2s, 4s).
*   *Reasoning:* Fixes immediate network blips without network round-trips to the broker.

## 2. Delayed Retry Strategy (Future Expansion)
If all 3 local retries fail, the message is rejected. For advanced setups, we can route the rejected message to a "Retry Exchange" with a TTL (e.g., 5 minutes), which then routes it back to the main queue. For MVP, we route directly to the DLQ after local retries are exhausted.

## 3. Dead Letter Queues (DLQ)
If a message cannot be processed after all retries (or if it throws a fatal non-transient error like `JsonParseException`), it is rejected with `requeue=false`.
*   The broker routes the message to `ecommerce.dlx.exchange`.
*   It is placed into a specific DLQ, e.g., `payment-service.order-created.queue.dlq`.

## 4. DLQ Management
*   SREs monitor DLQ depths via Grafana.
*   If a bug caused a DLQ spike, developers deploy a fix, and SREs use a script to "shovel" messages from the DLQ back into the primary queue for reprocessing.
