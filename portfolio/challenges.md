# Challenges Overcome

1.  **Distributed Data Consistency**: Keeping the Order status synced with the Payment and Inventory status was difficult. I overcame this by moving away from HTTP calls and implementing an asynchronous event-driven architecture using RabbitMQ.
2.  **Kubernetes Networking**: Initially, pods couldn't communicate when I applied the default-deny Network Policy. I had to meticulously map out the exact ingress/egress requirements for each service (e.g., allowing CoreDNS on port 53).
3.  **Local vs Cloud Environment Parity**: Ensuring the Helm charts worked locally on Minikube and in the cloud on EKS required careful extraction of environment-specific configurations into separate `values.yaml` files.
