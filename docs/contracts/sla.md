# Service Level Agreements (SLA)

## 1. Overview
This document defines the expected availability and performance metrics for the core microservices in the Production-Grade E-Commerce Platform.

## 2. Targets

| Service | Target Availability | Target P95 Latency | Error Budget (Monthly) |
| :--- | :--- | :--- | :--- |
| **API Gateway** | 99.99% | < 50ms | 4.38 minutes |
| **Auth Service** | 99.99% | < 100ms | 4.38 minutes |
| **Product Service**| 99.95% | < 200ms | 21.9 minutes |
| **Cart Service** | 99.95% | < 50ms (Redis) | 21.9 minutes |
| **Order Service** | 99.9% | < 500ms | 43.8 minutes |
| **Payment Service**| 99.9% | < 1000ms | 43.8 minutes |

## 3. Recovery Targets (Disaster Recovery)
*   **Recovery Point Objective (RPO):** 5 minutes (Maximum acceptable data loss).
*   **Recovery Time Objective (RTO):** 4 hours (Maximum acceptable downtime during a full regional outage).

## 4. Monitoring & Alerting
Prometheus calculates SLAs in real-time based on the percentage of HTTP `5xx` errors and request duration percentiles. If the rolling 30-day error budget is exhausted, a freeze on non-critical feature deployments is enforced until reliability improves.
