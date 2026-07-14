# CI/CD Pipeline Architecture (GitHub Actions)

This directory contains the continuous integration and continuous deployment (CI/CD) pipelines for the Production-Grade E-Commerce Platform.

## Workflows Overview

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **Continuous Integration** | `ci.yml` | PRs, `main` push | Builds the shared-library, React frontend, and all 7 Spring Boot microservices in parallel. Executes tests and linting. |
| **Continuous Deployment** | `cd.yml` | `main` push | Builds Docker images using Buildx (layer caching) and pushes them to GitHub Container Registry (GHCR) tagged with `latest` and the Git SHA. |
| **Security & Quality Gates** | `security-scan.yaml` | Nightly, PRs | Runs Trivy vulnerability scans on the filesystem (dependencies) and Infrastructure as Code (Helm charts). Uploads SARIF results to GitHub Security. |
| **Helm Packaging** | `helm-package.yaml` | `main` push (helm/*) | Lints and packages the Helm chart into a `.tgz` artifact. |
| **Release Management** | `release.yaml` | Tag push (`v*.*.*`) | Retags existing `latest` images with the semantic version tag, pushes them to GHCR, and creates an automated GitHub Release with generated release notes. |

## Required GitHub Secrets
To properly execute these workflows, the following secrets must be configured in your GitHub Repository settings (`Settings -> Secrets and variables -> Actions`):

- **`GITHUB_TOKEN`**: (Automatically provided by GitHub) Used to authenticate with GHCR and upload SARIF files. Ensure "Read and write permissions" are granted under `Settings -> Actions -> General`.
- **`SLACK_WEBHOOK_URL`** (Optional): If you wish to enable Slack notifications for pipeline failures, add this secret and uncomment the notification steps in the workflows (Notification integration ready but gated).

## Required GitHub Variables
- **`REGISTRY_URL`** (Optional): Currently defaults to `ghcr.io` in the workflow environments. If you switch to Docker Hub, set this to `docker.io` and provide `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` as secrets.

## Build Strategy & Caching
- **Matrix Builds**: Both `ci.yaml` and `cd.yaml` utilize GitHub Actions `strategy.matrix` to build the 7 backend microservices concurrently, dramatically reducing total pipeline execution time.
- **Dependency Caching**: Maven (`~/.m2`) and npm (`~/.npm`) dependencies are cached between runs using `actions/setup-java` and `actions/setup-node`.
- **Docker Layer Caching**: `docker/build-push-action` uses `type=gha` (GitHub Actions cache) to cache Docker image layers, speeding up subsequent builds significantly.
