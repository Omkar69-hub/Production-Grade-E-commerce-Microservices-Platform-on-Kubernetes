# Event Catalog & JSON Schemas

All events are published as JSON payloads. Every event MUST include standard metadata (Idempotency Key, Timestamp, Version).

## 1. OrderCreated
*   **Routing Key:** `order.checkout.created`
*   **Producer:** Order Service
*   **Consumers:** Payment Service
*   **Payload Schema:**
```json
{
  "eventId": "uuid-v4", // Idempotency Key
  "eventVersion": "1.0",
  "timestamp": "2026-07-13T12:00:00Z",
  "data": {
    "orderId": "uuid-v4",
    "userId": "uuid-v4",
    "totalAmount": 150.50,
    "paymentMethodId": "uuid-v4"
  }
}
```

## 2. PaymentCompleted
*   **Routing Key:** `payment.transaction.completed`
*   **Producer:** Payment Service
*   **Consumers:** Order Service, Notification Service, Cart Service
*   **Payload Schema:**
```json
{
  "eventId": "uuid-v4",
  "eventVersion": "1.0",
  "timestamp": "2026-07-13T12:05:00Z",
  "data": {
    "orderId": "uuid-v4",
    "transactionId": "tx-987654321",
    "status": "SUCCESS"
  }
}
```

## 3. PaymentFailed
*   **Routing Key:** `payment.transaction.failed`
*   **Producer:** Payment Service
*   **Consumers:** Order Service, Notification Service
*   **Payload Schema:**
```json
{
  "eventId": "uuid-v4",
  "eventVersion": "1.0",
  "timestamp": "2026-07-13T12:05:00Z",
  "data": {
    "orderId": "uuid-v4",
    "reason": "Insufficient Funds"
  }
}
```

## 4. ProductUpdated
*   **Routing Key:** `product.catalog.updated`
*   **Producer:** Product Service
*   **Consumers:** None currently (used for cache invalidation or future search indexing).
