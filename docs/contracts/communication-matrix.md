# Communication Matrix

| Source Service | Target Service | Protocol | Pattern | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | *All Services* | HTTP/REST | Sync | Route external client requests. |
| **Order Service** | **Product Service** | HTTP/REST | Sync | Verify product existence, price, and stock before creating an order. |
| **Order Service** | **Cart Service** | HTTP/REST | Sync | Fetch user's cart contents during checkout. |
| **Order Service** | **RabbitMQ** | AMQP | Async Pub | Publish `OrderCreated` event. |
| **Payment Service**| **RabbitMQ** | AMQP | Async Sub | Consume `OrderCreated` to initiate payment. |
| **Payment Service**| **RabbitMQ** | AMQP | Async Pub | Publish `PaymentCompleted` or `PaymentFailed`. |
| **Order Service** | **RabbitMQ** | AMQP | Async Sub | Consume `PaymentCompleted`/`Failed` to update order status. |
| **Cart Service** | **RabbitMQ** | AMQP | Async Sub | Consume `PaymentCompleted` to clear the user's cart. |
| **Notification** | **RabbitMQ** | AMQP | Async Sub | Consume `PaymentCompleted`/`Failed` to send emails. |
