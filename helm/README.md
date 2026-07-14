# Helm Charts

This directory contains the Helm chart for deploying the entire E-Commerce Platform.

## Structure
*   `ecommerce-platform/`: An umbrella chart that deploys all microservices.
*   `ecommerce-platform/templates/`: Abstractions for Deployments, Services, and ConfigMaps.
*   `ecommerce-platform/values-dev.yaml`: Overrides for the development environment.
*   `ecommerce-platform/values-prod.yaml`: Overrides for the production environment.

## Usage
```bash
helm install ecommerce-prod ./ecommerce-platform -n e-commerce -f ecommerce-platform/values-prod.yaml
```
