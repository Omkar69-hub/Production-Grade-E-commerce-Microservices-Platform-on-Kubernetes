# Kubernetes Validation Guide

After a deployment or Helm upgrade, it is critical to validate the health of the Kubernetes cluster.

## Smoke Testing Script

We provide a bash script to automate deployment verification.

### Execution
```bash
./tests/kubernetes/smoke-test.sh
```

### What it does:
1. Iterates through the list of critical deployments (Gateway, Auth, Product, DBs, etc.).
2. Uses `kubectl rollout status` to wait for the deployment to successfully roll out.
3. If a deployment fails to become ready within the timeout (120s), the script exits with an error.

## Manual Troubleshooting

If the smoke test fails, investigate using the following commands:

**Check Pod Status:**
```bash
kubectl get pods -n e-commerce
```

**View Pod Logs:**
```bash
kubectl logs <pod-name> -n e-commerce
```

**Describe Pod Events (Useful for CrashLoopBackOff or ImagePullBackOff):**
```bash
kubectl describe pod <pod-name> -n e-commerce
```

## Helm Tests

If deploying via Helm, ensure you include test hooks in your chart (e.g., `helm.sh/hook: test`).
You can execute them via:
```bash
helm test ecommerce-platform -n e-commerce
```
