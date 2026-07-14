# Runbook: Service Restart and CrashLoopBackOff

## Symptoms
* Alerts firing for `KubernetesPodCrashLooping` or `HighErrorRate`.
* The application is unresponsive or returning HTTP 50x errors.
* `kubectl get pods -n e-commerce` shows pods in `CrashLoopBackOff` or `Error` state.

## Diagnosis
1.  **Check Pod Logs**: Find out why the application is crashing.
    ```bash
    kubectl logs -n e-commerce <pod-name> --previous
    ```
2.  **Describe Pod**: Look for OOMKilled events or Probe failures.
    ```bash
    kubectl describe pod -n e-commerce <pod-name>
    ```
3.  **Check Dependencies**: The service might be crashing because a downstream dependency (DB, RabbitMQ, another service) is unreachable.

## Resolution
1.  **Graceful Restart**: If the service is stuck in a bad state (deadlock, connection pool exhaustion) but logs indicate no hard code error, perform a rolling restart:
    ```bash
    kubectl rollout restart deployment <deployment-name> -n e-commerce
    ```
2.  **Configuration Error**: If the crash is due to a bad configuration (e.g., missing Secret), update the Secret in AWS Secrets Manager or the ConfigMap, and restart the pods.
3.  **Rollback**: If the crash started immediately after a deployment, rollback via Argo CD or Helm:
    ```bash
    helm rollback <release-name> <previous-revision> -n e-commerce
    ```

## Verification
*   Monitor `kubectl get pods -n e-commerce -w`. Ensure pods reach the `Running` state and all containers are `Ready` (e.g., `1/1`).
*   Check application metrics in Grafana to ensure traffic is flowing successfully.
