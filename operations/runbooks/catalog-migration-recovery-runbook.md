# LUMIÈRE Catalog Migration Rollback & Recovery Operator Runbook

> **CRITICAL OPERATIONAL GOVERNANCE NOTICE**  
> This runbook defines the authoritative operational procedure for reversing or recovering from the LUMIÈRE catalog import (`proposed-migrations/V5__seed_lumiere_clothing_catalog.sql`).  
> **This document is strictly an operational guide. Execution of any command or SQL statement in this document requires prior formal Stage Gate approval, a maintenance window, and dual-operator human authorization.**

---

## 1. Architectural Foundations: Rollback vs. Recovery

To prevent catastrophic data loss during incidents, operators must strictly differentiate between **Rollback** and **Recovery**:

```
+--------------------------------------------------------------------------------------------------+
|                                    OPERATIONAL DEFINITIONS                                       |
+--------------------------------------------------------------------------------------------------+
|  ROLLBACK (Targeted Surgical Reversal)                                                           |
|  - Definition: Undoing a specific migration, deployment, or schema change within transactional   |
|    boundaries while preserving all concurrent and subsequent business data.                      |
|  - Scope: Limited strictly to the 14 catalog UUIDs and their 1:1 inventory records.              |
|  - Data Preservation: All active users, orders, carts, payment logs, and legacy products remain  |
|    completely untouched and unaffected.                                                          |
+--------------------------------------------------------------------------------------------------+
|  RECOVERY (Disaster & Availability Restoration)                                                  |
|  - Definition: Restoring entire service availability or infrastructure state after catastrophic  |
|    hardware loss, wide-scale storage corruption, or unrecoverable regional disaster.             |
|  - Mechanism: AWS RDS Point-In-Time Recovery (PITR) to a NEW target instance, Multi-AZ failover, |
|    or cold-standby restoration.                                                                  |
|  - Impact: Requires planned maintenance cutover, DNS/Secrets re-pointing, and service restarts.  |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Strict Operational Prohibitions

The following actions are strictly prohibited in the LUMIÈRE production environment:

1. **PROHIBITION 1: Never restore an old full-database dump over a live production database as a routine rollback.**
   - *Why:* Restoring a `pg_dump` or snapshot taken prior to migration overwrites the entire database cluster. Any user registrations, customer orders, payment confirmations, and inventory decrements executed between the snapshot time and the restore time will be permanently destroyed.
2. **PROHIBITION 2: Never manually execute `DELETE FROM flyway_schema_history WHERE version = '5'` as a standalone reversal.**
   - *Why:* Flyway's schema history table only tracks migration metadata. Deleting this row does not remove the inserted catalog records or inventory rows. Furthermore, leaving the records in place while deleting the Flyway history row corrupts Flyway's state machine, causing subsequent deployments to fail with checksum conflicts.
3. **PROHIBITION 3: Never perform destructive hard deletes (`DELETE FROM products ...`) if downstream foreign references have been created.**
   - *Why:* If a catalog product has been referenced by `order-service` (`order_items.product_id`), hard-deleting the product breaks referential audit trails, financial reconciliation, and customer order history. If references exist, a **Forward-Fix Soft-Delete** must be used instead.
4. **PROHIBITION 4: Never execute automated rollback scripts without human signoff.**
   - *Why:* Rollback operations alter database state and evict caches. A designated Lead Architect and SRE on-call must review the execution plan before execution.

---

## 3. Schema & Referential Integrity Analysis

### 3.1 Primary Product Schema (`product-service` PostgreSQL)
* Table: `products`
  * Primary Key: `id UUID`
  * Unique Constraint: `sku VARCHAR(100)`
  * Foreign Key: `category_id UUID REFERENCES categories(id) ON DELETE SET NULL`
  * Soft Delete: `is_deleted BOOLEAN NOT NULL DEFAULT FALSE`
  * Editorial Attributes: `attributes JSONB` (`isReferral`, `destinationUrl`, `fulfillmentType`, `brandSlug`, etc.)
* Table: `inventory`
  * Primary Key: `id UUID`
  * Foreign Key: `product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE`
  * Constraint: Deleting a product automatically cascades to its inventory row in PostgreSQL.

### 3.2 Downstream Dependencies Across Microservices
* **Cart Service (Redis):** Cart items are stored in Redis (`cart:{userId}`). If a product is removed or soft-deleted, subsequent cart retrieval will detect a missing or inactive product.
* **Order Service (PostgreSQL `order-service`):** Table `order_items` stores `product_id UUID NOT NULL` alongside historical price snapshots. While there is no cross-database foreign key, hard-deleting a product breaks historical reporting joins.
* **Kafka Event Bus:** Changes to products emit events (`ProductCreatedEvent`, `ProductDeletedEvent`) to the `product-events` topic.

---

## 4. Operational Preconditions & Verification Gate

Before initiating any rollback or recovery action, verify that:

1. [ ] A fresh, verified database backup of `product-service-db` exists and has been checksum-verified.
2. [ ] The application health checks are monitored: `GET /actuator/health` on `product-service`, `order-service`, and `cart-service`.
3. [ ] Downstream reference check has been executed:
   ```sql
   -- Run in order-service database to check for existing order references:
   SELECT count(*) FROM order_items 
   WHERE product_id IN (
     '01933b91-4444-7890-a123-ef0123456789',
     '01933b91-4444-7890-a123-ef0123456790',
     '01933b91-4444-7890-a123-ef0123456791',
     '01933b91-4444-7890-a123-ef0123456792',
     '01933b91-4444-7890-a123-ef0123456793',
     '01933b91-4444-7890-a123-ef0123456794',
     '01933b91-4444-7890-a123-ef0123456795',
     '01933b91-4444-7890-a123-ef0123456796',
     '01933b91-4444-7890-a123-ef0123456797',
     '01933b91-4444-7890-a123-ef0123456798',
     '01933b91-4444-7890-a123-ef0123456799',
     '01933b91-4444-7890-a123-ef0123456800',
     '01933b91-4444-7890-a123-ef0123456801',
     '01933b91-4444-7890-a123-ef0123456802'
   );
   ```
4. [ ] **Dual Human Authorization:** Formal confirmation recorded from SRE Lead and Tech Lead.

---

## 5. Decision Matrix: Rollback vs. Forward-Fix

```
                                  +-------------------------------+
                                  | Downstream Order References? |
                                  +---------------+---------------+
                                                  |
                         +------------------------+------------------------+
                         |                                                 |
                       NO (0)                                           YES (> 0)
                         |                                                 |
                         v                                                 v
           +---------------------------+                     +---------------------------+
           | PROCEDURE A:              |                     | PROCEDURE B:              |
           | Surgical Hard Rollback    |                     | Forward-Fix Soft-Delete   |
           | (Removes 14 UUIDs,        |                     | (Preserves records, sets  |
           |  inventory & Flyway row)  |                     |  is_deleted = TRUE)       |
           +---------------------------+                     +---------------------------+
