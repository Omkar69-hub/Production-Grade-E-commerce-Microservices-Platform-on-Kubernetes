# Database Partitioning Strategy

## 1. Overview
As the e-commerce platform grows, tables like `orders` and `order_items` will accumulate massive amounts of data, slowing down inserts and sequential scans. We utilize PostgreSQL declarative partitioning to manage large tables.

## 2. Strategy: Time-Based Partitioning
The `orders` table (and related temporal tables) will be partitioned by time (monthly).
*   **Partition Key:** `created_at`
*   *Advantage:* Older orders are rarely accessed. Partitioning by month allows us to easily archive or drop old partitions (e.g., `DROP TABLE orders_2023_01`) without expensive `DELETE` operations and vacuuming overhead.

## 3. Implementation Plan
*   The base table `orders` is created as a partitioned table.
*   A cron job (or pg_partman extension) is used to pre-create partitions for upcoming months (e.g., `orders_y2026m08`, `orders_y2026m09`).
*   Queries that filter by `created_at` will benefit from **partition pruning**, meaning Postgres will completely ignore partitions outside the requested date range, vastly speeding up queries.

## 4. Archival (Cold Storage)
Partitions older than 2 years will be dumped to AWS S3 (via AWS Glue/Athena) for analytics and compliance, and subsequently dropped from the live PostgreSQL database to reclaim fast SSD storage.
