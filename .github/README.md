# Production-Grade E-Commerce Microservices Platform on Kubernetes

A production-grade, cloud-native E-Commerce platform built using modern microservices architecture and deployed on Kubernetes. This repository demonstrates enterprise software engineering, cloud-native application development, DevOps automation, Infrastructure as Code (IaC), GitOps, security, observability, and Site Reliability Engineering (SRE) best practices.

The platform is designed to simulate how large-scale enterprise applications are developed and deployed in production environments. Every component has been designed with scalability, maintainability, resilience, and security in mind.

---

# Project Overview

This project follows a **Microservices Architecture** where each business capability is implemented as an independent Spring Boot service with its own database and bounded context.

The application is fully containerized using Docker, orchestrated with Kubernetes, packaged with Helm, provisioned using Terraform on AWS, and deployed through a GitOps workflow using Argo CD.

The repository serves as a complete reference implementation for modern cloud-native application development.

---

# Core Features

| Feature                            | Description                                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Microservices Architecture**     | Independent Spring Boot services following the Database-per-Service pattern.                                               |
| **API Gateway**                    | Centralized routing, request filtering, JWT forwarding, and traffic management using Spring Cloud Gateway.                 |
| **Authentication & Authorization** | Secure JWT authentication with Role-Based Access Control (RBAC).                                                           |
| **Product Management**             | Product catalog, inventory management, categories, search, and caching.                                                    |
| **Shopping Cart**                  | Distributed cart management backed by Redis.                                                                               |
| **Order Processing**               | Reliable order workflow using event-driven architecture and RabbitMQ.                                                      |
| **Payment Service**                | Asynchronous payment processing with decoupled communication.                                                              |
| **Notification Service**           | Email and system notifications using message queues.                                                                       |
| **React Frontend**                 | Modern React + Vite frontend with protected routes and responsive UI.                                                      |
| **Docker**                         | Multi-stage production-ready Docker images for every service.                                                              |
| **Kubernetes**                     | Production-ready manifests including Deployments, Services, ConfigMaps, Secrets, Ingress, HPA, PVCs, and Network Policies. |
| **Helm Charts**                    | Reusable Helm charts supporting Development, Staging, and Production environments.                                         |
| **Terraform**                      | Infrastructure provisioning for AWS including VPC, EKS, IAM, RDS, Redis, and networking.                                   |
| **GitHub Actions**                 | Automated CI/CD pipelines for testing, building, packaging, security scanning, and releases.                               |
| **Argo CD**                        | GitOps-based continuous deployment following the App of Apps pattern.                                                      |
| **Monitoring & Logging**           | Prometheus, Grafana, Loki, Fluent Bit, and Alertmanager integration.                                                       |
| **Security**                       | JWT, RBAC, Network Policies, Trivy, Checkov, Gitleaks, External Secrets, and DevSecOps practices.                          |
| **Testing**                        | Unit, Integration, API, Load, Security, and Kubernetes validation testing.                                                 |

---

# Microservices

| Service              | Responsibility                                |
| -------------------- | --------------------------------------------- |
| API Gateway          | Entry point for all client requests           |
| Auth Service         | Authentication, authorization, JWT management |
| Product Service      | Product catalog, categories, inventory        |
| Cart Service         | Shopping cart operations                      |
| Order Service        | Order lifecycle management                    |
| Payment Service      | Payment processing                            |
| Notification Service | Email and event notifications                 |
| Frontend             | React-based user interface                    |

---

# Technology Stack

| Category               | Technologies                                                    |
| ---------------------- | --------------------------------------------------------------- |
| **Backend**            | Java 21, Spring Boot 3.x, Spring Security, Spring Cloud Gateway |
| **Frontend**           | React 19, Vite, TypeScript, Material UI                         |
| **Database**           | PostgreSQL 16                                                   |
| **Caching**            | Redis 7                                                         |
| **Messaging**          | RabbitMQ                                                        |
| **Containerization**   | Docker, Docker Compose                                          |
| **Orchestration**      | Kubernetes                                                      |
| **Package Management** | Helm                                                            |
| **Infrastructure**     | Terraform                                                       |
| **Cloud Platform**     | AWS (EKS, RDS, IAM, VPC, ElastiCache)                           |
| **GitOps**             | Argo CD                                                         |
| **CI/CD**              | GitHub Actions                                                  |
| **Monitoring**         | Prometheus, Grafana, Loki, Fluent Bit, Alertmanager             |
| **Testing**            | JUnit 5, Mockito, Testcontainers, Postman, Newman, K6           |
| **Security**           | Trivy, Gitleaks, Checkov, JWT, RBAC, Network Policies           |

