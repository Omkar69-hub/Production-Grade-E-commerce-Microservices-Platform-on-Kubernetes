# GitOps Configurations (Argo CD)

This directory contains the Argo CD declarative application definitions.

We follow the "App of Apps" pattern to manage the entire cluster state.

## Usage
1. Install Argo CD on the cluster.
2. Apply the root application:
```bash
kubectl apply -f root-app.yaml
```
Argo CD will automatically discover and sync all child applications defined in this directory.
