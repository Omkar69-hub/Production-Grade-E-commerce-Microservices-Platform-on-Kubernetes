# Runbook: High Resource Usage (CPU/Memory)

## Symptoms
*   Prometheus alerts firing for `NodeHighCPU`, `PodHighMemory`, or `OOMKilled`.
*   Application latency is significantly degraded.
*   Kubernetes nodes are becoming `NotReady`.

## Diagnosis
1.  **Identify the Culprit**: Use Grafana dashboards or `kubectl top` to find the resource-heavy pods/nodes.
    ```bash
    kubectl top pods -n e-commerce
    kubectl top nodes
    ```
2.  **Analyze Memory (OOMKilled)**: If a pod was OOMKilled, it exceeded its memory limit. Check the logs prior to the crash.
3.  **Analyze CPU**: If CPU is pegged at 100%, check if the application is stuck in an infinite loop or handling a traffic spike.
4.  **Check Autoscaling (HPA/VPA)**: Verify if the Horizontal Pod Autoscaler is attempting to scale up.
    ```bash
    kubectl get hpa -n e-commerce
    ```

## Resolution
1.  **Traffic Spike (Expected)**:
    *   If HPA is maxed out, manually increase the `maxReplicas` in the HPA configuration.
    *   If the cluster is out of capacity, ensure the Cluster Autoscaler is provisioning new nodes.
2.  **Memory Leak (Unexpected)**:
    *   If a specific pod is consuming memory steadily over time (leak), a temporary fix is to restart the deployment: `kubectl rollout restart deployment <name>`.
    *   Capture a heap dump before restarting if possible, and escalate to the engineering team for a permanent fix.
3.  **Under-provisioned Resource Limits**:
    *   If the application legitimately needs more memory (e.g., processing larger payloads), update the `resources.limits.memory` in the Helm chart/Deployment manifest.

## Verification
*   Monitor `kubectl top pods` and Grafana dashboards to ensure CPU and Memory stabilize below 80% utilization.
