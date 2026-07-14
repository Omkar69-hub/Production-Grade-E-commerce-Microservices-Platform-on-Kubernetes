# DevOps Workflow

When asked to explain the CI/CD pipeline:

"I implemented a true GitOps workflow. 

**CI Pipeline (GitHub Actions):**
When a developer pushes code, GitHub Actions triggers a build. It compiles the code, runs unit tests (JUnit) and integration tests (Testcontainers), performs static code analysis (SonarQube) and security scans (Checkov/Trivy). If everything passes, it builds a Docker image, pushes it to Docker Hub/ECR, and finally updates the image tag in the Helm chart repository.

**CD Pipeline (Argo CD):**
Instead of the CI server pushing to production, I use Argo CD running inside the Kubernetes cluster. It constantly monitors the Git repository. When it sees the updated Helm chart with the new image tag, it automatically syncs the cluster state to match the Git state. This pull-based mechanism is much more secure, as the CI server doesn't need admin access to the production cluster."
