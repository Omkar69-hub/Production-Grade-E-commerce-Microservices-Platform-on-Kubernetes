# RabbitMQ Topology

## 1. Overview
The platform utilizes RabbitMQ 4 as the primary message broker. We use a **Topic Exchange** topology for almost all domain events, allowing maximum flexibility for future consumers.

## 2. Topology Design
*   **Virtual Hosts (vhosts):** A single `/ecommerce` vhost is used for the primary application domain.
*   **Exchanges:**
    *   `ecommerce.domain.exchange` (Topic): The main exchange where all domain events (Orders, Products) are published.
    *   `ecommerce.dlx.exchange` (Direct): The Dead Letter Exchange.
*   **Queues:**
    *   Queues are bound to the `ecommerce.domain.exchange` using specific routing keys.
    *   All queues are declared as **Quorum Queues** to ensure high availability and data safety across the Kubernetes cluster.

## 3. Publisher Guarantees
*   Publishers MUST enable **Publisher Confirms**.
*   A message is not considered "sent" until the broker acknowledges it. If an ACK is not received, the service will retry publishing.