```

---

## 6. Execution Procedures

### 6.1 Procedure A: Surgical Hard Rollback (Zero Downstream References Only)

*Use ONLY if migration was applied within the maintenance window and NO order records reference the 14 UUIDs.*

```sql
BEGIN;

-- 1. Acquire transaction-level lock to prevent concurrent modifications
LOCK TABLE products IN EXCLUSIVE MODE;

-- 2. Verify target count before deletion
SELECT count(*) AS target_products_count
FROM products
WHERE id IN (
  '01933b91-4444-7890-a123-ef0123456789',
  '01933b91-4444-7890-a123-ef0123456790',
  '01933b91-4444-7890-a123-ef0123456791',
  '01933b91-4444-7890-a123-ef0123456792',
  '01933b91-4444-7890-a123-ef0123456793',
  '01933b91-4444-7890-a123-ef0123456794',
  '01933b91-4444-7890-a123-ef0123456795',
  '01933b91-4444-7890-a123-ef0123456796',
  '01933b91-4444-7890-a123-ef0123456797',
  '01933b91-4444-7890-a123-ef0123456798',
  '01933b91-4444-7890-a123-ef0123456799',
  '01933b91-4444-7890-a123-ef0123456800',
  '01933b91-4444-7890-a123-ef0123456801',
  '01933b91-4444-7890-a123-ef0123456802'
);
-- ABORT CONDITION: If target_products_count != 14, ROLLBACK immediately!

