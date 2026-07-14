# ADR-008: Why Prometheus, Grafana, and Loki instead of Traditional Monitoring

*   **ADR Number:** 008
*   **Title:** Selection of the Prometheus/Grafana/Loki Observability Stack
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
Operating a microservices architecture requires deep visibility into metrics (CPU, memory, request latency), logs (application errors, traces), and alerts.

## Problem Statement
Traditional monitoring tools (like Nagios) are server-centric and struggle with the ephemeral nature of Kubernetes Pods. Commercial APM solutions (Datadog, New Relic) are extremely expensive at scale.

## Decision
We will adopt the open-source cloud-native observability stack:
*   **Prometheus:** For metrics scraping and time-series data storage.
*   **Grafana:** For data visualization and dashboarding.
*   **Loki:** For log aggregation (fed by Fluent Bit).
*   **AlertManager:** For routing alerts to Slack/PagerDuty.

## Alternatives Considered
*   **Datadog / New Relic:** Rejected strictly due to high licensing costs for an enterprise at scale, though they offer superior out-of-the-box APM.
*   **ELK Stack (Elasticsearch, Logstash, Kibana):** Rejected for logging due to its high resource consumption (JVM) and maintenance overhead compared to Loki.

## Advantages
*   **Kubernetes Native:** Prometheus was built for Kubernetes. It automatically discovers targets via ServiceMonitors.
*   **Cost-Effective:** Fully open-source. Loki is specifically designed to be lightweight by only indexing metadata (labels), not the full log text, storing chunks in cheap S3 storage.
*   **Unified Ecosystem:** Grafana seamlessly integrates Prometheus metrics and Loki logs in a single pane of glass, allowing context switching (e.g., clicking a spike in a metric to see the exact logs at that timestamp).

## Disadvantages
*   **Maintenance:** Requires self-hosting and managing the observability stack.
*   **Query Languages:** Teams must learn PromQL (metrics) and LogQL (logs).
*   **Log Searching:** Loki is not optimized for full-text search across terabytes of logs compared to Elasticsearch.

## Risks
*   **Storage Costs:** If metrics cardinality explodes (e.g., tracking a metric per user ID), Prometheus memory will exhaust and storage costs will spike.

## Consequences
We will deploy the `kube-prometheus-stack` via Helm. Developers must instrument their Spring Boot applications using Micrometer and expose the `/actuator/prometheus` endpoint. Standard structured logging (JSON) is enforced.

## Operational Impact
Moderate. The observability stack itself requires monitoring (meta-monitoring).

## Performance Impact
Fluent Bit and Prometheus node-exporters consume minor resources on worker nodes. Application overhead for exposing metrics is negligible.

## Security Impact
Metrics and logs may inadvertently capture sensitive PII. Developers must sanitize logs. Access to Grafana must be secured via SSO.

## Cost Impact
Significantly cheaper than commercial alternatives, paying only for the underlying EBS/S3 storage and EC2 compute.

## Future Considerations
Integrate OpenTelemetry for distributed tracing (Tempo/Jaeger) to trace requests across the API Gateway and microservices.

## References
*   CNCF Observability Landscape
