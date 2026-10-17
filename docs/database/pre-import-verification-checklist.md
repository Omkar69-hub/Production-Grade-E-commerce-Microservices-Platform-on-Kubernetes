# LUMIÈRE Catalog Pre-Import Verification Checklist

> **GATE STATUS: PRE-IMPORT READINESS VERIFICATION ONLY**  
> **Notice:** This document defines the mandatory operational gates and prerequisites that must be satisfied and verified before any future stage may execute the catalog migration (`V5__seed_lumiere_clothing_catalog.sql`).  
> **Mocked and unit test results do NOT constitute live integration verification.** Live integration verification can only take place during an authorized live maintenance window with dual-operator oversight.

---

## 1. Executive Summary & Authority

Following Stage 8E's read-only audit verdict of **CONDITIONAL GO**, Stage 8F has remediated client-side validation gaps in `AdminProductForm.tsx` and established authoritative rollback runbooks (`operations/runbooks/catalog-migration-recovery-runbook.md`).

This checklist establishes the non-negotiable prerequisites that must be completed and documented before granting **FINAL GO** to copy V5 into the Flyway migration classpath or apply it to any production or staging database.

---

## 2. Mandatory Verification Gates

### Gate 1: Fresh Verified Database Backups & Integrity Evidence

Prior to executing any schema change or data seeding:

* [ ] **Fresh RDS Snapshot / Physical Dump:**
  * Dedicated snapshot created: `product-service-pre-v5-<YYYYMMDD-HHMMSS>`
  * Physical `pg_dump` generated: `product_service_backup_<YYYYMMDD>.dump`
* [ ] **Cryptographic Checksum Evidence:**
  * SHA-256 hash computed and recorded for the dump artifact:
    ```bash
    sha256sum product_service_backup_<YYYYMMDD>.dump > product_service_backup_<YYYYMMDD>.dump.sha256
    ```
* [ ] **Restore Verification Evidence:**
  * The dump or snapshot must be restored to an isolated sandbox instance to verify that the backup is uncorrupted and fully bootable.
  * Verified table row counts in sandbox match production prior to signoff.

---

### Gate 2: Canonical 14-Product Identity & Mapping Confirmation

Verify that the 14 products in the migration script match the approved canonical LUMIÈRE collection:

| # | Canonical UUID | SKU | Maison / Brand | Price (INR) | Mode | Price Status |
|---|---|---|---|---|---|---|
| 1 | `01933b91-4444-7890-a123-ef0123456789` | `SABYA-LEH-001` | Sabyasachi | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 2 | `01933b91-4444-7890-a123-ef0123456790` | `SABYA-SAREE-002` | Sabyasachi | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 3 | `01933b91-4444-7890-a123-ef0123456791` | `SABYA-SHER-003` | Sabyasachi | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 4 | `01933b91-4444-7890-a123-ef0123456792` | `TARUN-LEH-004` | Tarun Tahiliani | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 5 | `01933b91-4444-7890-a123-ef0123456793` | `TARUN-CONCEPT-005` | Tarun Tahiliani | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 6 | `01933b91-4444-7890-a123-ef0123456794` | `TARUN-SHER-006` | Tarun Tahiliani | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 7 | `01933b91-4444-7890-a123-ef0123456795` | `MANISH-LEH-007` | Manish Malhotra | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 8 | `01933b91-4444-7890-a123-ef0123456796` | `MANISH-GOWN-008` | Manish Malhotra | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 9 | `01933b91-4444-7890-a123-ef0123456797` | `MANISH-TUX-009` | Manish Malhotra | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 10 | `01933b91-4444-7890-a123-ef0123456798` | `RAW-SAREE-010` | Raw Mango | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 11 | `01933b91-4444-7890-a123-ef0123456799` | `RAW-KURTA-011` | Raw Mango | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 12 | `01933b91-4444-7890-a123-ef0123456800` | `ANAMIKA-CAPE-012` | Anamika Khanna | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 13 | `01933b91-4444-7890-a123-ef0123456801` | `ANAMIKA-LEH-013` | Anamika Khanna | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |
| 14 | `01933b91-4444-7890-a123-ef0123456802` | `RITUKUMAR-LEH-014` | Ritu Kumar | 0.00 | Referral Link | `PRICE_UPON_INQUIRY` |

* [ ] **Pre-Existence Check:** Execute query against target database to guarantee no collision with existing products:
  ```sql
  SELECT count(*) FROM products WHERE id IN (
    '01933b91-4444-7890-a123-ef0123456789', '01933b91-4444-7890-a123-ef0123456790',
    '01933b91-4444-7890-a123-ef0123456791', '01933b91-4444-7890-a123-ef0123456792',
    '01933b91-4444-7890-a123-ef0123456793', '01933b91-4444-7890-a123-ef0123456794',
    '01933b91-4444-7890-a123-ef0123456795', '01933b91-4444-7890-a123-ef0123456796',
    '01933b91-4444-7890-a123-ef0123456797', '01933b91-4444-7890-a123-ef0123456798',
    '01933b91-4444-7890-a123-ef0123456799', '01933b91-4444-7890-a123-ef0123456800',
    '01933b91-4444-7890-a123-ef0123456801', '01933b91-4444-7890-a123-ef0123456802'
  );
  -- Must return 0
  ```
