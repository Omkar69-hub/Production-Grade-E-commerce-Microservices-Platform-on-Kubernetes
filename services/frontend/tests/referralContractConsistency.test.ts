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
  });
});
