# Production-Grade E-Commerce Microservices Platform on Kubernetes

A **production-grade, cloud-native e-commerce platform** built using modern enterprise technologies and DevOps best practices. This project demonstrates how large-scale microservices are designed, developed, containerized, deployed, secured, monitored, and managed in a Kubernetes environment.

The platform follows a **domain-driven microservices architecture**, where each business capability is implemented as an independent Spring Boot service with its own database. Communication between services uses both synchronous REST APIs and asynchronous event-driven messaging through RabbitMQ, enabling scalability, resilience, and loose coupling.

---

## Project Overview

This project simulates a real-world enterprise e-commerce platform capable of serving production workloads.

It showcases modern software engineering, cloud-native architecture, DevOps automation, Infrastructure as Code (IaC), GitOps, observability, security, and Site Reliability Engineering (SRE) practices.

The repository is designed as a complete reference implementation for learning, portfolio demonstration, and enterprise interviews.

---

## Key Features

| Feature                            | Description                                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Microservices Architecture**     | Independently deployable Spring Boot services following bounded contexts and the Database-per-Service pattern.             |
| **API Gateway**                    | Centralized request routing, security, and traffic management using Spring Cloud Gateway.                                  |
| **Authentication & Authorization** | JWT-based authentication with role-based access control (RBAC).                                                            |
| **Product Catalog**                | Product management with category hierarchy, inventory tracking, caching, and search.                                       |
| **Shopping Cart**                  | Distributed cart management with Redis-backed session storage.                                                             |
| **Order Processing**               | Reliable order lifecycle using transactional boundaries and event-driven communication.                                    |
| **Payment Processing**             | Decoupled payment workflow with asynchronous messaging.                                                                    |
| **Notification Service**           | Email and event notifications triggered through RabbitMQ.                                                                  |
| **React Frontend**                 | Responsive user interface built with React and Vite.                                                                       |
| **Docker**                         | Multi-stage optimized container images for every service.                                                                  |
| **Kubernetes**                     | Production-ready manifests including Deployments, Services, ConfigMaps, Secrets, Ingress, HPA, PVCs, and Network Policies. |
| **Helm**                           | Parameterized deployment using reusable Helm charts for multiple environments.                                             |
| **Terraform**                      | Infrastructure provisioning on AWS including VPC, EKS, IAM, RDS, Redis, and Load Balancer resources.                       |
| **GitHub Actions**                 | Automated CI/CD pipelines for build, test, security scanning, packaging, and releases.                                     |
| **Argo CD**                        | GitOps-based continuous deployment using the App of Apps pattern.                                                          |
| **Monitoring**                     | Prometheus, Grafana, Loki, Fluent Bit, and Alertmanager for full observability.                                            |
| **Security**                       | RBAC, Network Policies, Trivy, Checkov, Gitleaks, External Secrets, and supply chain security.                             |
| **Testing**                        | Unit, Integration, API, Load, Security, and Kubernetes validation testing.                                                 |

---

## Technology Stack

| Category                    | Technologies                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| **Backend**                 | Java 21, Spring Boot 3.x, Spring Security, Spring Cloud Gateway, Spring Data JPA, Spring Validation |
| **Frontend**                | React 19, Vite, TypeScript                                                                          |
| **Databases**               | PostgreSQL 16, Redis 7                                                                              |
| **Messaging**               | RabbitMQ                                                                                            |
| **Containerization**        | Docker, Docker Compose                                                                              |
| **Container Orchestration** | Kubernetes                                                                                          |
| **Package Management**      | Helm                                                                                                |
| **Infrastructure as Code**  | Terraform                                                                                           |
| **Cloud Platform**          | AWS (EKS, VPC, IAM, RDS, ElastiCache, Route53)                                                      |
| **CI/CD**                   | GitHub Actions                                                                                      |
| **GitOps**                  | Argo CD                                                                                             |
| **Monitoring**              | Prometheus, Grafana, Loki, Fluent Bit, Alertmanager                                                 |
| **Testing**                 | JUnit 5, Mockito, Testcontainers, Postman, Newman, K6                                               |
| **Security**                | Trivy, Gitleaks, Checkov, RBAC, Network Policies, JWT                                               |

---

## Architecture Highlights

* API Gateway serving as the single entry point
* Independent Spring Boot microservices
* Database-per-Service architecture
* Event-driven communication with RabbitMQ
* Redis distributed caching
* Kubernetes-native deployment
* GitOps deployment using Argo CD
* Infrastructure provisioned with Terraform
* Enterprise observability stack
* Zero-Trust security model

---

## Repository Structure

| Directory     | Purpose                                                       |
| ------------- | ------------------------------------------------------------- |
| `services/`   | Backend microservices and React frontend                      |
| `docs/`       | Architecture, ADRs, API documentation, requirements, planning |
| `docker/`     | Dockerfiles and Docker Compose configurations                 |
| `kubernetes/` | Kubernetes manifests                                          |
| `helm/`       | Helm charts                                                   |
| `terraform/`  | AWS Infrastructure as Code                                    |
| `argocd/`     | GitOps deployment manifests                                   |
| `monitoring/` | Prometheus, Grafana, Loki, Fluent Bit, Alertmanager           |
| `security/`   | Security configurations and compliance documentation          |
| `operations/` | Production runbooks, backup, disaster recovery                |
| `tests/`      | API, integration, load, security, and validation tests        |
| `scripts/`    | Automation scripts                                            |
| `.github/`    | GitHub Actions workflows                                      |

---

## Enterprise Capabilities

* Production-ready architecture
* Cloud-native deployment
* Horizontal auto-scaling
* Self-healing workloads
* Infrastructure as Code
* GitOps continuous deployment
* Secure authentication
* Distributed caching
* Event-driven architecture
* Centralized logging
* Metrics and dashboards
* Health monitoring
* Disaster recovery planning
* Backup strategy
* Production hardening
* Security compliance

---

## DevOps & Platform Engineering

This project demonstrates practical implementation of:

* Docker containerization
* Kubernetes orchestration
* Helm packaging
* Terraform infrastructure provisioning
* GitHub Actions CI/CD
* Argo CD GitOps
* Prometheus monitoring
* Grafana dashboards
* Loki centralized logging
* Fluent Bit log collection
* RBAC
* Network Policies
* External Secrets
* Trivy image scanning
* Checkov Infrastructure scanning
* Gitleaks secret detection

---

## Skills Demonstrated

### Software Engineering

* Java 21
* Spring Boot
* REST APIs
* Spring Security
* JWT Authentication
* Domain-Driven Design
* Event-Driven Architecture
* Database-per-Service

### DevOps

* Docker
* Kubernetes
* Helm
* GitHub Actions
* Argo CD
* Terraform
* CI/CD
* GitOps

### Cloud Engineering

* AWS EKS
* IAM
* RDS
* ElastiCache
* Networking
* High Availability
* Auto Scaling

### Site Reliability Engineering

* Monitoring
* Alerting
* Logging
* Disaster Recovery
* Backup Strategy
* Production Runbooks

---

## License

This project is licensed under the **MIT License**.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the **Software**), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the conditions of the MIT License.

See the **LICENSE** file for the complete license text.

---

## Acknowledgements

This repository was developed as a comprehensive cloud-native engineering project to demonstrate modern enterprise software development, DevOps, Platform Engineering, Infrastructure as Code, GitOps, Security, Observability, and Site Reliability Engineering practices.

It serves as a portfolio-quality reference implementation for recruiters, hiring managers, and engineers interested in production-grade microservices architecture.
