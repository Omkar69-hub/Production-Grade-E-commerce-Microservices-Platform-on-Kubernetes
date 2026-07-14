🚀 Production-Grade E-Commerce Microservices Platform on Kubernetes

￼
￼
￼
￼
￼
￼
￼
￼
￼
￼
￼
￼
￼
￼
￼
￼

🛒 Production-Grade E-Commerce Microservices Platform

A Production-Grade Cloud-Native E-Commerce Platform built using Java 21, Spring Boot 3, React 19, Docker, Kubernetes, Helm, Terraform, AWS, GitHub Actions, and Argo CD.

This project demonstrates how modern enterprise applications are designed, developed, deployed, monitored, secured, and operated in production environments.

Unlike traditional CRUD applications, this project follows enterprise software engineering practices including:

Microservices Architecture

Event-Driven Communication

Database-per-Service Pattern

GitOps Deployment

Infrastructure as Code (IaC)

CI/CD Automation

Kubernetes Orchestration

Cloud-Native Security

Observability

Production Hardening

High Availability

Disaster Recovery

The platform is designed to closely resemble the architecture used by large-scale technology companies and serves as a comprehensive reference for Software Engineering, Backend Development, Cloud Engineering, Platform Engineering, DevOps, and Site Reliability Engineering (SRE).

✨ Key Features

FeatureDescription🏗 Microservices ArchitectureIndependently deployable Spring Boot services🚪 API GatewayCentralized routing using Spring Cloud Gateway🔐 AuthenticationJWT Authentication with Refresh Tokens🛍 Product CatalogCategory, Inventory & Product Management🛒 Shopping CartRedis-backed Cart Service📦 Order ManagementComplete Order Lifecycle💳 Payment ProcessingEvent-driven Payment Service📧 Notification ServiceEmail/Event Notifications📨 RabbitMQAsynchronous Event Communication🗄 PostgreSQLDatabase-per-Service Pattern⚡ RedisHigh-performance Caching🐳 DockerMulti-stage Containerization☸ KubernetesProduction-grade Orchestration📦 HelmKubernetes Package Management🔄 Argo CDGitOps Continuous Deployment⚙ TerraformAWS Infrastructure Provisioning🚀 GitHub ActionsEnterprise CI/CD Pipelines📈 PrometheusMetrics Collection📊 GrafanaReal-Time Dashboards📜 LokiCentralized Log Aggregation🛡 Trivy + Checkov + GitleaksEnterprise Security Scanning📋 OpenAPIAPI Documentation🧪 TestcontainersIntegration Testing📦 FlywayDatabase Versioning📚 ADR DocumentationArchitecture Decision Records📈 Production ReadyEnterprise-grade Deployment

🏛 Enterprise Architecture

flowchart LR A[👤 Customer] B[React Frontend] C[API Gateway] D[Auth Service] E[Product Service] F[Cart Service] G[Order Service] H[Payment Service] I[Notification Service] J[(PostgreSQL)] K[(Redis)] L[(RabbitMQ)] M[Kubernetes Cluster] N[Prometheus] O[Grafana] P[Loki] Q[Fluent Bit] R[GitHub Actions] S[Argo CD] T[Helm] U[Terraform] V[AWS Infrastructure] A --> B B --> C C --> D C --> E C --> F C --> G C --> H C --> I D --> J E --> J G --> J H --> J I --> J F --> K E --> K G --> L H --> L I --> L M --> C M --> D M --> E M --> F M --> G M --> H M --> I M --> B N --> O Q --> P M --> N M --> Q R --> S S --> T T --> M U --> V V --> M 

🏗 High-Level Architecture

