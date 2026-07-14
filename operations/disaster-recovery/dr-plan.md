# Disaster Recovery (DR) Plan

## 1. Objectives
*   **Recovery Time Objective (RTO)**: 4 hours (Time to restore full platform availability).
*   **Recovery Point Objective (RPO)**: 15 minutes (Maximum acceptable data loss).

## 2. DR Architecture
The platform is currently deployed in a single AWS Region across multiple Availability Zones (Multi-AZ).
*   **Active-Passive DR Strategy**: The primary region is `us-east-1`. In the event of a total region failure, infrastructure will be recreated in a secondary region (`us-west-2`).

## 3. Regional Failure Recovery Steps (AWS `us-east-1` goes down)

### Step 1: Infrastructure Provisioning (RTO + 30 mins)
1. Update Terraform variables to target `us-west-2`.
2. Run `terraform apply` to provision the foundational network (VPC, Subnets) and the new EKS cluster.
3. Terraform will provision the Multi-AZ RDS, ElastiCache, and Amazon MQ instances in the new region.

### Step 2: Database Restoration (RTO + 60 mins)
1. Use AWS Backup cross-region replication to restore the RDS snapshot into the newly provisioned RDS instance in `us-west-2`.
2. Update Route 53 / Internal DNS to point to the new RDS endpoint.

### Step 3: Application Deployment via GitOps (RTO + 90 mins)
1. Install Argo CD on the new EKS cluster.
2. Apply the Argo CD "App of Apps" root manifest pointing to the GitHub repository.
3. Argo CD will automatically sync and deploy all Kubernetes manifests (Namespaces, RBAC, Network Policies, Deployments, Services).

### Step 4: Traffic Cutover (RTO + 120 mins)
1. Verify application health in the new region via internal endpoints.
2. Update the public Route 53 DNS records for the API Gateway to point to the new Ingress Controller LoadBalancer in `us-west-2`.
3. Wait for DNS propagation.

## 4. Localized Failures (Component Level)

### AZ Failure
*   **Mitigation**: RDS Multi-AZ automatically fails over. EKS Nodes span multiple AZs. EKS Control plane is highly available by AWS. Pods are redistributed automatically by Kubernetes.

### Kubernetes Cluster Corruption
*   **Mitigation**: If the EKS cluster state is unrecoverable but AWS infrastructure is fine, spin up a new EKS cluster via Terraform and let Argo CD repopulate the state.

## 5. DR Testing
*   Tabletop DR exercises must be conducted quarterly.
*   A full GameDay DR simulation (failing over to the secondary region) must be executed annually.
