# Monitoring & Observability Stack

This directory contains the configurations for the production-grade Observability Stack, deployed automatically via Argo CD.

## Architecture

The monitoring platform is built using best-in-class open-source tools:
- **Prometheus** (via `kube-prometheus-stack`): Scrapes metrics from Kubernetes nodes, pods, and all Java Spring Boot microservices.
- **Alertmanager**: Routes critical alerts (e.g., High CPU, Pod CrashLoop, 5xx Errors) to Slack/Email.
- **Grafana**: Visualizes metrics and logs. Automatically provisions data sources and dashboards.
- **Fluent Bit**: Deployed as a DaemonSet to automatically collect all stdout/stderr logs from all pods, parse Kubernetes metadata, and forward them to Loki.
- **Loki**: Horizontally scalable, highly available log aggregation system.

## GitOps Deployment Flow
We use Argo CD's "Multiple Sources" feature. The Argo CD Applications (located in `argocd/applications/`) download the official upstream Helm charts (from Prometheus Community, Grafana, and Fluent) but apply the custom `values.yaml` files stored in this exact directory.

## Dashboards
Custom JSON dashboards (such as the `business-kpi-dashboard.yaml` ConfigMap) are automatically picked up by Grafana's sidecar container because they are labeled with `grafana_dashboard: "1"`.

## Service Discovery
Prometheus uses the `ServiceMonitor` Custom Resource Definition (CRD) to automatically discover targets. The `backend-servicemonitor.yaml` specifically selects any service labeled with `app: {api-gateway|auth-service|...}` and scrapes the `/actuator/prometheus` endpoint every 15 seconds.

## Adding New Alerts
To add a new alert, edit the `prometheus/rules/alert-rules.yaml` file. Because this is GitOps, once you commit and push the rule, Argo CD will sync it, and the Prometheus Operator will dynamically reload Prometheus without dropping any data.
