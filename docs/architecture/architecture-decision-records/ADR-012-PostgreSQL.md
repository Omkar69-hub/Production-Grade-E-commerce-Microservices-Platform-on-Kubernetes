# ADR-012: Why PostgreSQL

*   **ADR Number:** 012
*   **Title:** Adoption of PostgreSQL as the Primary Relational Database
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
Our microservices (specifically Order, Product, and Auth) require persistent, reliable data storage. The e-commerce domain deals with highly relational data (e.g., Users have Orders, Orders have Line Items, Line Items reference Products).

## Problem Statement
We need a robust database system that guarantees data integrity, supports complex queries, and is highly reliable for transactional workflows like checkout.

## Decision
We will use **PostgreSQL 16** (via Amazon RDS) as our primary relational database.

## Alternatives Considered
*   **MySQL:** Considered. Both are excellent, but PostgreSQL offers better compliance with SQL standards, superior support for JSONB (useful for dynamic product attributes), and advanced indexing (GiST, GIN).
*   **MongoDB (NoSQL):** Rejected for core transactional services (Order/Payment). E-commerce data is highly relational, and we strictly require ACID (Atomicity, Consistency, Isolation, Durability) guarantees to prevent issues like partial order placements.

## Advantages
*   **ACID Compliance:** Guarantees that database transactions are processed reliably.
*   **JSONB Support:** Allows us to store unstructured data (e.g., dynamic product specifications) within a structured schema without sacrificing indexability.
*   **Extensibility:** Huge ecosystem of extensions (e.g., PostGIS, pg_stat_statements).
*   **Reliability:** Decades of proven enterprise reliability.

## Disadvantages
*   **Scaling:** Horizontal write-scaling is notoriously difficult in relational databases compared to NoSQL (requires sharding).
*   **Connection Overhead:** PostgreSQL processes are heavy; requires connection pooling (e.g., PgBouncer or HikariCP) to handle high concurrent connections.

## Risks
*   **Schema Migrations:** Migrating schemas in a live production environment requires careful coordination (e.g., using Flyway/Liquibase) to avoid table locks and downtime.

## Consequences
Each microservice will have its own isolated PostgreSQL database (or schema within a shared instance to save costs during MVP). We will use Flyway for automated schema migrations.

## Operational Impact
Moderate. Managed via AWS RDS, which handles automated backups, patching, and Multi-AZ failovers.

## Performance Impact
Excellent for relational queries. Read performance will be supplemented by Redis caching.

## Security Impact
Supports robust Role-Based Access Control, SSL/TLS connections, and encrypted storage at rest (KMS).

## Cost Impact
RDS Multi-AZ deployments are expensive but necessary for production HA.

## Future Considerations
If write throughput exceeds a single RDS instance's capacity, we may evaluate Amazon Aurora PostgreSQL for its superior storage scaling and replication speed.

## References
*   PostgreSQL Documentation