---

# Repository Structure

| Directory     | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `services/`   | Backend microservices and React frontend                                 |
| `docs/`       | Architecture, API documentation, ADRs, planning, requirements            |
| `docker/`     | Docker Compose configurations                                            |
| `kubernetes/` | Kubernetes manifests                                                     |
| `helm/`       | Helm charts                                                              |
| `terraform/`  | AWS Infrastructure as Code                                               |
| `argocd/`     | GitOps deployment manifests                                              |
| `monitoring/` | Monitoring and logging stack                                             |
| `security/`   | Security policies, scanning, and compliance                              |
| `operations/` | Runbooks, backup, disaster recovery, production hardening                |
| `tests/`      | API, integration, performance, security, and Kubernetes validation tests |
| `scripts/`    | Deployment and automation scripts                                        |
| `.github/`    | GitHub Actions workflows and repository templates                        |

---

# DevOps & Platform Engineering

This project demonstrates enterprise DevOps practices including:

* Docker containerization
* Kubernetes orchestration
* Helm packaging
* Infrastructure as Code with Terraform
* GitHub Actions CI/CD
* GitOps using Argo CD
* Centralized monitoring
* Centralized logging
* Automated security scanning
* Production-ready deployment pipelines

---

# Monitoring & Observability

The platform includes a complete observability stack:

* Prometheus for metrics collection
* Grafana dashboards
* Loki centralized logging
* Fluent Bit log forwarding
* Alertmanager alert routing
* Spring Boot Actuator integration
* Kubernetes health checks
* Readiness and Liveness probes

---

# Security

Security has been implemented using a Defense-in-Depth approach.

Implemented controls include:

* JWT Authentication
* Role-Based Access Control (RBAC)
* Kubernetes Network Policies
* External Secrets
* Trivy image scanning
* Gitleaks secret detection
* Checkov Infrastructure scanning
* Non-root containers
* Secure Docker images
* Pod Security Standards
* OWASP Top 10 considerations

---

# Testing Strategy

The platform follows the Test Pyramid:

* Unit Testing
* Integration Testing
* API Testing
* End-to-End Testing
* Load Testing
* Security Testing
* Kubernetes Validation
* SonarQube Quality Analysis

---

# Production Readiness

This platform includes enterprise-grade production capabilities:

* High Availability
* Horizontal Auto Scaling
* Rolling Updates
* Infrastructure as Code
* GitOps Deployment
* Backup Strategy
* Disaster Recovery
* Monitoring
* Logging
* Alerting
* Security Hardening
* Production Runbooks

---

# Skills Demonstrated

* Java 21
* Spring Boot
* Microservices
* REST APIs
* Event-Driven Architecture
* Docker
* Kubernetes
* Helm
* Terraform
* AWS
* GitHub Actions
* Argo CD
* RabbitMQ
* PostgreSQL
* Redis
* Prometheus
* Grafana
* DevOps
* GitOps
* Site Reliability Engineering
* Cloud-Native Architecture

---

# License

This project is licensed under the **MIT License**.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the terms and conditions of the MIT License.

For the complete license text, see the **LICENSE** file included in this repository.

---

# Acknowledgements

This repository was built as a comprehensive enterprise-grade cloud-native engineering project demonstrating modern software architecture, DevOps, Platform Engineering, Infrastructure as Code, GitOps, Observability, Security, and Site Reliability Engineering practices.

It serves as a portfolio-quality reference implementation for engineers, recruiters, and hiring managers seeking real-world production-grade engineering experience.
