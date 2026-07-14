# Production-Grade E-Commerce Microservices Platform on Kubernetes

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=flat-square&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28-blue?style=flat-square&logo=kubernetes&logoColor=white)
![Helm](https://img.shields.io/badge/Helm-3.0+-blue?style=flat-square&logo=helm&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-1.5+-purple?style=flat-square&logo=terraform&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=flat-square&logo=github-actions&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0-red?style=flat-square&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.12-orange?style=flat-square&logo=rabbitmq&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-orange?style=flat-square&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-Dashboards-orange?style=flat-square&logo=grafana&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Project Description

A comprehensive, enterprise-ready, cloud-native e-commerce platform built using a microservices architecture, fully containerized, orchestrated by Kubernetes, and managed via GitOps.

This project exists as a reference architecture to demonstrate the complete lifecycle of a modern, highly available, and scalable microservices application. Designed for real-world enterprise use cases, it encompasses backend development (Java/Spring Boot), frontend development (React), containerization (Docker), orchestration (Kubernetes/Helm), infrastructure as code (Terraform), continuous delivery (GitOps/Argo CD), observability (Prometheus/Grafana), and robust security practices. By solving the limitations of monolithic architectures—such as slow release cycles and single points of failure—this cloud-native design ensures independent service scalability, high fault tolerance, and rapid deployment.

---

## Project Highlights

- **Microservices Architecture:** Independently deployable business capabilities.
- **API Gateway:** Centralized routing, security, and rate limiting.
- **JWT Authentication:** Secure, stateless identity management.
- **Product Catalog:** High-performance product discovery.
- **Shopping Cart:** Highly responsive, Redis-backed temporary state management.
- **Order Processing:** Asynchronous, robust distributed order fulfillment.
- **Payment Processing:** Secure payment orchestration.
- **Notification Service:** Real-time event-driven notifications.
- **React Frontend:** Modern, responsive single-page application.
- **Docker & Kubernetes:** Containerized and fully orchestrated workloads.
- **Helm & Terraform:** Infrastructure as Code and templated application delivery.
- **GitHub Actions & Argo CD:** Automated CI/CD pipelines adhering to GitOps principles.
- **Prometheus & Grafana:** Comprehensive observability and alerting.
- **Redis, RabbitMQ, PostgreSQL:** Best-in-class data and message persistence.

---

## Architecture

This platform leverages an advanced **Microservices Architecture** utilizing the **Database-per-Service pattern** to ensure absolute data isolation. Microservice communication is both synchronous (via REST APIs through the API Gateway for external clients) and asynchronous (**Event-driven architecture** via RabbitMQ) for reliable internal workflows. The entire system is designed for a **Kubernetes deployment**, abstracting underlying infrastructure complexities.

![High-Level Architecture](assets/architecture.png)

*(Note: Additional detailed architecture diagrams are available in the [docs/architecture](docs/architecture) directory).*

---

## Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot 3, Spring Cloud Gateway, Spring Security |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **Databases** | PostgreSQL (Relational), Redis (Caching / Session) |
| **Messaging** | RabbitMQ (Event-Driven Architecture) |
| **DevOps** | Docker, GitOps, Argo CD, GitHub Actions |
| **Cloud** | AWS (EKS, RDS, ElastiCache, S3, VPC) |
| **Monitoring** | Prometheus, Grafana, Loki, Fluent Bit, Alertmanager |
| **Security** | JWT, Checkov, Trivy, Gitleaks, Kubernetes Network Policies |
| **Testing** | JUnit, K6 (Load Testing), Postman (API Testing) |

---

## Repository Structure

- `services/`: Source code for all backend microservices and the React frontend.
- `docs/`: Comprehensive project documentation, ADRs, and API references.
- `kubernetes/`: Raw Kubernetes manifests for Namespaces, ConfigMaps, and Secrets.
- `helm/`: Helm charts for scalable and templated deployment.
- `terraform/`: Infrastructure as Code (IaC) to provision AWS EKS, RDS, and VPC.
- `argocd/`: GitOps definitions (App of Apps pattern) for continuous delivery.
- `monitoring/`: Prometheus, Grafana, and logging configuration.
- `security/`: Compliance, network policies, and security configurations.
- `tests/`: Integration, Load (K6), and API (Postman) testing resources.
- `operations/`: SRE runbooks, backup, DR, and scaling strategies.
- `scripts/`: Utility scripts for automation and local setup.
- `environments/`: Environment-specific configurations (Dev, Staging, Prod).

---

## Features

- **Authentication & Authorization:** Secure JWT-based access with RBAC.
- **Product Management:** Browse, search, and manage a robust product catalog.
- **Cart Management:** High-speed shopping cart functionality backed by Redis.
- **Order Management:** Reliable state-machine driven order fulfillment.
- **Payment Workflow:** Integrated (mocked) secure payment processing.
- **Notifications:** Asynchronous email and SMS notifications via domain events.
- **Caching:** Distributed caching for optimized performance.
- **Event-driven Communication:** Guaranteed message delivery using RabbitMQ.
- **CI/CD:** Automated testing and build pipelines via GitHub Actions.
- **GitOps:** Declarative cluster state management with Argo CD.
- **Infrastructure as Code:** Automated AWS resource provisioning using Terraform.
- **Observability:** Centralized logging, metrics collection, and alerting.
- **Security:** Defense-in-depth with secret management and static analysis.
- **Production Hardening:** Multi-AZ deployments, autoscaling, and fault tolerance.

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Omkar69-hub/Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes.git
cd Production-Grade-E-commerce-Microservices-Platform-on-Kubernetes
```

### 2. Configure Environment Variables
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

### 3. Build the Project
```bash
# Example for a Maven-based microservice
cd services/product-service
./mvnw clean package -DskipTests
```

### 4. Run with Docker Compose (Local Development)
```bash
docker-compose -f docker/docker-compose.yml up -d
```
Access the frontend at `http://localhost:3000` and the API Gateway at `http://localhost:8080`.

### 5. Deploy to Kubernetes (Local Minikube)
Start your local cluster:
```bash
minikube start --memory=8192 --cpus=4
```
Apply foundational namespaces:
```bash
kubectl apply -f kubernetes/namespaces.yaml
```

### 6. Deploy using Helm
```bash
helm install ecommerce ./helm/ecommerce-platform -n e-commerce -f helm/ecommerce-platform/values-dev.yaml
```

### 7. Deploy with Argo CD (GitOps)
Ensure Argo CD is installed in your cluster, then apply the root application:
```bash
kubectl apply -f argocd/root-app.yaml
```

---

## API Documentation

Detailed API specifications are available in the [docs/api/](docs/api/) directory. We use OpenAPI/Swagger to document endpoints, request/response structures, and authentication requirements.

---

## Architecture Decision Records

We maintain Architecture Decision Records (ADRs) to document significant architectural choices, context, and consequences. They are valuable for understanding *why* certain technologies or patterns were chosen over alternatives.
Review them here: [docs/architecture/architecture-decision-records/](docs/architecture/architecture-decision-records/).

---

## Monitoring

- **Prometheus:** Scrapes and stores time-series metrics from microservices and infrastructure.
- **Grafana:** Visualizes metrics through pre-configured dashboards (golden signals).
- **Loki & Fluent Bit:** Aggregates and streams logs efficiently across the cluster.
- **Alertmanager:** Handles alerting strategies for critical system anomalies.

---

## Security

- **JWT & RBAC:** Ensures secure authentication and fine-grained authorization.
- **Network Policies:** Implements default deny-all rules, explicitly whitelisting required pod communication.
- **Trivy & Checkov:** Scans containers and IaC (Terraform) for vulnerabilities and misconfigurations.
- **Gitleaks:** Prevents secrets from being committed to the repository.
- **Secrets Management:** Secures database credentials and API keys inside Kubernetes.

---

## Testing

- **Unit Tests:** Ensure core business logic integrity (JUnit/Mockito).
- **Integration Tests:** Validate cross-component compatibility (Testcontainers).
- **API Tests:** Verify endpoint behavior and contracts (Postman/RestAssured).
- **Load Tests:** Ensure the platform handles high concurrency (K6).
- **Security Tests:** Shift-left scanning via CI/CD.
- **Kubernetes Validation:** Linting and validation of manifest files.

---

## CI/CD Pipeline

Our continuous integration and continuous deployment pipeline is fully automated:
1. **GitHub Actions** triggers on every commit: lints code, runs unit/integration tests, and performs security scans (Trivy, SonarQube).
2. Code is built into Docker images and pushed to a container registry.
3. Helm charts are packaged and updated.
4. **Argo CD** detects changes in the Git repository and automatically synchronizes the state into the target Kubernetes cluster (GitOps).

---

## Infrastructure

The underlying cloud infrastructure is provisioned on AWS using **Terraform**:
- **VPC:** Secure, isolated networking with public/private subnets.
- **EKS (Elastic Kubernetes Service):** Managed, highly available Kubernetes control plane.
- **RDS (PostgreSQL):** Fully managed relational database for persistent data.
- **ElastiCache (Redis):** High-performance in-memory caching.
- **RabbitMQ (via Amazon MQ/EC2):** Managed message broker.
- **IAM:** Strict identity and access management roles for EKS nodes.
- **Load Balancer:** AWS Application Load Balancer (ALB) acting as the external ingress.

---

## Production Readiness

- **High Availability:** Services deployed across multiple Availability Zones with anti-affinity rules.
- **Scalability:** Configured with Horizontal Pod Autoscalers (HPA) and Cluster Autoscaler.
- **Fault Tolerance:** Graceful degradation, circuit breakers, and retry mechanisms.
- **Backup Strategy & Disaster Recovery:** Automated database snapshots and declarative GitOps state restoration.
- **Monitoring & Security:** Comprehensive tracing, logging, metrics, and Pod Security Standards.
- **Performance:** Redis caching and optimized database indexing.

---

## Screenshots

- **Architecture Diagram:** ![Architecture Diagram](assets/architecture.png)
- **Grafana Dashboard:** ![Grafana Dashboard](assets/grafana-dashboard.png)
- **Kubernetes Dashboard:** ![Kubernetes Dashboard](assets/k8s-dashboard.png)
- **GitHub Actions:** ![GitHub Actions](assets/github-actions.png)
- **Argo CD:** ![Argo CD](assets/argocd.png)
- **Application UI:** ![Application UI](assets/app-ui.png)

*(Note: If screenshots are not rendering, they will be uploaded to the `assets/` directory shortly).*

---

## Future Enhancements

- **Service Mesh (Istio):** For advanced traffic management, mTLS, and deeper observability.
- **CQRS & Event Sourcing:** For hyper-scalable catalog and order systems.
- **Multi-region Deployment:** Active-active cross-region setup for extreme availability.
- **Blue/Green & Canary Releases:** Advanced progressive delivery pipelines.
- **AI-powered Recommendations:** Machine learning models for personalized product suggestions.
- **Elasticsearch:** Enhanced full-text search capabilities for the product catalog.
- **OpenTelemetry:** Standardized distributed tracing across all services.

---

## Skills Demonstrated

- **Software Engineering:** Domain-Driven Design (DDD), Microservices, Java/Spring Boot, React.
- **Cloud & Infrastructure:** AWS, Terraform, Networking (VPC, Subnets, Load Balancers).
- **Containerization & Orchestration:** Docker, Kubernetes, Helm.
- **DevOps & SRE:** CI/CD (GitHub Actions), GitOps (Argo CD), Observability (Prometheus/Grafana/ELK), Load Testing (K6).
- **Architecture:** Event-Driven Architecture, API Gateways, Database-per-service, High Availability, Fault Tolerance.

---

## Resume Summary

**Production-Grade Cloud-Native E-Commerce Platform** | *Java, Spring Boot, React, Kubernetes, Terraform, AWS, Argo CD*
Architected and developed a highly scalable microservices e-commerce platform on AWS EKS. Designed an event-driven architecture using RabbitMQ and implemented the Database-per-Service pattern with PostgreSQL and Redis. Provisioned cloud infrastructure via Terraform and automated zero-downtime deployments using GitHub Actions and Argo CD (GitOps). Hardened production readiness through extensive observability (Prometheus/Grafana), Kubernetes network policies, and horizontal autoscaling.

---

## LinkedIn Summary

🚀 I recently built a **Production-Grade E-Commerce Microservices Platform** to demonstrate modern Cloud-Native and Site Reliability Engineering practices!

This project isn't just a basic web app; it's a fully orchestrated, highly available system designed to simulate real-world enterprise architectures.

**Key Highlights:**
🔹 **Architecture:** Event-driven microservices using Java/Spring Boot, RabbitMQ, and React.
🔹 **Infrastructure:** Fully automated AWS environment (EKS, RDS, VPC) managed via Terraform.
🔹 **GitOps:** Declarative continuous delivery pipeline powered by GitHub Actions and Argo CD.
🔹 **Observability:** Centralized logging and metrics with Prometheus and Grafana.
🔹 **Production Hardened:** Built with fault tolerance, autoscaling, network policies, and comprehensive security scanning.

Check out the full repository, architecture diagrams, and documentation to see how all the pieces fit together! #Microservices #Kubernetes #DevOps #AWS #SpringBoot #Terraform #GitOps #SRE

---

## Contributing

We welcome contributions! Please review our [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests.

---

## Code of Conduct

Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) to understand the expectations for participating in this community.

---

## Security Policy

For reporting vulnerabilities, please refer to our [SECURITY.md](SECURITY.md).

---

## License

This project is licensed under the [MIT License](LICENSE).