Internet │ ▼ ┌────────────────────┐ │ React Frontend │ │ (React 19 + Vite) │ └─────────┬──────────┘ │ ▼ ┌────────────────────┐ │ API Gateway │ │ Spring Cloud │ └─────────┬──────────┘ │ ┌───────────┬──────────┼──────────┬───────────┬───────────┬───────────┐ ▼ ▼ ▼ ▼ ▼ ▼ Auth Product Cart Order Payment Notification Service Service Service Service Service Service │ │ │ │ │ │ ▼ ▼ ▼ ▼ ▼ ▼ PostgreSQL PostgreSQL Redis PostgreSQL PostgreSQL PostgreSQL │ ▼ RabbitMQ (Event Driven Messaging) │ ▼ Kubernetes Cluster │ ▼ Prometheus • Grafana • Loki │ ▼ Helm → Argo CD → AWS (Terraform) 

🎯 Project Objectives

The primary goal of this project is to demonstrate how a real-world enterprise e-commerce platform can be designed using modern cloud-native technologies.

The platform emphasizes:

Clean Architecture

SOLID Principles

Domain-Driven Design Concepts

Scalable Microservices

Event-Driven Architecture

Containerization

Infrastructure as Code

GitOps

CI/CD Automation

Security Best Practices

Observability

High Availability

Production Hardening

Cloud Deployment on AWS

This repository is intended for learning, portfolio building, interview preparation, and as a reference implementation for enterprise software architecture.

🛠️ Technology Stack

Backend

TechnologyVersionPurposeJava21Programming LanguageSpring Boot3.3.xMicroservices FrameworkSpring SecurityLatestAuthentication & AuthorizationSpring Data JPALatestORMSpring Cloud GatewayLatestAPI GatewaySpring Cloud OpenFeignLatestService CommunicationSpring ValidationLatestRequest ValidationSpring Boot ActuatorLatestHealth MonitoringSpring Retry + Resilience4jLatestCircuit Breaker & RetryFlywayLatestDatabase MigrationMapStructLatestDTO MappingLombokLatestBoilerplate ReductionJWTLatestStateless Authentication

Frontend

TechnologyVersionPurposeReact19User InterfaceTypeScriptLatestType SafetyViteLatestBuild ToolRedux ToolkitLatestGlobal State ManagementReact Routerv6RoutingMaterial UILatestUI ComponentsReact Hook FormLatestFormsAxiosLatestHTTP ClientTanStack QueryLatestServer StateChart.jsLatestDashboards

Database & Caching

TechnologyPurposePostgreSQL 16Primary DatabaseRedis 7Cache & Session StoreRabbitMQEvent Messaging

DevOps & Cloud

TechnologyPurposeDockerContainerizationDocker ComposeLocal DevelopmentKubernetesContainer OrchestrationHelmKubernetes Package ManagementArgo CDGitOps DeploymentTerraformInfrastructure as CodeAWS EKSKubernetes ClusterAWS RDSPostgreSQL DatabaseAWS ElastiCacheRedisAWS Route53DNSAWS IAMSecurityAWS VPCNetworking

Monitoring & Logging

ToolPurposePrometheusMetrics CollectionGrafanaVisualizationLokiLog AggregationFluent BitLog ShippingAlertmanagerAlert Routing

Security

ToolPurposeTrivyContainer ScanningGitleaksSecret DetectionCheckovIaC SecurityKubernetes RBACAccess ControlNetwork PoliciesZero Trust NetworkingJWTAuthenticationOWASP Top 10Secure Coding

Testing

ToolPurposeJUnit 5Unit TestingMockitoMockingTestcontainersIntegration TestingPostmanAPI TestingNewmanAPI AutomationK6Load TestingSonarQubeCode QualityOWASP ZAPSecurity Testing

📂 Project Structure

Production-Grade-E-Commerce-Microservices-Platform-on-Kubernetes/ │ ├── .github/ # GitHub Actions CI/CD workflows ├── argocd/ # GitOps deployment manifests ├── databases/ # PostgreSQL, Redis & DB migrations ├── docker/ # Docker Compose configurations ├── docs/ # Architecture, ADRs & planning docs ├── environments/ # Dev, Staging & Production configs ├── helm/ # Helm charts ├── kubernetes/ # Kubernetes manifests ├── logging/ # Fluent Bit configuration ├── messaging/ # RabbitMQ configuration ├── monitoring/ # Prometheus, Grafana, Loki ├── operations/ # Runbooks & production hardening ├── scripts/ # Automation scripts ├── security/ # RBAC, Trivy, Checkov, Gitleaks ├── services/ # All application services │ ├── frontend/ │ ├── api-gateway/ │ ├── auth-service/ │ ├── product-service/ │ ├── cart-service/ │ ├── order-service/ │ ├── payment-service/ │ └── notification-service/ ├── terraform/ # AWS Infrastructure ├── tests/ # Integration, Load & Security Tests │ ├── README.md ├── LICENSE ├── CHANGELOG.md └── Makefile 

