# ADR-005: Why Helm instead of Plain Kubernetes YAML

*   **ADR Number:** 005
*   **Title:** Adoption of Helm for Kubernetes Package Management
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
Deploying our microservices to Kubernetes requires numerous resources (Deployments, Services, Ingress, ConfigMaps, Secrets, HPA). Managing plain YAML files for multiple environments (Dev, Staging, Prod) leads to massive duplication.

## Problem Statement
We need a templating and package management solution to dry up our Kubernetes manifests and manage environment-specific configurations efficiently without copying and pasting YAML.

## Decision
We will use **Helm 3.x** to package and deploy our applications to Kubernetes.

## Alternatives Considered
*   **Plain YAML with `sed`/`envsubst`:** Rejected as error-prone, unmaintainable, and lacking version control for application packages.
*   **Kustomize:** Considered. Kustomize uses a patch-based approach. However, Helm offers a richer ecosystem, better templating logic (loops, conditionals), and the concept of versioned "Charts" which integrates perfectly with our GitOps strategy.

## Advantages
*   **Templating:** Allows dynamic generation of YAML based on environment values (`values-dev.yaml`, `values-prod.yaml`).
*   **Reusability:** We can create a single generic "microservice" Helm chart that all our Spring Boot services inherit from, drastically reducing boilerplate.
*   **Package Management:** Helm allows us to easily install third-party dependencies (e.g., Redis, RabbitMQ, Prometheus) via public Helm repositories.
*   **Rollbacks:** Helm maintains a release history, allowing simple rollbacks (though we will primarily rely on ArgoCD for this).

## Disadvantages
*   **Complexity in Templates:** Overusing Go templating logic inside Helm charts can make them difficult to read and debug.
*   **Security:** Chart developers must be careful not to expose sensitive data in plaintext `values.yaml`.

## Risks
*   "Template Soup" if charts are not kept simple and modular.

## Consequences
We will develop a standard internal Helm chart for our Spring Boot applications. Third-party infrastructure will be deployed using official community charts.

## Operational Impact
Low. Helm is standard in the industry and integrates seamlessly with Argo CD.

## Performance Impact
None on the running application. Slightly impacts CI/CD deployment time during template rendering.

## Security Impact
Requires careful management of Secrets. We will use Helm in conjunction with sealed-secrets or external-secrets operators so we don't commit plain text secrets to Git.

## Cost Impact
None. Helm is free and open-source.

## Future Considerations
Evaluate using Kustomize *with* Helm (supported by ArgoCD) if we need to apply specific overlays on top of third-party Helm charts without modifying their source.

## References
*   Helm Documentation
