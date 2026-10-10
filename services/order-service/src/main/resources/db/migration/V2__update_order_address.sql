ALTER TABLE orders
  DROP COLUMN shipping_address_id,
  DROP COLUMN billing_address_id,
  ADD COLUMN shipping_full_name VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN shipping_street VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN shipping_city VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN shipping_state VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN shipping_zip_code VARCHAR(20) NOT NULL DEFAULT '',
  ADD COLUMN shipping_country VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN shipping_phone_number VARCHAR(20) NOT NULL DEFAULT '';
