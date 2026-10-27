import { describe, it, expect } from 'vitest';
import { ALL_CLOTHING_CATALOG, CLOTHING_CATALOG, toCatalogProduct } from '../src/data/clothingCatalogData';
import { LIFESTYLE_CATALOG } from '../src/data/lifestyleCatalogData';
import { ALL_VERIFIED_BRANDS, BRANDS_DATA } from '../src/data/brandsData';
import { verifyBrandDomain } from '../src/utils/domainVerifier';
import { getCapsuleDefinition } from '../src/utils/categoryMapping';

describe('LUMIÈRE Stage 14B.5: Post-Integration Quality & Catalog Audit', () => {

  describe('1. 32-Piece Catalog Completeness & Invariant Preservation', () => {
    it('strictly preserves the 14-piece canonical couture catalog fixture', () => {
      expect(CLOTHING_CATALOG.length).toBe(14);
    });

    it('contains exactly 18 verified lifestyle, sportswear, streetwear, and kidswear items', () => {
      expect(LIFESTYLE_CATALOG.length).toBe(18);
    });

    it('contains exactly 32 total curated and verified fashion pieces in runtime catalog', () => {
      expect(ALL_CLOTHING_CATALOG.length).toBe(32);
      expect(ALL_CLOTHING_CATALOG.length).toBe(CLOTHING_CATALOG.length + LIFESTYLE_CATALOG.length);
    });

    it('ensures each of the 32 pieces converts cleanly to a CatalogProduct without crashing', () => {
      for (const item of ALL_CLOTHING_CATALOG) {
        const prod = toCatalogProduct(item);
        expect(prod.id).toBe(item.id);
        expect(prod.sku).toBeTruthy();
        expect(prod.name).toBe(item.name);
        expect(prod.price).toBe(item.priceINR);
        expect(prod.currency).toBe('INR');
        expect(prod.imageUrl).toBe(item.imageUrl);
        expect(prod.attributes).toBeTruthy();

        const parsed = JSON.parse(prod.attributes || '{}');
        expect(parsed.isReferral).toBe(true);
        expect(parsed.fulfillmentType).toBe('REFERRAL_LINK');
        expect(parsed.destinationUrl).toBe(item.destinationUrl);
      }
    });

    it('ensures 100% unique product IDs, slugs, and canonical UUIDs', () => {
      const ids = new Set(ALL_CLOTHING_CATALOG.map(p => p.id));
      expect(ids.size).toBe(32);

      const slugs = new Set(ALL_CLOTHING_CATALOG.map(p => p.slug));
      expect(slugs.size).toBe(32);

      const uuids = new Set(ALL_CLOTHING_CATALOG.map(p => p.uuid));
      expect(uuids.size).toBe(32);
    });
  });

  describe('2. Image Quality, Attributions & Non-Duplication Audit', () => {
    it('ensures all 32 items use 100% distinct, unique image URLs with no recycling', () => {
      const images = ALL_CLOTHING_CATALOG.map(p => p.imageUrl);
      const uniqueImages = new Set(images);
      expect(uniqueImages.size).toBe(32);
    });

    it('ensures all image URLs use secure HTTPS and valid image endpoints', () => {
      for (const item of ALL_CLOTHING_CATALOG) {
        expect(item.imageUrl.startsWith('https://')).toBe(true);
        expect(item.imageUrl).not.toContain('placehold.co');
        expect(item.imageUrl).not.toContain('localhost');
        expect(item.imageUrl.length).toBeGreaterThan(20);
      }
    });

    it('accurately specifies image attribution and licensing without false claims', () => {
      for (const item of ALL_CLOTHING_CATALOG) {
        expect(item.imageAttribution).toBeTruthy();
        // Honest attribution: must clearly declare source
        const attr = item.imageAttribution.toLowerCase();
        const hasHonestSource = 
          attr.includes('unsplash') || 
          attr.includes('editorial') || 
          attr.includes('atelier') || 
          attr.includes('brand') ||
          attr.includes('archive');
        expect(hasHonestSource).toBe(true);
      }
    });
  });

  describe('3. Brand Association & Verified Domain Destination Auditing', () => {
    it('strictly preserves the 58-brand canonical couture registry', () => {
      expect(BRANDS_DATA.length).toBe(58);
    });

    it('expands total verified brand registry to 70 authentic houses', () => {
      expect(ALL_VERIFIED_BRANDS.length).toBe(70);
    });

    it('ensures every product references a valid brand in the 70-brand registry', () => {
      const brandIds = new Set(ALL_VERIFIED_BRANDS.map(b => b.id));
      for (const item of ALL_CLOTHING_CATALOG) {
        expect(brandIds.has(item.brandId)).toBe(true);
      }
    });
    it('verifies that every official destination URL passes strict domain verification', () => {
      for (const item of ALL_CLOTHING_CATALOG) {
        expect(item.destinationUrl.startsWith('https://')).toBe(true);
        const verification = verifyBrandDomain(item.destinationUrl, item.brandSlug);
        if (!verification.isVerifiedOfficial) {
          console.error(`Domain verification failed for ${item.id} (${item.brandName}): ${item.destinationUrl}`, verification);
        }
        expect(verification.isValid).toBe(true);
        expect(verification.isVerifiedOfficial).toBe(true);
        expect(verification.securityStatus).toBe('VERIFIED_OFFICIAL');
      }
    });
  });

  describe('4. Eight-Category Filtering & Discovery Repertoire', () => {
    it('supports All Collections returning all 32 curated pieces', () => {
      expect(ALL_CLOTHING_CATALOG.length).toBe(32);
    });

    it('supports Men collection filtering with diverse couture, activewear & streetwear', () => {
      const men = ALL_CLOTHING_CATALOG.filter(p => p.audience === 'Men' || p.audience === 'Unisex');
      expect(men.length).toBeGreaterThanOrEqual(10);
      const brands = new Set(men.map(p => p.brandName));
      expect(brands.has('Nike')).toBe(true);
      expect(brands.has('Snitch')).toBe(true);
      expect(brands.has('Uniqlo')).toBe(true);
      expect(brands.has('Sabyasachi') || brands.has('Manyavar')).toBe(true);
    });

    it('supports Women collection filtering with couture, activewear & pret', () => {
      const women = ALL_CLOTHING_CATALOG.filter(p => p.audience === 'Women' || p.audience === 'Unisex');
      expect(women.length).toBeGreaterThanOrEqual(12);
      const brands = new Set(women.map(p => p.brandName));
      expect(brands.has('Puma')).toBe(true);
      expect(brands.has('W for Woman')).toBe(true);
      expect(brands.has('Sabyasachi')).toBe(true);
    });

    it('supports Kids collection filtering with verified infant & toddler playwear', () => {
      const kids = ALL_CLOTHING_CATALOG.filter(p => p.audience === 'Kids');
      expect(kids.length).toBeGreaterThanOrEqual(5);
      const brands = new Set(kids.map(p => p.brandName));
      expect(brands.has('Hopscotch')).toBe(true);
      expect(brands.has('FirstCry')).toBe(true);
      expect(brands.has('Carter’s')).toBe(true);
    });

    it('supports Gym & Activewear category filtering with technical performance items', () => {
      const activewear = ALL_CLOTHING_CATALOG.filter(p => 
        p.subcategory === 'Gym & Activewear'
      );
      expect(activewear.length).toBe(6);
      const brands = new Set(activewear.map(p => p.brandName));
      expect(brands.has('Nike')).toBe(true);
      expect(brands.has('Adidas')).toBe(true);
      expect(brands.has('Puma')).toBe(true);
      expect(brands.has('HRX')).toBe(true);
      expect(brands.has('Coitonic')).toBe(true);
      expect(brands.has('Decathlon')).toBe(true);
    });

    it('supports Streetwear category filtering with graphic & utility pieces', () => {
      const streetwear = ALL_CLOTHING_CATALOG.filter(p => 
        p.subcategory === 'Streetwear'
      );
      expect(streetwear.length).toBe(3);
      const brands = new Set(streetwear.map(p => p.brandName));
      expect(brands.has('The Souled Store')).toBe(true);
      expect(brands.has('Bewakoof')).toBe(true);
      expect(brands.has('Snitch')).toBe(true);
    });

    it('supports Casualwear category filtering with premium basics & denim', () => {
      const casualwear = ALL_CLOTHING_CATALOG.filter(p => 
        p.subcategory === 'Casualwear'
      );
      expect(casualwear.length).toBe(4);
      const brands = new Set(casualwear.map(p => p.brandName));
      expect(brands.has('Uniqlo')).toBe(true);
      expect(brands.has('H&M')).toBe(true);
      expect(brands.has('Levi’s') || brands.has("Levi's")).toBe(true);
      expect(brands.has('Rare Rabbit')).toBe(true);
    });

    it('supports Ethnicwear category filtering with artisanal Indian craftsmanship', () => {
      const ethnicwear = ALL_CLOTHING_CATALOG.filter(p => 
        p.subcategory === 'Ethnicwear' || 
        p.subcategory === 'Bridal Lehengas' || 
        p.subcategory === 'Sarees' || 
        p.subcategory === 'Sherwanis & Bandhgalas' ||
        p.subcategory === 'Heritage Festive'
      );
      expect(ethnicwear.length).toBeGreaterThanOrEqual(10);
      const brands = new Set(ethnicwear.map(p => p.brandName));
      expect(brands.has('Fabindia')).toBe(true);
      expect(brands.has('W for Woman')).toBe(true);
      expect(brands.has('Sabyasachi')).toBe(true);
    });
  });

  describe('5. Pricing Honesty & Absence of Fraudulent E-commerce Elements', () => {
    it('ensures authentic INR prices with zero fabricated discount tags or fake markdowns', () => {
      for (const item of ALL_CLOTHING_CATALOG) {
        expect(item.priceINR).toBeGreaterThanOrEqual(0);
        if (item.priceVerificationStatus === 'VERIFIED_ATELIER_PRICE') {
          expect(item.priceINR).toBeGreaterThan(0);
          expect(item.priceFormatted.startsWith('₹')).toBe(true);
          expect(item.priceSource).toBeTruthy();
        } else {
          expect(['Price on Inquiry', 'Price upon atelier inquiry']).toContain(item.priceFormatted);
        }
        // Ensure no fake e-commerce sale fields are present
        expect((item as any).fakeDiscount).toBeUndefined();
        expect((item as any).fakeRating).toBeUndefined();
        expect((item as any).stockCount).toBeUndefined();
      }
    });

    it('ensures all products are strictly flagged as pure referral without internal checkout', () => {
      for (const item of ALL_CLOTHING_CATALOG) {
        expect(item.isReferral).toBe(true);
        expect(item.fulfillmentType).toBe('REFERRAL_LINK');
      }
    });
  });

});


