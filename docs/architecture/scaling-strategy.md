# Scaling Strategy

## 1. Stateless Design
All microservices are explicitly designed to be stateless. Session state (like JWT tokens or shopping carts) is stored externally in Redis, and persistent state in PostgreSQL. This allows instances (Pods) of any service to be created or destroyed at will.

## 2. Horizontal Pod Autoscaling (HPA)
Scaling at the application level is managed by the Kubernetes Horizontal Pod Autoscaler.
*   **Triggers:** CPU utilization, Memory utilization, and custom Prometheus metrics (e.g., HTTP request rate or RabbitMQ queue depth).
*   **Configuration:** Services have defined baseline replicas (e.g., min: 2, max: 10). If the CPU average crosses 70%, HPA provisions new pods.

## 3. Cluster Autoscaling
Scaling at the infrastructure level is managed by the Kubernetes Cluster Autoscaler (or AWS Karpenter).
*   When HPA requests new pods, but the existing EC2 worker nodes lack sufficient CPU/Memory, the pods go into a `Pending` state.
*   The Cluster Autoscaler detects `Pending` pods and automatically provisions new EC2 instances and adds them to the EKS cluster.
*   Conversely, during low traffic, underutilized nodes are drained and terminated to save costs.

## 4. Database Scaling
*   **PostgreSQL:** 
    *   Vertical scaling (instance size upgrades) is the primary method for scaling the primary write node.
    *   Read Replicas are provisioned to handle read-heavy traffic (e.g., for the Product Catalog service), offloading work from the primary node.
*   **Redis:** Deployed as a Redis Cluster for horizontal partitioning and high availability.

## 5. RabbitMQ Scaling
RabbitMQ is deployed as a cluster across multiple AZs. Quorum queues are utilized for data safety. Scaling throughput involves adding more consumer pods (via HPA) to process queues faster.
