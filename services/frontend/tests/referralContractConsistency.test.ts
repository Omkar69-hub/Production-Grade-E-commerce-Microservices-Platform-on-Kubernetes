import { describe, it, expect } from 'vitest';
import { CLOTHING_CATALOG, toCatalogProduct, CANONICAL_CATALOG_UUIDS } from '../src/data/clothingCatalogData';
import fs from 'fs';
import path from 'path';

describe('LUMIÈRE Stage 8D.3: Referral Contract & Schema Alignment', () => {

  describe('1. Canonical Referral Attributes on All 14 Catalog Items', () => {
    it('should confirm all 14 items have isReferral === true', () => {
      expect(CLOTHING_CATALOG.length).toBe(14);
      for (const item of CLOTHING_CATALOG) {
        expect(item.isReferral, `${item.id} must declare isReferral: true`).toBe(true);
      }
    });

    it('should confirm all 14 items specify canonical fulfillmentType === "REFERRAL_LINK"', () => {
      for (const item of CLOTHING_CATALOG) {
        expect(item.fulfillmentType, `${item.id} must declare fulfillmentType: 'REFERRAL_LINK'`).toBe('REFERRAL_LINK');
      }
    });

    it('should confirm all 14 items maintain priceINR === 0 with PRICE_UPON_INQUIRY', () => {
      for (const item of CLOTHING_CATALOG) {
        expect(item.priceINR, `${item.id} must have priceINR === 0`).toBe(0);
        expect(item.priceVerificationStatus, `${item.id} must declare PRICE_UPON_INQUIRY`).toBe('PRICE_UPON_INQUIRY');
      }
    });

    it('should confirm all 14 items declare destinationType === "OFFICIAL_CATEGORY_DESTINATION"', () => {
      for (const item of CLOTHING_CATALOG) {
        expect(item.destinationType, `${item.id} must specify OFFICIAL_CATEGORY_DESTINATION`).toBe('OFFICIAL_CATEGORY_DESTINATION');
      }
    });

    it('should confirm all 14 items use secure HTTPS destination URLs without dangerous protocols or credentials', () => {
      for (const item of CLOTHING_CATALOG) {
        expect(item.destinationUrl.startsWith('https://'), `${item.id} destinationUrl must start with https://`).toBe(true);
        const url = new URL(item.destinationUrl);
        expect(url.protocol).toBe('https:');
        expect(url.username).toBe('');
        expect(url.password).toBe('');
      }
    });
  });

  describe('2. Serialization via toCatalogProduct()', () => {
    it('should serialize canonical referral contract into attributes JSON string', () => {
      for (const item of CLOTHING_CATALOG) {
        const product = toCatalogProduct(item);
        expect(product.price).toBe(0);
        expect(product.status).toBe('ACTIVE');
        expect(product.attributes).toBeDefined();

        const parsed = JSON.parse(product.attributes!);
        expect(parsed.isReferral, `${item.id} parsed JSON must have isReferral: true`).toBe(true);
        expect(parsed.fulfillmentType, `${item.id} parsed JSON must have fulfillmentType: 'REFERRAL_LINK'`).toBe('REFERRAL_LINK');
        expect(parsed.destinationType, `${item.id} parsed JSON must have destinationType`).toBe('OFFICIAL_CATEGORY_DESTINATION');
        expect(parsed.destinationUrl, `${item.id} parsed JSON must have destinationUrl`).toBe(item.destinationUrl);
        expect(parsed.priceVerificationStatus, `${item.id} parsed JSON must have priceVerificationStatus`).toBe('PRICE_UPON_INQUIRY');
        expect(parsed.uuid, `${item.id} parsed JSON must match canonical UUID`).toBe(CANONICAL_CATALOG_UUIDS[item.id]);
        expect(parsed.isEditorialConcept).toBe(true);
      }
    });
  });

  describe('3. Consistency with Proposed V5 SQL', () => {
    it('should confirm proposed V5 SQL seed file exists and contains canonical isReferral and fulfillmentType', () => {
      const v5Path = path.resolve(__dirname, '../../product-service/proposed-migrations/V5__seed_lumiere_clothing_catalog.sql');
      expect(fs.existsSync(v5Path), `V5 SQL file must exist at ${v5Path}`).toBe(true);

      const v5Sql = fs.readFileSync(v5Path, 'utf8');
      const isReferralMatches = (v5Sql.match(/"isReferral": true/g) || []).length;
      const fulfillmentMatches = (v5Sql.match(/"fulfillmentType": "REFERRAL_LINK"/g) || []).length;

      expect(isReferralMatches, 'V5 SQL must contain 14 isReferral declarations').toBe(14);
      expect(fulfillmentMatches, 'V5 SQL must contain 14 REFERRAL_LINK fulfillmentType declarations').toBe(14);

      // Verify each canonical UUID is present in V5 SQL
      for (const [id, uuid] of Object.entries(CANONICAL_CATALOG_UUIDS)) {
        expect(v5Sql.includes(uuid), `V5 SQL must include UUID for ${id} (${uuid})`).toBe(true);
      }
    });

    it('should confirm exact field-by-field equality across all 14 items between frontend catalog and V5 SQL seeds', () => {
      const v5Path = path.resolve(__dirname, '../../product-service/proposed-migrations/V5__seed_lumiere_clothing_catalog.sql');
      const v5Sql = fs.readFileSync(v5Path, 'utf8');
      const seedsMatch = v5Sql.match(/\$SEEDS\$([\s\S]*?)\$SEEDS\$/);
      expect(seedsMatch, 'V5 SQL must contain $SEEDS$ JSON block').not.toBeNull();

      const seeds: Array<{
        uuid: string;
        sku: string;
        name: string;
        brand: string;
        description: string;
        image_url: string;
        attributes: Record<string, any>;
      }> = JSON.parse(seedsMatch![1]);

      expect(seeds.length).toBe(14);
      expect(CLOTHING_CATALOG.length).toBe(14);

      for (let i = 0; i < 14; i++) {
        const item = CLOTHING_CATALOG[i];
        const seed = seeds[i];

        // Core fields
        expect(seed.uuid, `Item ${item.id} UUID mismatch`).toBe(CANONICAL_CATALOG_UUIDS[item.id]);
        expect(seed.sku, `Item ${item.id} SKU mismatch`).toBe(item.slug.toUpperCase());
        expect(seed.name, `Item ${item.id} name mismatch`).toBe(item.name);
        expect(seed.brand, `Item ${item.id} brand mismatch`).toBe(item.brandName);
        expect(seed.description, `Item ${item.id} description mismatch`).toBe(item.description);
        expect(seed.image_url, `Item ${item.id} imageUrl mismatch`).toBe(item.imageUrl);

        // Canonical referral attributes
        const attrs = seed.attributes;
        expect(attrs.uuid, `Item ${item.id} attributes.uuid mismatch`).toBe(CANONICAL_CATALOG_UUIDS[item.id]);
        expect(attrs.frontendId, `Item ${item.id} attributes.frontendId mismatch`).toBe(item.id);
        expect(attrs.isEditorialConcept, `Item ${item.id} attributes.isEditorialConcept mismatch`).toBe(true);
        expect(attrs.isReferral, `Item ${item.id} attributes.isReferral mismatch`).toBe(true);
        expect(attrs.fulfillmentType, `Item ${item.id} attributes.fulfillmentType mismatch`).toBe('REFERRAL_LINK');
        expect(attrs.destinationType, `Item ${item.id} attributes.destinationType mismatch`).toBe('OFFICIAL_CATEGORY_DESTINATION');
        expect(attrs.destinationUrl, `Item ${item.id} attributes.destinationUrl mismatch`).toBe(item.destinationUrl);
        expect(attrs.priceVerificationStatus, `Item ${item.id} attributes.priceVerificationStatus mismatch`).toBe('PRICE_UPON_INQUIRY');
        expect(attrs.priceFormatted, `Item ${item.id} attributes.priceFormatted mismatch`).toBe(item.priceFormatted);
        expect(attrs.priceSource, `Item ${item.id} attributes.priceSource mismatch`).toBe(item.priceSource);
        expect(attrs.category, `Item ${item.id} attributes.category mismatch`).toBe('Clothing');
        expect(attrs.subcategory, `Item ${item.id} attributes.subcategory mismatch`).toBe(item.subcategory);
        expect(attrs.audience, `Item ${item.id} attributes.audience mismatch`).toBe(item.audience);
        expect(attrs.brandId, `Item ${item.id} attributes.brandId mismatch`).toBe(item.brandId);
        expect(attrs.brandSlug, `Item ${item.id} attributes.brandSlug mismatch`).toBe(item.brandSlug);
        expect(attrs.fabric, `Item ${item.id} attributes.fabric mismatch`).toBe(item.fabric);
        expect(attrs.fit, `Item ${item.id} attributes.fit mismatch`).toBe(item.fit);
        expect(attrs.sizes, `Item ${item.id} attributes.sizes mismatch`).toBe(item.availableSizes.join(', '));
        expect(attrs.colors, `Item ${item.id} attributes.colors mismatch`).toBe(item.colors.join(', '));
      }
    });
  });
});
