# Database Indexing Strategy

## 1. Overview
Indexes are critical for read performance in PostgreSQL, but they incur a write penalty and consume memory. We strictly follow the rule of only indexing columns that are actively used in `WHERE`, `ORDER BY`, or `JOIN` clauses.

## 2. Standard Indexes
*   **Primary Keys (PK):** PostgreSQL automatically creates a B-Tree index for all primary keys. Our PKs are `UUID v4`.
*   **Foreign Keys (FK):** PostgreSQL does *not* automatically index foreign keys. We explicitly create B-Tree indexes on all FKs to prevent full table scans during joins or cascade deletes.

## 3. Specialized Indexes
*   **Unique Constraints:** Automatically indexed. Used for fields like `email` in the `users` table.
*   **Composite Indexes:** Used when queries frequently filter by two or more columns together (e.g., `WHERE status = 'PAID' AND created_at > '2026-01-01'`). The column with the highest cardinality must be listed first in the index.
*   **Partial Indexes:** Used for highly skewed data. For example, indexing only "active" users or "pending" orders: `CREATE INDEX idx_pending_orders ON orders (created_at) WHERE status = 'PENDING';`
*   **GIN Indexes:** Used extensively in the Product Catalog for full-text search on product names/descriptions, and for querying within `JSONB` columns (e.g., dynamic product attributes).

## 4. Maintenance
*   Unused indexes will be identified via `pg_stat_user_indexes` and removed.
*   Index bloat will be monitored and resolved using `REINDEX CONCURRENTLY` to avoid table locks during production traffic.