-- 3. Delete inventory rows explicitly (though ON DELETE CASCADE exists, explicit delete ensures auditability)
DELETE FROM inventory
WHERE product_id IN (
  '01933b91-4444-7890-a123-ef0123456789',
  '01933b91-4444-7890-a123-ef0123456790',
  '01933b91-4444-7890-a123-ef0123456791',
  '01933b91-4444-7890-a123-ef0123456792',
  '01933b91-4444-7890-a123-ef0123456793',
  '01933b91-4444-7890-a123-ef0123456794',
  '01933b91-4444-7890-a123-ef0123456795',
  '01933b91-4444-7890-a123-ef0123456796',
  '01933b91-4444-7890-a123-ef0123456797',
  '01933b91-4444-7890-a123-ef0123456798',
  '01933b91-4444-7890-a123-ef0123456799',
  '01933b91-4444-7890-a123-ef0123456800',
  '01933b91-4444-7890-a123-ef0123456801',
  '01933b91-4444-7890-a123-ef0123456802'
);

-- 4. Delete the 14 catalog products
DELETE FROM products
WHERE id IN (
  '01933b91-4444-7890-a123-ef0123456789',
  '01933b91-4444-7890-a123-ef0123456790',
  '01933b91-4444-7890-a123-ef0123456791',
  '01933b91-4444-7890-a123-ef0123456792',
  '01933b91-4444-7890-a123-ef0123456793',
  '01933b91-4444-7890-a123-ef0123456794',
  '01933b91-4444-7890-a123-ef0123456795',
  '01933b91-4444-7890-a123-ef0123456796',
  '01933b91-4444-7890-a123-ef0123456797',
  '01933b91-4444-7890-a123-ef0123456798',
  '01933b91-4444-7890-a123-ef0123456799',
  '01933b91-4444-7890-a123-ef0123456800',
  '01933b91-4444-7890-a123-ef0123456801',
  '01933b91-4444-7890-a123-ef0123456802'
);

-- 5. Atomically remove Flyway history record for V5
DELETE FROM flyway_schema_history WHERE version = '5';

-- 6. Confirm non-target products were not touched
SELECT count(*) AS legacy_products_remaining FROM products;

COMMIT;
```

---

### 6.2 Procedure B: Forward-Fix Soft-Delete (When References Exist)

*Use when one or more products have already been referenced in orders, carts, or audit records.*

```sql
BEGIN;

-- Soft-delete the 14 products and set status to INACTIVE
UPDATE products
SET is_deleted = TRUE,
    status = 'INACTIVE',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  '01933b91-4444-7890-a123-ef0123456789',
  '01933b91-4444-7890-a123-ef0123456790',
  '01933b91-4444-7890-a123-ef0123456791',
  '01933b91-4444-7890-a123-ef0123456792',
  '01933b91-4444-7890-a123-ef0123456793',
  '01933b91-4444-7890-a123-ef0123456794',
  '01933b91-4444-7890-a123-ef0123456795',
  '01933b91-4444-7890-a123-ef0123456796',
  '01933b91-4444-7890-a123-ef0123456797',
  '01933b91-4444-7890-a123-ef0123456798',
  '01933b91-4444-7890-a123-ef0123456799',
  '01933b91-4444-7890-a123-ef0123456800',
  '01933b91-4444-7890-a123-ef0123456801',
  '01933b91-4444-7890-a123-ef0123456802'
);

