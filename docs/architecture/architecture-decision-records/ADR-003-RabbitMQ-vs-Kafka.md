# ADR-003: Why RabbitMQ instead of Kafka

*   **ADR Number:** 003
*   **Title:** Selection of RabbitMQ for Asynchronous Messaging
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
Our microservices architecture requires asynchronous communication to decouple services, specifically for workflows like checkout (Order -> Payment -> Notification). We evaluated RabbitMQ and Apache Kafka.

## Problem Statement
We need a robust message broker that provides reliable message delivery, complex routing capabilities, and is relatively easy to operate for our specific e-commerce workloads, which are transactional rather than massive stream-processing events.

## Decision
We will use **RabbitMQ** as our primary message broker.

## Alternatives Considered
*   **Apache Kafka:** Rejected. While Kafka offers superior throughput and persistent event sourcing, it is overly complex for our current needs, has a steeper learning curve, and requires more operational overhead (Zookeeper/KRaft).
*   **AWS SQS/SNS:** Rejected to avoid hard vendor lock-in, maintaining a cloud-agnostic Kubernetes-centric deployment model.

## Comparison: RabbitMQ vs Kafka
*   **Performance:** Kafka handles millions of messages/sec (streaming). RabbitMQ handles tens of thousands/sec, which is more than sufficient for our transactional e-commerce events.
*   **Complexity:** RabbitMQ provides built-in, easy-to-use routing exchanges and DLQs. Kafka requires managing consumer offsets and partitions.
*   **Cost:** RabbitMQ generally requires less infrastructure footprint for low-to-medium throughput scenarios.
*   **Learning Curve:** RabbitMQ (AMQP) is easier for developers to adopt for standard pub/sub and point-to-point queues.
*   **Use Cases:** RabbitMQ excels at complex routing and task queues. Kafka excels at log aggregation, event sourcing, and real-time analytics.

## Advantages
*   Flexible routing (Direct, Topic, Fanout exchanges).
*   Built-in Dead Letter Queues (DLQ) for error handling.
*   Push-based model provides low-latency delivery.

## Disadvantages
*   Messages are deleted once consumed (no native event replay like Kafka).
*   Scaling RabbitMQ clusters is historically more fragile than scaling Kafka partitions.

## Risks
*   Message loss if queues are not configured as durable and messages are not persistent.

## Consequences
We must ensure all queues are declared durable and use publisher confirms. If we eventually require true event sourcing or clickstream analysis, we may need to introduce Kafka alongside RabbitMQ.

## Operational Impact
Moderate. Requires deploying and managing a RabbitMQ cluster via the RabbitMQ Cluster Kubernetes Operator.

## Performance Impact
Extremely low latency for message delivery, optimizing the asynchronous checkout flow.

## Security Impact
Requires TLS for data in transit and strict access control for virtual hosts.

## Cost Impact
Cost-effective for our scale.

## Future Considerations
If the platform scales to require big data analytics, log aggregation, or event replay, we will re-evaluate introducing Kafka for those specific pipelines.

## References
*   Enterprise Integration Patterns
