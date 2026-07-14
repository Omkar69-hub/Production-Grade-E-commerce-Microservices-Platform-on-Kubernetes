# Interview Answers

1.  **Microservices vs Monolith:** "I chose microservices to allow independent scaling. An e-commerce site gets heavy traffic on the Product Catalog, but less on the Payment service. Microservices let me scale the Product service independently. It also isolated failures—if the Notification service crashes, users can still place orders."
2.  **Distributed Transactions:** "Instead of 2-Phase Commit which is slow and locking, I used an Event-Driven architecture with the Saga pattern choreography. The Order service publishes an `OrderCreated` event to RabbitMQ. The Payment service listens, processes it, and publishes `PaymentSuccess` or `PaymentFailed`, which the Order service uses to update the final status."
3.  **GitOps (Argo CD):** "Security and auditability. The cluster pulls the configuration from Git. My CI server doesn't need cluster credentials. Plus, if the cluster crashes, I can recreate it instantly because the entire desired state is version-controlled in Git."
4.  **Kubernetes Security:** "I implemented a Defense-in-Depth approach: Non-root containers, read-only filesystems, default-deny Network Policies, and RBAC with least privilege Service Accounts."
5.  **Monitoring:** "I deployed the kube-prometheus-stack. Prometheus scrapes metrics, Grafana visualizes them, and Alertmanager sends alerts to Slack/PagerDuty based on predefined SLOs (e.g., latency > 500ms)."
6.  **Secrets:** "I used External Secrets Operator to sync secrets from AWS Secrets Manager into Kubernetes. I never commit Base64 encoded Kubernetes secrets into Git."
