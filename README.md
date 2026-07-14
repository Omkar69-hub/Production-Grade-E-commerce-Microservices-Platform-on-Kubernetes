# Production-Grade E-Commerce Microservices Platform on Kubernetes

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Kubernetes](https://img.shields.io/badge/kubernetes-1.28-blue)
![Helm](https://img.shields.io/badge/helm-3.0+-blue)
![Terraform](https://img.shields.io/badge/terraform-1.5+-purple)
![Java 21](https://img.shields.io/badge/Java-21-orange)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)
![React 19](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Redis](https://img.shields.io/badge/Redis-7.0-red)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.12-orange)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-orange)
![Grafana](https://img.shields.io/badge/Grafana-Dashboards-orange)
![Argo CD](https://img.shields.io/badge/ArgoCD-GitOps-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

A comprehensive, enterprise-ready, cloud-native e-commerce platform built using a microservices architecture, fully containerized, orchestrated by Kubernetes, and managed via GitOps.

---

## 📖 Professional Introduction

This repository demonstrates the complete lifecycle of a modern, highly available, and scalable microservices application. Designed as a reference architecture, it encompasses backend development (Java/Spring Boot), frontend development (React), containerization (Docker), orchestration (Kubernetes/Helm), infrastructure as code (Terraform), continuous delivery (Argo CD), observability (Prometheus/Grafana), and security best practices.

It serves as a comprehensive portfolio project demonstrating Senior DevOps, Site Reliability Engineering (SRE), and Cloud-Native Software Engineering skills.

## 🚀 Project Overview

The platform simulates a real-world e-commerce business. Users can browse products, manage their shopping carts, and securely place orders. The backend is decoupled into specialized microservices communicating asynchronously via message brokers and synchronously via REST APIs through an API Gateway.

### Business Problem
Monolithic e-commerce applications struggle to scale during high-traffic events (e.g., Black Friday), suffer from slow release cycles, and have a single point of failure.

### Solution Architecture
We solved this by adopting a **Microservices Architecture** deployed on **Kubernetes**, ensuring independent scalability, fault tolerance, and rapid GitOps-driven deployments.

## 🛠 Technology Stack

*   **Backend**: Java 21, Spring Boot 3, Spring Cloud Gateway, Spring Security (JWT)
*   **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
*   **Databases**: PostgreSQL (Relational), Redis (Caching)
*   **Messaging**: RabbitMQ (Asynchronous Event-Driven Architecture)
*   **Infrastructure**: Terraform, AWS (EKS, RDS, ElastiCache, S3, VPC)
*   **Orchestration**: Kubernetes, Helm
*   **GitOps / CI/CD**: Argo CD, GitHub Actions
*   **Observability**: Prometheus, Grafana, ELK Stack (conceptual)
*   **Security**: Checkov, Trivy, Gitleaks, K8s Network Policies, Pod Security Standards

## 🗺 Architecture

![High-Level Architecture](assets/architecture.png)

*(Note: Architecture diagrams are available in the `docs/architecture` and `assets/` directories).*

### Microservices Overview
1.  **API Gateway**: Central entry point, handles routing, rate limiting, and CORS.
2.  **Auth Service**: Manages user registration, login, and JWT token issuance.
3.  **Product Service**: Manages the product catalog (CQRS pattern recommended for future).
4.  **Cart Service**: Manages temporary shopping cart state (backed by Redis).
5.  **Order Service**: Orchestrates the order fulfillment process.
6.  **Payment Service**: Processes payments (mocked Stripe integration).
7.  **Notification Service**: Listens for domain events and sends emails/SMS.

## 📂 Folder Structure

```
.
├── services/               # Source code for all microservices (Backend & Frontend)
├── kubernetes/             # Raw Kubernetes manifests (Namespaces, ConfigMaps, Secrets)
├── helm/                   # Helm charts for deploying the application
├── infrastructure/         # Terraform code to provision AWS EKS, RDS, VPC
├── argocd/                 # GitOps definitions (App of Apps pattern)
├── monitoring/             # Prometheus and Grafana configurations
├── security/               # Compliance, network policies, and security configs
├── operations/             # SRE runbooks, backup, DR, and scaling strategies
├── tests/                  # Integration, Load (K6), and API (Postman) tests
├── docs/                   # Architecture Decision Records (ADRs) and diagrams
├── portfolio/              # Interview guides and project summaries
└── assets/                 # Images and diagrams used in documentation
```

*(Each directory contains its own detailed `README.md`)*.

## 🔒 Security Features
*   **Defense in Depth**: Security applied at code, container, network, and IAM layers.
*   **RBAC & Least Privilege**: Strict Kubernetes Role-Based Access Control.
*   **Network Policies**: Default deny-all ingress/egress, explicitly whitelisting service communication.
*   **Pod Security**: Containers run as non-root with read-only root filesystems.
*   **Secret Management**: Designed to integrate with External Secrets Operator / AWS Secrets Manager.

## 📈 Production Hardening
*   **High Availability**: Multi-AZ deployments, PodDisruptionBudgets, Anti-Affinity rules.
*   **Scaling**: Horizontal Pod Autoscalers (HPA) configured for CPU/Memory spikes.
*   **Disaster Recovery**: RPO/RTO defined, logical backups to S3 via CronJobs.
*   **Observability**: Golden signals monitored via Prometheus/Grafana.

## 🏁 Getting Started

### Local Development (Docker Compose)
To run the platform locally without Kubernetes:
```bash
docker-compose -f docker/docker-compose.yml up -d
```
Access the frontend at `http://localhost:3000` and the API Gateway at `http://localhost:8080`.

### Kubernetes Deployment (Minikube / Local)
1. Start Minikube: `minikube start --memory=8192 --cpus=4`
2. Apply foundational namespaces: `kubectl apply -f kubernetes/namespaces.yaml`
3. Install the Helm chart:
```bash
helm install ecommerce ./helm/ecommerce-platform -n e-commerce -f helm/ecommerce-platform/values-dev.yaml
```

### Production Deployment (AWS EKS & Argo CD)
1. Provision infrastructure: `cd infrastructure/terraform/environments/prod && terraform apply`
2. Install Argo CD on the cluster.
3. Apply the root application: `kubectl apply -f argocd/root-app.yaml`

*(See the `docs/` and `operations/` directories for detailed deployment guides).*

## 🤝 Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
