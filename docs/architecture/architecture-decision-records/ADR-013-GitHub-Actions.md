# ADR-013: Why GitHub Actions

*   **ADR Number:** 013
*   **Title:** Adoption of GitHub Actions for Continuous Integration (CI)
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
To support our agile development process, we need a Continuous Integration (CI) pipeline to automatically build, test, and containerize our microservices every time code is pushed.

## Problem Statement
We need a CI tool that is tightly integrated with our source code repository, easy to configure via code (YAML), and capable of scaling without us having to manage the underlying build infrastructure.

## Decision
We will use **GitHub Actions** as our primary CI platform.

## Alternatives Considered
*   **Jenkins:** Rejected. Requires hosting, patching, and maintaining a dedicated Jenkins server. Configuration (Groovy pipelines) is often brittle and heavily dependent on plugins that frequently break.
*   **GitLab CI/CD:** Considered. Excellent tool, but since our source code is hosted on GitHub, GitHub Actions provides a more seamless, native experience.
*   **CircleCI:** Considered. A strong SaaS alternative, but GitHub Actions is included natively with GitHub, reducing tool sprawl and licensing complexity.

## Advantages
*   **Native Integration:** Triggered directly by GitHub events (Push, PR, Release).
*   **Managed Runners:** No infrastructure to maintain. GitHub provides scalable, ephemeral runners for building applications.
*   **Marketplace Ecosystem:** Access to thousands of pre-built actions (e.g., Setup Java, Docker Buildx, Trivy scanner).
*   **Matrix Builds:** Easily test across multiple Java or Node versions simultaneously.

## Disadvantages
*   **Vendor Lock-in:** Workflows are heavily tied to GitHub's specific syntax.
*   **Cost at Scale:** While generous free tiers exist, massive enterprise usage of GitHub-hosted runners can become expensive, requiring a shift to self-hosted runners.

## Risks
*   **Security:** Using third-party actions from the marketplace introduces supply chain risks.

## Consequences
All CI pipelines will be defined in `.github/workflows/`. We will strictly pin third-party actions to specific commit SHAs (not just tags) to prevent supply chain attacks. 

## Operational Impact
Low. We do not have to manage build servers.

## Performance Impact
Fast, parallelized builds on ephemeral runners.

## Security Impact
Requires careful management of GitHub Secrets (e.g., Docker registry credentials). We will use OIDC to authenticate with AWS instead of storing long-lived IAM keys.

## Cost Impact
Cost-effective. Can fallback to self-hosted runners on EKS if GitHub minutes become too expensive.

## Future Considerations
If compliance dictates entirely private build infrastructure, we will deploy Actions Runner Controller (ARC) to host GitHub runners on our own Kubernetes cluster.

## References
*   GitHub Actions Documentation
