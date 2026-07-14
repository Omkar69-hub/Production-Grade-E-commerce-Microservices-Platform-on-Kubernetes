# E-Commerce Platform Scaling Strategy

To handle the highly variable traffic of an e-commerce platform (e.g., Black Friday sales), we employ a three-tiered autoscaling strategy.

## 1. Horizontal Pod Autoscaler (HPA)
**Scope**: Microservices (Frontend, Product, Order, Cart, Payment, Notification).
**Trigger**: Scales the number of pod replicas based on CPU utilization (Target: 70%) and Memory utilization (Target: 80%).
**Configuration**:
*   `minReplicas`: 2 (for High Availability across AZs).
*   `maxReplicas`: 20 (capped to prevent runaway scaling and DB connection exhaustion).
*   *Note*: Ensure connection pooling (e.g., HikariCP) in applications is tuned so that `maxReplicas * maxConnectionsPerPod <= DB_Max_Connections`.

## 2. Vertical Pod Autoscaler (VPA)
**Scope**: Backend processors or memory-intensive jobs.
**Trigger**: Recommends or automatically adjusts CPU and Memory requests/limits based on historical usage.
**Strategy**: Run VPA in `Recommendation` mode for microservices to inform base configurations. Do not run VPA in `Auto` mode simultaneously with HPA on the same metrics, as they will conflict.

## 3. Cluster Autoscaler (CA) or Karpenter
**Scope**: AWS EKS Worker Nodes.
**Trigger**: When HPA requests new pods but there is insufficient CPU/Memory on existing nodes, the pods enter a `Pending` state. The CA detects this and provisions new EC2 instances.
**Strategy**:
*   Use multiple node groups (e.g., On-Demand for baseline, Spot for burst traffic).
*   Configure overprovisioning (pause pods) to keep spare node capacity ready, reducing scale-up latency during sudden traffic spikes.

## 4. Database Scaling
*   **Storage**: RDS Storage Autoscaling is enabled.
*   **Compute (Vertical)**: Scaling RDS compute requires a brief downtime. This is handled manually during maintenance windows based on capacity planning forecasts.
*   **Read Replicas (Horizontal)**: Deploy RDS Read Replicas to offload read-heavy traffic (Product Catalog browsing).
