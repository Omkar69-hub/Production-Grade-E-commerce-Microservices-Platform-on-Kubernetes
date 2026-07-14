# Networking Architecture

## 1. Kubernetes Networking Model
We utilize the AWS VPC CNI for Amazon EKS, providing native AWS networking integration. Every Pod receives an IP address directly from the VPC subnet, enabling seamless communication across the cluster and with AWS services without NAT overhead.

## 2. Cluster Networking
*   **VPC Layout:** A dedicated VPC for the EKS cluster spanning 3 Availability Zones (AZs) for high availability.
*   **Subnets:** 
    *   *Public Subnets:* Used exclusively for NAT Gateways and AWS Application Load Balancers (ALBs).
    *   *Private Subnets:* Worker nodes, Pods, and databases (RDS, ElastiCache) run exclusively in private subnets with no direct internet access.

## 3. Ingress & Load Balancing
*   **AWS ALB Ingress Controller:** Manages external traffic. It provisions an Application Load Balancer in the public subnets.
*   **Routing:** The ALB terminates TLS and forwards traffic to the internal Spring Cloud Gateway service (running in Kubernetes) based on Ingress rules.
*   **Spring Cloud Gateway:** Acts as the internal API Gateway, performing route-matching based on path (e.g., `/api/v1/orders` -> Order Service).

## 4. Internal Service Networking (Service Discovery)
*   Microservices communicate internally using Kubernetes DNS (CoreDNS).
*   Services are exposed within the cluster via `ClusterIP` Services.
*   Example: The Order Service communicates with the Payment Service using the internal DNS name `payment-service.backend.svc.cluster.local`.

## 5. Network Policies (Zero-Trust)
By default, all traffic between namespaces is blocked. We implement Kubernetes Network Policies (via Calico or AWS VPC CNI Network Policies) to explicitly allow required communication:
*   The API Gateway can communicate with backend services.
*   Backend services can communicate with RabbitMQ and their respective databases.
*   The Product Service cannot communicate directly with the Order database.

## 6. DNS Management
*   External DNS (managed by Route53) points the platform domain (e.g., `api.ecommerce.com`) to the AWS ALB.
*   External-DNS controller in Kubernetes automatically synchronizes Ingress hostnames with Route53 records.
