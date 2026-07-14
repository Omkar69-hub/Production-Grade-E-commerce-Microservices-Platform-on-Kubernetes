# Lessons Learned

*   **Security is a Layered Approach**: You can't just rely on a firewall. You need code scanning (Trivy), IaC scanning (Checkov), network isolation, and strict RBAC.
*   **GitOps is a Game Changer**: Using Argo CD eliminates the fear of deployment. If a deployment fails, Kubernetes auto-heals, and if the config is wrong, it's a simple `git revert`.
*   **Infrastructure as Code Requires Discipline**: Managing Terraform state manually is dangerous. Always use remote state locking (S3/DynamoDB) from day one.
