# E-Commerce Platform Helm Chart

This is the official Helm Chart for deploying the Production-Grade E-Commerce Microservices Platform.

## Architecture
This is a unified monolithic umbrella chart that deploys:
- 1x React Frontend
- 7x Spring Boot Backend Microservices
- 3x Infrastructure Stateful Components (Postgres, Redis, RabbitMQ)
- Associated resources (ConfigMaps, Secrets, Ingress, NetworkPolicies, HPAs, PVs/PVCs)

## Prerequisites
- Helm v3.0+
- Kubernetes 1.25+
- NGINX Ingress Controller

## Environments
This chart is highly configurable and supports seamless promotion across environments via values files.

### Development (`values-dev.yaml`)
- 1 Replica per service
- Minimal Resource Requests/Limits
- Disabled HPA
- Host: `dev.ecommerce.local`

### Staging (`values-staging.yaml`)
- 2 Replicas per service
- Moderate Resource Requests/Limits
- Moderate HPA scaling (Max 4)
- Host: `staging.ecommerce.local`

### Production (`values-production.yaml`)
- 3 Replicas per service
- High Resource Requests/Limits
- Aggressive HPA scaling (Max 10-20)
- Host: `ecommerce.production.com`

## Installation
Deploy to production:
```bash
helm install ecommerce ./helm/ecommerce -f ./helm/ecommerce/values-production.yaml -n ecommerce --create-namespace
```

Deploy to development:
```bash
helm install ecommerce-dev ./helm/ecommerce -f ./helm/ecommerce/values-dev.yaml -n ecommerce-dev --create-namespace
```

## Upgrading
To upgrade a release (e.g., after changing an image tag in `values-production.yaml`):
```bash
helm upgrade ecommerce ./helm/ecommerce -f ./helm/ecommerce/values-production.yaml -n ecommerce
```

## Rollback
If a deployment fails or degrades performance, simply rollback to the previous Helm revision:
```bash
helm rollback ecommerce -n ecommerce
```

## Uninstall
To completely remove the platform from the cluster:
```bash
helm uninstall ecommerce -n ecommerce
```

## Best Practices
- **Never store sensitive data in values.yaml**. Use external secrets managers in production or override values dynamically via CI/CD (e.g., `--set secrets.DB_PASSWORD=$DB_PASSWORD`).
- **DRY Templating**: Notice that all 7 microservices are generated dynamically using `range` over `.Values.backends` in `templates/backend/deployment.yaml`. This ensures a single source of truth for microservice configurations.