🏢 Microservices Overview

The platform follows the Database-per-Service architectural pattern where every microservice owns its own database and can be independently developed, deployed, and scaled.

🌐 API Gateway

Technology: Spring Cloud Gateway

Responsibilities:

Centralized Routing

JWT Token Forwarding

Rate Limiting

Request Filtering

CORS

Circuit Breaker

Load Balancing

🔐 Authentication Service

Responsibilities:

User Registration

User Login

JWT Authentication

Refresh Tokens

Password Encryption

Role-Based Access Control (RBAC)

User Profile Management

Database:

PostgreSQL

Cache:

Redis

🛍️ Product Service

Responsibilities:

Product Catalog

Category Management

Inventory Management

Product Search

Redis Caching

Database:

PostgreSQL

Messaging:

RabbitMQ Events

🛒 Cart Service

Responsibilities:

Shopping Cart

Add to Cart

Remove Item

Update Quantity

Cart Expiration

Cart Synchronization

Storage:

Redis

📦 Order Service

Responsibilities:

Order Creation

Order Status Tracking

Checkout Process

Order History

Event Publishing

Database:

PostgreSQL

Messaging:

RabbitMQ

💳 Payment Service

Responsibilities:

Payment Processing

Payment Verification

Transaction History

Payment Events

Refund Support

Database:

PostgreSQL

Messaging:

RabbitMQ

📧 Notification Service

Responsibilities:

Email Notifications

Order Confirmation

Payment Confirmation

Shipping Updates

Event Consumers

Database:

PostgreSQL

Messaging:

RabbitMQ

💻 React Frontend

Responsibilities:

Customer Portal

Product Browsing

Shopping Cart

Checkout

User Dashboard

Admin Dashboard

🗄️ Database Architecture

The application follows the Database-per-Service pattern.

Auth Service │ ▼ Auth Database Product Service │ ▼ Product Database Order Service │ ▼ Order Database Payment Service │ ▼ Payment Database Notification Service │ ▼ Notification Database Cart Service │ ▼ Redis 

Each service owns its schema, ensuring:

Loose Coupling

Independent Scaling

Independent Deployments

Fault Isolation

High Availability

📨 Event-Driven Architecture

RabbitMQ enables asynchronous communication between services.

Published Events

ProductCreated

ProductUpdated

InventoryUpdated

OrderCreated

OrderConfirmed

PaymentInitiated

PaymentCompleted

PaymentFailed

NotificationRequested

Benefits

Loose Coupling

Better Scalability

Eventual Consistency

Improved Reliability

Fault Tolerance

🔄 Request Flow

Customer ↓ React Frontend ↓ API Gateway ↓ Authentication ↓ Business Services ↓ Database ↓ RabbitMQ Events ↓ Notification Service ↓ Customer 

📈 Scalability Features

The platform is designed to scale horizontally.

Implemented strategies include:

Stateless Microservices

Horizontal Pod Autoscaler (HPA)

Kubernetes Deployments

Redis Caching

RabbitMQ Queues

Database Connection Pooling

Circuit Breakers

Retry Mechanisms

Rolling Updates

Zero Downtime Deployment

This architecture supports production workloads while maintaining high availability and resilience.

🐳 Docker Containerization

Every application within the platform is containerized using Docker 27+ following enterprise-grade best practices.

Docker Features

Multi-stage Docker builds

Non-root containers

Lightweight runtime images

Optimized layer caching

Environment variable configuration

Health checks

Production-ready ENTRYPOINT

