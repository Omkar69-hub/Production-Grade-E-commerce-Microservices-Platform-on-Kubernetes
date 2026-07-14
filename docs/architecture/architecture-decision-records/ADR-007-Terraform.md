# ADR-007: Why Terraform instead of Manual Infrastructure Provisioning

*   **ADR Number:** 007
*   **Title:** Adoption of Terraform for Infrastructure as Code (IaC)
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
The e-commerce platform relies on complex AWS infrastructure: VPCs, Subnets, NAT Gateways, EKS Clusters, IAM roles, RDS instances, and ElastiCache. 

## Problem Statement
Provisioning this infrastructure manually via the AWS Console is error-prone, untraceable, non-repeatable, and impossible to review in a pull request. Scaling to new environments (e.g., creating a new Staging environment) would take days of manual clicking.

## Decision
We will use **HashiCorp Terraform (v1.x)** to define, provision, and manage all cloud infrastructure declaratively.

## Alternatives Considered
*   **AWS CloudFormation:** Rejected to avoid vendor lock-in. Terraform provides a multi-cloud capability and a more readable syntax (HCL vs JSON/YAML).
*   **AWS CDK:** Considered. While allowing imperative programming languages, Terraform's declarative approach and massive ecosystem of pre-built modules (e.g., `terraform-aws-eks`) make it more suitable for our SRE and DevOps teams.
*   **Pulumi:** Rejected. Terraform has a larger talent pool and wider enterprise adoption.

## Advantages
*   **Reproducibility:** We can spin up an identical clone of production in a different region in minutes.
*   **Version Control:** Infrastructure changes are reviewed via PRs, enforcing the "four-eyes" principle.
*   **State Management:** Terraform knows what it created and can calculate exact execution plans (`terraform plan`) before applying changes.
*   **Modularity:** We can use Terraform modules to abstract complex setups (e.g., standardizing VPC creation).

## Disadvantages
*   **State File Security:** The Terraform state file contains sensitive data (e.g., initial database passwords) and must be secured strictly.
*   **Learning Curve:** HCL syntax and state management concepts require training.

## Risks
*   **State Corruption:** If the remote state backend (S3/DynamoDB) is corrupted, Terraform loses track of the infrastructure.
*   **Out-of-Band Changes:** If an engineer modifies a resource via the AWS Console, it causes state drift.

## Consequences
All AWS infrastructure access will be restricted to read-only for humans. Changes MUST go through the Terraform CI/CD pipeline via GitHub Actions. We will use an S3 bucket with versioning and DynamoDB for state locking.

## Operational Impact
High initial effort to codify everything. Massive reduction in operational toil long-term.

## Performance Impact
N/A (IaC does not impact runtime performance).

## Security Impact
Positive. Infrastructure can be scanned for misconfigurations (using Checkov) before it is even provisioned. State files must be heavily restricted via IAM.

## Cost Impact
Terraform is free. It helps reduce costs by allowing us to easily tear down unused environments.

## Future Considerations
Explore Terraform Cloud or Spacelift for managed state and advanced RBAC over infrastructure deployments.

## References
*   Infrastructure as Code by Kief Morris
