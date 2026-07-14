# Business Continuity Plan (BCP)

This document outlines the processes for maintaining operational continuity during planned and unplanned events.

## 1. Planned Maintenance Windows
*   **Schedule**: Major infrastructure upgrades (e.g., Kubernetes version upgrades, major database version upgrades) must be scheduled during off-peak hours (e.g., Tuesday 02:00 AM - 04:00 AM UTC).
*   **Notification**: Customers must be notified of planned downtime 7 days in advance via the status page and email.
*   **Zero-Downtime**: Routine application deployments are designed to be zero-downtime (Rolling Updates) and do not require a maintenance window.

## 2. Change Management Process
All changes to the production environment must go through the following workflow:
1.  **Code Review**: At least two approvals on the Pull Request.
2.  **CI Validation**: All unit tests, integrations tests, and security scans must pass.
3.  **Deployment**: Handled via GitOps (Argo CD). Manual `kubectl apply` is strictly prohibited in production.
4.  **Database Migrations**: Handled via Flyway/Liquibase, executed as pre-sync hooks. Rollback scripts must be provided.

## 3. Release Approval Workflow
*   **Standard Releases**: Approved automatically by passing CI checks.
*   **Major Releases**: Require approval from the Engineering Lead and QA Sign-off.

## 4. Emergency Contacts (Template)
| Role | Name | Phone | Email |
| :--- | :--- | :--- | :--- |
| **Incident Commander** | On-Call Rotation | PagerDuty | oncall@ecommerce.local |
| **Cloud Infrastructure Lead** | Jane Doe | +1-555-0100 | jane.doe@ecommerce.local |
| **Database Administrator** | John Smith | +1-555-0101 | john.smith@ecommerce.local |
| **Security Officer** | Alice Jones | +1-555-0102 | alice.jones@ecommerce.local |