* [ ] **Category Reference Verification:** Confirm target category `123e4567-e89b-12d3-a456-426614174010` exists in `categories` table.

---

### Gate 3: Migration Script Isolation Confirmation

* [ ] Confirm that `V5__seed_lumiere_clothing_catalog.sql` is located exclusively in:
  `services/product-service/proposed-migrations/`
* [ ] Confirm that the active Flyway migration classpath directory:
  `services/product-service/src/main/resources/db/migration/`
  contains ONLY `V1__init.sql`, `V3__add_clothing_attributes_and_categories.sql`, and `V4__add_category_soft_delete.sql`.
* [ ] Confirm V5 has NOT been committed to the active migration path and has NOT been executed.

---

### Gate 4: Backend Fail-Closed Guards Verification

Before any catalog records are introduced, verify that backend microservices enforce fail-closed defenses against referral items entering transaction pipelines:

1. **Product Service (`product-service`):**
   * Products with `price == 0.00` are strictly rejected unless marked with `PRICE_UPON_INQUIRY` or verified referral metadata (`isReferral=true`, non-empty `destinationUrl`, `fulfillmentType='REFERRAL_LINK'`).
   * Products with `price > 0.00` cannot carry referral attributes or inquiry status.
2. **Cart Service (`cart-service`):**
   * `CartService.addItemToCart()` checks `isReferral` or `fulfillmentType == 'REFERRAL_LINK'` or zero price and explicitly throws `400 Bad Request` with message: `"Referral products cannot be added to cart"`.
3. **Order Service (`order-service`):**
   * Order placement validates catalog price snapshots and rejects zero-amount or referral line items.
4. **Payment Service (`payment-service`):**
   * Rejects transaction amounts `<= 0` and requires verified order settlement status from `order-service`.

---

### Gate 5: Live Smoke-Test Plan (Post-Import Execution)

Once authorization is granted and migration executes, the following live smoke tests must be run immediately:

* [ ] **Test 1: Read Endpoint Verification:**
  ```bash
  curl -s -f http://localhost:8081/api/v1/products/01933b91-4444-7890-a123-ef0123456789 | jq .
  # Must return 200 OK with correct name, brand "Sabyasachi", price 0.00, and referral attributes.
  ```
* [ ] **Test 2: Category Listing Verification:**
  ```bash
  curl -s -f http://localhost:8081/api/v1/products/category/123e4567-e89b-12d3-a456-426614174010 | jq .
  # Must return 200 OK with array containing all 14 new products alongside pre-existing products.
  ```
* [ ] **Test 3: Cart Rejection Smoke Test (Critical Fail-Closed Proof):**
  ```bash
  curl -s -X POST http://localhost:8082/api/v1/cart/items \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TEST_CUSTOMER_TOKEN>" \
    -d '{"productId": "01933b91-4444-7890-a123-ef0123456789", "quantity": 1}'
  # MUST FAIL with HTTP 400 Bad Request and error: "Referral products cannot be added to cart".
  ```
* [ ] **Test 4: Admin Form Inspection:**
  * Open Admin Catalog UI (`/admin/products`).
  * Verify that clicking "Edit" on `SABYA-LEH-001` opens `AdminProductForm` with Tab 3 active, displays the verified HTTPS URL, and shows the Verified Maison badge.

---

### Gate 6: Explicit Abort Conditions

The migration must be immediately rolled back using `operations/runbooks/catalog-migration-recovery-runbook.md` (Procedure A) if:

1. Flyway reports any syntax, connection, or execution error during V5 migration.
2. The number of inserted rows in `products` is not exactly 14.
3. The number of inserted rows in `inventory` is not exactly 14.
4. Any of the 14 products fails Gate 5 Smoke Test 1 or 2.
5. **CRITICAL:** Gate 5 Smoke Test 3 DOES NOT return HTTP 400 (i.e. if a referral item is erroneously accepted by `cart-service`).

---

## 3. Human Authorization Checkpoint

No database write, Flyway migration file move, or deployment may occur without physical signoff from all four authorities:

| Authority Role | Name | Signature / Approval Token | Date & Time |
|---|---|---|---|
| **Lead Software Architect** | | | |
| **Principal SRE / Infrastructure** | | | |
| **Security & Compliance Lead** | | | |
| **Catalog Operations Director** | | | |
