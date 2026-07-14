# SLAs, SLOs, and Error Budgets

To measure and maintain the reliability of the E-Commerce Platform, we define the following Service Level Agreements (SLA), Objectives (SLO), and Indicators (SLI).

## 1. Definitions
*   **SLA**: The legal/business agreement with customers (e.g., 99.9% uptime). Violations may result in financial penalties.
*   **SLO**: The internal target set by engineering (e.g., 99.95% uptime). Stricter than the SLA to provide a buffer.
*   **SLI**: The actual measurement (e.g., Successful HTTP requests / Total HTTP requests).
*   **Error Budget**: The acceptable amount of unreliability (e.g., 100% - 99.95% = 0.05% of requests can fail).

## 2. Platform SLO Targets

### Availability (Uptime)
*   **Target**: 99.95% (Allows ~21.6 minutes of downtime per month).
*   **SLI**: (Total HTTP 2xx, 3xx, 4xx) / (Total HTTP Requests) measured at the API Gateway.
*   *Note*: 5xx errors count against availability. 4xx errors (user error) do not.

### Latency (Performance)
*   **Target**: 95% of requests complete in < 300ms; 99% complete in < 800ms.
*   **SLI**: Request duration measured at the API Gateway or Ingress controller.

### Throughput (Capacity)
*   **Target**: Capable of handling 5,000 requests per second at peak.
*   **SLI**: Request rate (req/sec).

## 3. Error Budget Policies
*   **Healthy Budget**: Feature development continues normally.
*   **Budget Exhausted (<0%)**: All feature development halts. Engineering focuses 100% on reliability, technical debt, and resilience until the budget recovers (rolling 30-day window).

## 4. Monitoring & Alerting
*   Prometheus records the SLIs.
*   Alertmanager sends warnings to Slack when the error budget burn rate is high (e.g., burning 10% of the budget in 1 hour).
*   Alertmanager sends PagerDuty alerts for critical burn rates (e.g., burning 5% of the budget in 5 minutes).