Dedicated .dockerignore files

Minimal image size

Dockerized Services

ServiceRuntimeReact FrontendNginxAPI GatewaySpring BootAuth ServiceSpring BootProduct ServiceSpring BootCart ServiceSpring BootOrder ServiceSpring BootPayment ServiceSpring BootNotification ServiceSpring BootPostgreSQLOfficial ImageRedisOfficial ImageRabbitMQOfficial Image

Docker Networking

The platform uses isolated Docker bridge networks.

Frontend Network │ ▼ API Gateway │ ▼ Backend Network │ ┌─────┴───────────────────────┐ │ │ Microservices RabbitMQ │ │ └──────────────┬──────────────┘ ▼ Infrastructure Network │ ┌────┴─────────────┐ │ │ PostgreSQL Redis 

Persistent Volumes

Docker volumes ensure persistent storage for stateful services.

VolumePurposepostgres-dataPostgreSQL Databaseredis-dataRedis Cacherabbitmq-dataRabbitMQ Messagesapplication-logsContainer Logs

☸ Kubernetes Deployment

The entire application is orchestrated using Kubernetes, providing high availability, self-healing, automatic scaling, and rolling deployments.

Kubernetes Architecture

Internet │ ▼ Ingress Controller │ ▼ API Gateway Service │ ▼ ┌──────────────────────────────────────┐ │ Kubernetes Cluster │ │ │ │ Auth Service │ │ Product Service │ │ Cart Service │ │ Order Service │ │ Payment Service │ │ Notification Service │ │ React Frontend │ └──────────────────────────────────────┘ │ ▼ PostgreSQL • Redis • RabbitMQ 

Kubernetes Components

The platform includes production-ready manifests for:

Namespaces

Deployments

Services

ConfigMaps

Secrets

PersistentVolumes

PersistentVolumeClaims

StorageClasses

Ingress

Horizontal Pod Autoscalers

Network Policies

Resource Quotas

Kubernetes Features

Rolling Updates

Rolling Rollbacks

Readiness Probes

Liveness Probes

Resource Requests

Resource Limits

Graceful Shutdown

Pod Anti-Affinity

Horizontal Pod Autoscaling

Zero Downtime Deployment

Namespaces

The platform is logically separated into namespaces.

NamespacePurposeecommerce-devDevelopmentecommerce-stagingStagingecommerce-productionProductionmonitoringMonitoring StackingressIngress Controller

Autoscaling

Horizontal Pod Autoscaler automatically scales services based on:

CPU Utilization

Memory Utilization

Example:

ServiceMin PodsMax PodsAPI Gateway210Auth Service210Product Service215Cart Service215Order Service210Payment Service28Notification Service28

📦 Helm Charts

Managing dozens of Kubernetes manifests manually quickly becomes difficult.

To solve this, the platform uses Helm.

Helm Features

DRY Templates

Environment-specific Values

Versioned Releases

Rollbacks

Easy Upgrades

Parameterized Configurations

Helm Structure

helm/ └── ecommerce/ ├── Chart.yaml ├── values.yaml ├── values-dev.yaml ├── values-staging.yaml ├── values-production.yaml └── templates/ 

Deployment Environments

EnvironmentConfigurationDevelopmentvalues-dev.yamlStagingvalues-staging.yamlProductionvalues-production.yaml

🔄 GitOps with Argo CD

The platform follows the GitOps deployment model using Argo CD.

Every deployment originates from Git.

Git becomes the single source of truth.

GitOps Workflow

Developer ↓ Git Push ↓ GitHub Repository ↓ GitHub Actions ↓ Container Registry ↓ Argo CD ↓ Helm Chart ↓ Kubernetes Cluster 

Argo CD Features

Automatic Synchronization

Drift Detection

Rollback Support

Health Monitoring

Sync Waves

App-of-Apps Pattern

Namespace Isolation

Deployment Flow

Developer pushes code.

GitHub Actions builds the project.

Docker images are published.

Helm chart values are updated.

Argo CD detects Git changes.

Kubernetes cluster synchronizes automatically.

