# Routing Key Strategy

## 1. Overview
Because we use a Topic exchange, routing keys are critical for filtering messages. 

## 2. Naming Convention
Routing keys follow a hierarchical dot-separated format:
*   **Format:** `{domain}.{entity}.{action}`
*   *Examples:*
    *   `order.checkout.created`
    *   `order.checkout.completed`
    *   `payment.transaction.failed`
    *   `product.catalog.updated`

## 3. Binding Examples
*   The Payment Service wants to know when an order is created. It binds `payment-service.order-created.queue` to the exchange with the routing key `order.checkout.created`.
*   An Audit Service wants to log *all* order events. It binds its queue with the routing key `order.#`.