-- Zero out inventory to prevent reservation attempts
UPDATE inventory
SET quantity = 0,
    reserved_quantity = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE product_id IN (
  '01933b91-4444-7890-a123-ef0123456789',
  '01933b91-4444-7890-a123-ef0123456790',
  '01933b91-4444-7890-a123-ef0123456791',
  '01933b91-4444-7890-a123-ef0123456792',
  '01933b91-4444-7890-a123-ef0123456793',
  '01933b91-4444-7890-a123-ef0123456794',
  '01933b91-4444-7890-a123-ef0123456795',
  '01933b91-4444-7890-a123-ef0123456796',
  '01933b91-4444-7890-a123-ef0123456797',
  '01933b91-4444-7890-a123-ef0123456798',
  '01933b91-4444-7890-a123-ef0123456799',
  '01933b91-4444-7890-a123-ef0123456800',
  '01933b91-4444-7890-a123-ef0123456801',
  '01933b91-4444-7890-a123-ef0123456802'
);

-- Note: In Procedure B, DO NOT delete from flyway_schema_history because the forward-fix preserves schema history.

COMMIT;
```

---

## 7. Downstream Cache & Redis Eviction

Immediately following database transaction completion:

1. **Evict Redis Product Cache:**
   ```bash
   # Connect to Redis cluster and evict cached entries for the 14 products:
   redis-cli DEL product:01933b91-4444-7890-a123-ef0123456789 \
                 product:01933b91-4444-7890-a123-ef0123456790 \
                 product:01933b91-4444-7890-a123-ef0123456791 \
                 product:01933b91-4444-7890-a123-ef0123456792 \
                 product:01933b91-4444-7890-a123-ef0123456793 \
                 product:01933b91-4444-7890-a123-ef0123456794 \
                 product:01933b91-4444-7890-a123-ef0123456795 \
                 product:01933b91-4444-7890-a123-ef0123456796 \
                 product:01933b91-4444-7890-a123-ef0123456797 \
                 product:01933b91-4444-7890-a123-ef0123456798 \
                 product:01933b91-4444-7890-a123-ef0123456799 \
                 product:01933b91-4444-7890-a123-ef0123456800 \
                 product:01933b91-4444-7890-a123-ef0123456801 \
                 product:01933b91-4444-7890-a123-ef0123456802
   ```
2. **Evict Cached Category Lists:**
   ```bash
   redis-cli KEYS "products:category:*" | xargs -r redis-cli DEL
   ```

---

## 8. Abort Conditions

The rollback operation must be aborted immediately (triggering `ROLLBACK;`) if:
1. `EXCLUSIVE LOCK` on `products` cannot be acquired within 5000ms.
2. The count of target products matching the 14 UUIDs does not equal exactly 14.
3. Any unexpected deadlock or database timeout occurs during execution.
4. Downstream `order-service` reports active transactions involving the target UUIDs during Procedure A.

---

## 9. Post-Operation Integrity Checks

After completing Procedure A or B:
1. **Catalog Integrity Query:**
   ```sql
   -- Verify zero active target products remain
   SELECT count(*) FROM products 
   WHERE id IN ('01933b91-4444-7890-a123-ef0123456789' /* ... 14 UUIDs ... */)
     AND is_deleted = FALSE;
   -- Must return 0
   ```
2. **Application Health:**
   ```bash
   curl -s -f http://localhost:8081/actuator/health | jq .status
   # Must return "UP"
   ```
3. **API Category List Verification:**
   ```bash
   curl -s http://localhost:8081/api/v1/products/category/123e4567-e89b-12d3-a456-426614174010 | jq .
   # Verify legacy products are served correctly and no target products appear
   ```
4. **Log Analysis:** Check `product-service` logs for any `DataIntegrityViolationException` or Hibernate mapping errors.
