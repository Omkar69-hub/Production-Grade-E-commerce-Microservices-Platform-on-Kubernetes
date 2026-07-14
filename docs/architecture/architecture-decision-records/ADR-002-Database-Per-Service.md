# ADR-002: Why Database-per-Service instead of Shared Database

*   **ADR Number:** 002
*   **Title:** Adoption of Database-per-Service Pattern
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
In our microservices architecture, services need to persist data. A traditional approach is to point all microservices to a single, monolithic database. 

## Problem Statement
A shared database creates a single point of failure and a performance bottleneck. More importantly, it creates tight coupling at the data layer, where a schema change by the Order team could accidentally break the Product service. 

## Decision
We will implement the **Database-per-Service** pattern. Each microservice will have its own dedicated logical database (and physical database/schema depending on the technology). Services can only access their own data and must use APIs to request data owned by other services.

## Alternatives Considered
*   **Shared Database:** Rejected due to tight coupling, potential for blocking locks across domains, and preventing independent service evolution.

## Advantages
*   **Loose Coupling:** Teams can modify their database schemas without impacting other services.
*   **Optimal Tech Selection:** The Product service can use Elasticsearch for search, while the Order service uses PostgreSQL for ACID transactions.
*   **Fault Isolation:** A heavy analytical query taking down one database will not affect other services.

## Disadvantages
*   **Complex Queries:** Joining data across domains (e.g., Orders + User details) requires API aggregation or CQRS patterns.
*   **Distributed Transactions:** Enforcing data consistency across services requires complex patterns like Sagas.

## Risks
*   **Eventual Consistency:** Users might experience slight delays where data appears inconsistent across different views.
*   **Operational Overhead:** Managing multiple database instances, backups, and migrations is more complex.

## Consequences
Services must expose APIs for any data they own that others need. We will use RabbitMQ to publish events (e.g., `UserUpdated`) so other services can maintain their own read-optimized replicas of the data if necessary.

## Operational Impact
High. DBAs and SREs must manage provisioning, backups, and monitoring for multiple databases via Terraform.

## Performance Impact
Fetching data that spans multiple domains requires network calls instead of SQL JOINs, increasing latency.

## Security Impact
Improved data compartmentalization. A vulnerability in the Product service does not expose the Customer database.

## Cost Impact
Higher infrastructure costs due to running multiple RDS instances or paying for larger instances to handle multiple distinct schemas efficiently.

## Future Considerations
Implement Command Query Responsibility Segregation (CQRS) and materialized views if cross-service data aggregation becomes a performance bottleneck.

## References
*   Microservices Patterns by Chris Richardson
