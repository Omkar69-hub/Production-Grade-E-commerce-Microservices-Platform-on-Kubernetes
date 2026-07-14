# Database Design & Conventions

## 1. Database-per-Service Architecture
Every microservice owns its data. Direct cross-database queries are strictly prohibited.
*   **Auth Service:** PostgreSQL
*   **Product Service:** PostgreSQL (with heavily utilized Redis caching)
*   **Cart Service:** Redis (Transient data; no relational DB required)
*   **Order Service:** PostgreSQL
*   **Payment Service:** PostgreSQL
*   **Notification Service:** PostgreSQL

## 2. Primary Key Strategy (UUID)
All Primary Keys across all databases must use **UUID v4**.
*   *Why:* Prevents enumeration attacks (e.g., guessing order IDs), allows distributed generation without sequence locks, and simplifies data merging if required.
*   *Implementation:* Handled at the application layer (Java `UUID.randomUUID()`) or via Postgres `gen_random_uuid()`.

## 3. Naming Conventions
*   **Tables:** Plural, snake_case (e.g., `user_roles`, `order_items`).
*   **Columns:** Singular, snake_case (e.g., `first_name`, `created_at`).
*   **Foreign Keys:** `{referenced_table_singular}_id` (e.g., `user_id`).
*   **Constraints:** Prefix with `pk_`, `fk_`, `uq_`, `chk_`.

## 4. Audit Columns
Every table must include the following audit columns to track data lifecycle:
*   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)
*   `version` (INTEGER, DEFAULT 0) - Used for Optimistic Locking via JPA `@Version`.

## 5. Soft Delete Strategy
Records are never physically deleted (`DELETE` statement) from the database to preserve historical integrity.
*   Every table includes an `is_deleted` (BOOLEAN, DEFAULT FALSE) column.
*   Queries must always include `WHERE is_deleted = false`.
*   Unique constraints must account for soft-deleted records (e.g., `CREATE UNIQUE INDEX uq_user_email ON users(email) WHERE is_deleted = false;`).

## 6. Schema Migrations
*   Managed strictly via **Flyway**.
*   Migration scripts (e.g., `V1__init_schema.sql`) are checked into source control alongside the microservice code.
*   Migrations run automatically when the Spring Boot application starts.
*   Downgrade scripts (Undo migrations) are not used; fix-forward is the standard protocol.
