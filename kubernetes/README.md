# Kubernetes Manifests

This directory contains the raw Kubernetes manifests used for local development (e.g., Minikube).

**Note for Production:** Production deployments use the Helm charts located in the `helm/` directory, managed by Argo CD.

## Usage (Local Dev)
```bash
kubectl apply -f namespaces.yaml
kubectl apply -f services/
```
