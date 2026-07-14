# Security & Compliance

This directory contains the security configurations, policies, and compliance documentation for the Production-Grade E-Commerce Platform.

## Defense-in-Depth Architecture

Security is implemented across multiple layers of the platform:

1.  **Source Code & Build Security**:
    *   **Gitleaks**: Scans for secrets in code.
    *   **Trivy**: Scans container images for vulnerabilities.
    *   **Cosign**: Signs container images to ensure integrity.
    *   **SBOM**: CycloneDX SBOMs are generated for transparency.

2.  **Infrastructure Security**:
    *   **Checkov**: Static analysis of Terraform and Kubernetes YAML for misconfigurations.
    *   **AWS IAM**: Least privilege access policies (managed via Terraform).

3.  **Kubernetes Security**:
    *   **RBAC**: Fine-grained access control using least privilege Service Accounts.
    *   **Network Policies**: Default deny-all, with explicit ingress/egress rules per microservice.
    *   **Pod Security Standards**: Enforcing the `Restricted` profile (non-root, read-only filesystem, dropped capabilities).
    *   **Secrets Management**: Integration with AWS Secrets Manager via External Secrets Operator.

4.  **Application Security**:
    *   **Authentication**: JWT-based stateless authentication.
    *   **Encryption**: TLS 1.3 for data in transit; encrypted databases for data at rest.

## Directory Structure

*   `checkov/`: IaC scanning configuration.
*   `compliance/`: Documentation aligning with OWASP Top 10 and CIS Benchmarks.
*   `gitleaks/`: Secret scanning configuration.
*   `image-signing/`: Workflows for Cosign and SBOMs.
*   `network-policies/`: Kubernetes Network Policies.
*   `pod-security/`: Pod Security Standards and Contexts.
*   `rbac/`: Kubernetes Service Accounts, Roles, and RoleBindings.
*   `secrets/`: External Secrets Operator configurations.
*   `trivy/`: Container scanning configuration.

## Validation & Continuous Scanning

These configurations are designed to be integrated into the CI/CD pipeline (e.g., GitHub Actions or GitLab CI) to ensure continuous security validation. Any PR failing Checkov, Trivy, or Gitleaks scans should be blocked.
