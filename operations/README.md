# Operations & Reliability Handbook

Welcome to the Operations Handbook for the Production-Grade E-Commerce Platform. This directory contains the procedures, plans, and runbooks necessary to maintain high availability, resilience, and operational excellence in a production environment.

## Overview

This handbook is designed for Site Reliability Engineers (SREs), DevOps Engineers, and On-Call Responders. It aligns with the AWS Well-Architected Framework (Reliability and Operational Excellence pillars).

## Directory Structure

*   `backup/`: Strategies and CronJobs for ensuring data durability.
*   `business-continuity/`: Change management and planned downtime procedures.
*   `capacity-planning/`: (See scaling strategies) Guidelines for handling traffic spikes.
*   `cost-optimization/`: Recommendations for reducing cloud infrastructure spend.
*   `disaster-recovery/`: RPO/RTO targets and multi-AZ/multi-region failover plans.
*   `incident-response/`: Standard operating procedures for handling SEV-1/SEV-2 incidents.
*   `maintenance/`: Kubernetes PodDisruptionBudgets and maintenance configurations.
*   `runbooks/`: Step-by-step guides for diagnosing and resolving common alerts (Service Restarts, High CPU, DB Failures).
*   `scaling/`: Configuration and strategy for HPA, VPA, and Cluster Autoscaler.
*   `sla-slo/`: Definitions of our reliability targets and error budgets.

## Before Going Live

Before routing production traffic to the cluster, ensure that all items in the [Production Checklist](production-checklist.md) have been completed and signed off.
