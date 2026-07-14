# Incident Response Guide

This guide outlines the standard operating procedure for handling production incidents.

## 1. Incident Classification (Severity Levels)
*   **SEV-1 (Critical)**: Total platform outage, data loss, or major security breach. Immediate all-hands response.
*   **SEV-2 (High)**: Core feature broken (e.g., Checkout failing) affecting many users, but the platform is partially up.
*   **SEV-3 (Medium)**: Non-critical feature broken or degraded performance. No immediate loss of revenue.
*   **SEV-4 (Low)**: Minor bug, cosmetic issue, or internal tooling failure.

## 2. Response Process
1.  **Detect & Acknowledge**: PagerDuty alerts the on-call engineer. The engineer acknowledges the alert within 5 minutes.
2.  **Declare Incident**: For SEV-1/SEV-2, the engineer opens a dedicated Slack channel (e.g., `#inc-20231027-checkout-down`) and starts a war room (Zoom/Meet).
3.  **Assign Roles**:
    *   **Incident Commander (IC)**: Drives the resolution, coordinates communication. Does not touch code/infrastructure.
    *   **Subject Matter Expert (SME) / Responder**: Investigates and applies fixes.
    *   **Communications Lead**: Updates status pages and informs stakeholders.
4.  **Investigate & Mitigate**: Use runbooks, logs, and metrics to identify the root cause. Apply a hotfix, rollback, or failover to stop the bleeding. **Mitigation is prioritized over a permanent fix.**
5.  **Resolve**: Confirm the system is stable via monitoring.
6.  **Post-Incident**: Close the incident channel and schedule a Blameless Post-Mortem.

## 3. Communication Templates

**Initial Communication (Internal)**
> **[SEV-X] Incident Declared: [Short Description]**
> We are currently investigating an issue with [Service]. Impact: [What users are experiencing].
> War Room: [Link]
> Updates will follow every [Time] minutes.

## 4. Escalation Path
If the primary on-call engineer cannot mitigate the issue within 15 minutes (SEV-1) or 30 minutes (SEV-2), escalate to:
1.  Secondary On-Call / Tier 2 Support.
2.  Domain Engineering Lead.
3.  VP of Engineering / CTO.
