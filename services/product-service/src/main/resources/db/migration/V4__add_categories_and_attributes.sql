-- Flyway Migration V4: Add Multi-Category and Product Attributes Support

-- 1. Add attributes column to products table for storing category-specific specifications
ALTER TABLE products
ADD COLUMN IF NOT EXISTS attributes TEXT DEFAULT '{}';

-- 2. Seed multi-category taxonomy (Clothing, Footwear, Accessories) if not already present
INSERT INTO categories (id, name, description, is_deleted, created_at, updated_at, version)
SELECT '123e4567-e89b-12d3-a456-426614174010', 'Clothing', 'Haute Couture Apparel, Tailored Silk & Atelier Outerwear', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Clothing');

INSERT INTO categories (id, name, description, is_deleted, created_at, updated_at, version)
SELECT '123e4567-e89b-12d3-a456-426614174020', 'Footwear', 'Artisanal Handcrafted Leather Shoes & Bespoke Boots', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Footwear');

INSERT INTO categories (id, name, description, is_deleted, created_at, updated_at, version)
SELECT '123e4567-e89b-12d3-a456-426614174030', 'Accessories', 'Fine Leather Accoutrements, Silk Scarves & Signature Timepieces', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Accessories');

-- 3. Enhance existing Smartphone record with verified technical attributes
UPDATE products
SET 
    brand = 'Lumière Haute Tech',
    attributes = '{"warranty":"2-Year Comprehensive Atelier Coverage","compatibility":"Universal USB-C 3.2, Qi Wireless Charging, 5G NR","specifications":"6.7-inch Super Retina XDR OLED, 256GB NVMe Storage, Ceramic Shield"}',
    updated_at = CURRENT_TIMESTAMP
WHERE id = '123e4567-e89b-12d3-a456-426614174001';