New version is deployed.

☁️ AWS Infrastructure (Terraform)

All cloud infrastructure is provisioned using Terraform, ensuring repeatable, version-controlled infrastructure deployments.

AWS Services

ServicePurposeAmazon VPCNetwork IsolationAmazon EKSKubernetes ClusterAmazon RDSPostgreSQLAmazon ElastiCacheRedisAmazon MQRabbitMQIAMAccess ManagementSecurity GroupsFirewall RulesRoute53DNSApplication Load BalancerTraffic Distribution

Terraform Modules

terraform/ ├── modules/ │ ├── vpc/ │ ├── eks/ │ ├── iam/ │ ├── rds/ │ ├── redis/ │ ├── load-balancer/ │ └── route53/ │ ├── environments/ │ ├── dev/ │ ├── staging/ │ └── production/ 

Infrastructure Provisioning Flow

Terraform ↓ AWS VPC ↓ Amazon EKS ↓ Amazon RDS ↓ Amazon ElastiCache ↓ Amazon MQ ↓ Application Load Balancer ↓ Route53 

🚀 Deployment Lifecycle

Developer ↓ Git Commit ↓ GitHub Actions ↓ Build & Test ↓ Docker Images ↓ GitHub Container Registry ↓ Argo CD ↓ Helm ↓ Kubernetes ↓ Production Deployment 

Production Deployment Highlights

Infrastructure as Code (Terraform)

Immutable Docker Images

Kubernetes Orchestration

GitOps Deployments

Zero Downtime Updates

Automated Rollbacks

Multi-Environment Support

Production-Ready Configuration

Highly Available Architecture

Enterprise Scalability

---

# ⚡ Quick Start (Local Development)

## 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/production-grade-ecommerce-microservices-platform-on-kubernetes.git

cd production-grade-ecommerce-microservices-platform-on-kubernetes
```

---

## 2 — Configure Environment Variables

Copy the example environment file.

```bash
cp .env.example .env
```

Update the values according to your local environment.

Example:

```env
SPRING_PROFILES_ACTIVE=dev

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ecommerce
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

REDIS_HOST=localhost
REDIS_PORT=6379

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

JWT_SECRET=your-secret-key

VITE_API_BASE_URL=http://localhost:8080
```

---

## 3 — Run Using Docker Compose (Recommended)

Start the complete platform.

```bash
docker compose -f docker/docker-compose.dev.yml up --build
```

This will automatically start:

- PostgreSQL
- Redis
- RabbitMQ
- Auth Service
- Product Service
- Cart Service
- Order Service
- Payment Service
- Notification Service
- API Gateway
- React Frontend

---

## 4 — Run Backend Services Individually

Build the project.

```bash
mvn clean install
```

Run an individual microservice.

Example:

```bash
cd services/auth-service

mvn spring-boot:run
```

Repeat for the remaining services.

---

## 5 — Run Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend will be available at:

```
http://localhost:5173
```

---

## 6 — Access the Platform

| Component | URL |
|-----------|-----|
| React Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Swagger (Auth) | http://localhost:8081/swagger-ui |
| Swagger (Product) | http://localhost:8082/swagger-ui |
| RabbitMQ Management | http://localhost:15672 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

---

## 7 — Verify the Deployment

Health endpoints:

```bash
GET /actuator/health
```

Example:

```bash
curl http://localhost:8080/actuator/health
```

Expected response:

```json
{
  "status": "UP"
}
```

---

## Development Workflow

```text
Developer
      │
      ▼
Git Pull
      │
      ▼
Docker Compose
      │
      ▼
Frontend + Backend + Infrastructure
      │
      ▼
Develop Features
      │
      ▼
Commit Changes
      │
      ▼
Push to GitHub
      │
      ▼
GitHub Actions
```

---

## Default Credentials (Development Only)

| Username | Password | Role |
|----------|----------|------|
| admin@ecommerce.com | admin123 | ADMIN |

> **Note:** These credentials are intended **only for local development**. Change them immediately before deploying to any shared or production environment.

---
