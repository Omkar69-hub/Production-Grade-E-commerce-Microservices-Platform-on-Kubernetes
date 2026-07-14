# Exchange Design

## 1. The Domain Exchange
We use a single, unified Topic exchange named `ecommerce.domain.exchange`.

*   **Type:** `topic`
*   **Durable:** `true` (Survives broker restarts).
*   **Auto-delete:** `false`.

### Why a Single Topic Exchange?
Instead of creating an exchange per service (e.g., `order-exchange`, `product-exchange`), a single domain exchange simplifies configuration. Services route messages purely based on the **Routing Key**. This allows a consumer to bind a queue to `#` (all messages) for auditing purposes, or `order.#` for all order-related events, without needing to bind to multiple exchanges.

## 2. The Dead Letter Exchange (DLX)
*   **Name:** `ecommerce.dlx.exchange`
*   **Type:** `direct`
*   **Durable:** `true`

When a message is rejected by a consumer (and `requeue=false`), or expires due to TTL, it is routed here.
