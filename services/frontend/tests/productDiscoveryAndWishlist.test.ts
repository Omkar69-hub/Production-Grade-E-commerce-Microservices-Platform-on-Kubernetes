import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  CLOTHING_CATALOG, 
  getProductByIdOrSlug, 
  toCatalogProduct,
  CANONICAL_CATALOG_UUIDS
} from '../src/data/clothingCatalogData';
import { 
  getWishlistIds, 
  toggleWishlistItem, 
  removeWishlistItem, 
  clearWishlist, 
  isInWishlist 
} from '../src/utils/wishlistStorage';
import { verifyBrandDomain } from '../src/utils/domainVerifier';

describe('LUMIÈRE Stage 5: Product Discovery, Sizing & Wishlist', () => {

  // ==========================================
  // 1. SEARCH AND SUPPORTED FILTERS
  // ==========================================
  describe('1. Audience Browsing & Filter Integrity', () => {
    it('should accurately partition catalog into Women, Men, and Kids collections', () => {
      const womenPieces = CLOTHING_CATALOG.filter(p => p.audience === 'Women');
      const menPieces = CLOTHING_CATALOG.filter(p => p.audience === 'Men');
      const kidsPieces = CLOTHING_CATALOG.filter(p => p.audience === 'Kids');

      expect(womenPieces.length).toBe(8);
      expect(menPieces.length).toBe(4);
      expect(kidsPieces.length).toBe(2);
      expect(womenPieces.length + menPieces.length + kidsPieces.length).toBe(CLOTHING_CATALOG.length);
    });

    it('should search products by product name or brand name correctly', () => {
      const sabyaResults = CLOTHING_CATALOG.filter(p => 
        p.name.toLowerCase().includes('lehenga') || p.brandName.toLowerCase().includes('sabyasachi')
      );
      expect(sabyaResults.length).toBeGreaterThanOrEqual(1);
      expect(sabyaResults[0].brandSlug).toBe('sabyasachi');

      const sareeResults = CLOTHING_CATALOG.filter(p => p.name.toLowerCase().includes('saree'));
      expect(sareeResults.length).toBe(3); // Anita Dongre, Manish Malhotra, Tarun Tahiliani
    });

    it('should filter by specific subcategories supported by real data', () => {
      const sarees = CLOTHING_CATALOG.filter(p => p.subcategory === 'Sarees');
      expect(sarees.length).toBe(2); // Anita Dongre, Manish Malhotra

      const sherwanis = CLOTHING_CATALOG.filter(p => p.subcategory === 'Sherwanis & Bandhgalas');
      expect(sherwanis.length).toBe(2); // Manyavar and Shantnu & Nikhil
      expect(sherwanis.map(s => s.brandName)).toContain('Manyavar');
    });

    it('should filter by sizes supported by the catalog without fabricating unverified sizes', () => {
      const freeSizeItems = CLOTHING_CATALOG.filter(p => p.availableSizes?.includes('Free Size'));
      expect(freeSizeItems.length).toBeGreaterThan(0);
      for (const item of freeSizeItems) {
        expect(['Sarees', 'Concept Sarees']).toContain(item.subcategory);
      }

      const customFitItems = CLOTHING_CATALOG.filter(p => p.availableSizes?.includes('Custom Fit'));
      expect(customFitItems.length).toBeGreaterThan(0);
    });

    it('should filter by authentic colors supported in the catalog', () => {
      const crimsonItems = CLOTHING_CATALOG.filter(p => p.colors?.includes('Crimson Red'));
      expect(crimsonItems.length).toBeGreaterThan(0);
      expect(crimsonItems[0].brandSlug).toBe('sabyasachi');
    });

    it('should categorize all curated items into price-upon-inquiry with no false verified prices', () => {
      const inquiryItems = CLOTHING_CATALOG.filter(p => p.priceVerificationStatus === 'PRICE_UPON_INQUIRY');
      expect(inquiryItems.length).toBe(14); // All 14 clothing items are inquiry-only
      expect(inquiryItems.every(p => p.priceINR === 0)).toBe(true);

      const verifiedPrices = CLOTHING_CATALOG.filter(p => p.priceVerificationStatus === 'VERIFIED_ATELIER_PRICE');
      expect(verifiedPrices.length).toBe(0); // Zero unverified numeric prices labeled verified

      const under50k = CLOTHING_CATALOG.filter(p => p.priceINR > 0 && p.priceINR < 50000);
      expect(under50k.length).toBe(0); // No numeric prices active without reproducible evidence

      const above300k = CLOTHING_CATALOG.filter(p => p.priceINR > 300000);
      expect(above300k.length).toBe(0);
    });
  });

  // ==========================================
  // 2. SORTING AND EMPTY STATES
  // ==========================================
  describe('2. Sorting & Graceful Empty States', () => {
    it('should sort comparable prices ascending, placing inquiry items at the end', () => {
      const mixedCatalog = [
        ...CLOTHING_CATALOG,
        { id: 'api-item-1', priceINR: 25000, priceVerificationStatus: 'PRICE_UPON_INQUIRY' as const, name: 'Prêt Piece A' },
        { id: 'api-item-2', priceINR: 12000, priceVerificationStatus: 'PRICE_UPON_INQUIRY' as const, name: 'Prêt Piece B' }
      ];
      const sorted = [...mixedCatalog].sort((a, b) => {
        if (a.priceINR === 0 && b.priceINR > 0) return 1;
        if (b.priceINR === 0 && a.priceINR > 0) return -1;
        return a.priceINR - b.priceINR;
      });

      // Lowest priced items should come first
      expect(sorted[0].priceINR).toBe(12000);
      expect(sorted[1].priceINR).toBe(25000);
      // Last items should be the inquiry items
      expect(sorted[sorted.length - 1].priceINR).toBe(0);
      expect(sorted[sorted.length - 1].priceVerificationStatus).toBe('PRICE_UPON_INQUIRY');
    });

    it('should sort comparable prices descending with inquiry items at the end', () => {
      const mixedCatalog = [
        ...CLOTHING_CATALOG,
        { id: 'api-item-1', priceINR: 25000, priceVerificationStatus: 'PRICE_UPON_INQUIRY' as const, name: 'Prêt Piece A' },
        { id: 'api-item-2', priceINR: 75000, priceVerificationStatus: 'PRICE_UPON_INQUIRY' as const, name: 'Prêt Piece B' }
      ];
      const sorted = [...mixedCatalog].sort((a, b) => {
        if (a.priceINR === 0 && b.priceINR > 0) return 1;
        if (b.priceINR === 0 && a.priceINR > 0) return -1;
        return b.priceINR - a.priceINR;
      });

      expect(sorted[0].priceINR).toBe(75000);
      expect(sorted[1].priceINR).toBe(25000);
      expect(sorted[sorted.length - 1].priceINR).toBe(0);
      expect(sorted[sorted.length - 1].priceVerificationStatus).toBe('PRICE_UPON_INQUIRY');
    });

    it('should return empty list when impossible filter criteria is applied without throwing errors', () => {
      const nonExistent = CLOTHING_CATALOG.filter(p => 
        p.brandName === 'Sabyasachi' && p.audience === 'Kids'
      );
      expect(nonExistent).toEqual([]);
    });
  });

  // ==========================================
  // 3. WISHLIST ADD/REMOVE & PERSISTENCE
  // ==========================================
  describe('3. Wishlist Management & Persistence', () => {
    beforeEach(() => {
      localStorage.clear();
      vi.restoreAllMocks();
    });

    it('should start with an empty wishlist', () => {
      expect(getWishlistIds()).toEqual([]);
      expect(isInWishlist('prod-ind-01')).toBe(false);
    });

    it('should toggle an item into the wishlist and persist to localStorage', () => {
      const added = toggleWishlistItem('prod-ind-01');
      expect(added).toBe(true);
      expect(isInWishlist('prod-ind-01')).toBe(true);
      expect(getWishlistIds()).toContain('prod-ind-01');

      const raw = localStorage.getItem('lumiere_wishlist');
      expect(raw).toBe(JSON.stringify(['prod-ind-01']));
    });

    it('should toggle an existing item out of the wishlist', () => {
      toggleWishlistItem('prod-ind-01');
      expect(isInWishlist('prod-ind-01')).toBe(true);

      const added = toggleWishlistItem('prod-ind-01');
      expect(added).toBe(false);
      expect(isInWishlist('prod-ind-01')).toBe(false);
      expect(getWishlistIds()).toEqual([]);
    });

    it('should remove a specific item via removeWishlistItem', () => {
      toggleWishlistItem('prod-ind-01');
      toggleWishlistItem('prod-ind-02');
      expect(getWishlistIds().length).toBe(2);

      removeWishlistItem('prod-ind-01');
      expect(getWishlistIds()).toEqual(['prod-ind-02']);
    });

    it('should clear the entire wishlist via clearWishlist', () => {
      toggleWishlistItem('prod-ind-01');
      toggleWishlistItem('prod-ind-02');
      clearWishlist();
      expect(getWishlistIds()).toEqual([]);
    });

    it('should handle corrupted JSON or invalid types in localStorage gracefully', () => {
      localStorage.setItem('lumiere_wishlist', '{not:valid:json');
      expect(getWishlistIds()).toEqual([]);

      localStorage.setItem('lumiere_wishlist', JSON.stringify({ not: 'an array' }));
      expect(getWishlistIds()).toEqual([]);
    });
  });

  // ==========================================
  // 4. SIZE-GUIDE UNIT CONVERSION & BENCHMARKS
  // ==========================================
  describe('4. Sizing Matrix Unit Conversions & Defensible Calculation', () => {
    it('should convert inches to cm with exact rounding', () => {
      const inchesToCm = (inches: number) => Math.round(inches * 2.54);
      expect(inchesToCm(36)).toBe(91);
      expect(inchesToCm(38)).toBe(97);
      expect(inchesToCm(40)).toBe(102);
      expect(inchesToCm(42)).toBe(107);
    });

    it('should calculate closest size benchmark mathematically from chest input', () => {
      const getClosestMenBenchmark = (chestInches: number) => {
        if (chestInches <= 38.5) return '38 / S';
        if (chestInches <= 40.5) return '40 / M';
        if (chestInches <= 42.5) return '42 / L';
        if (chestInches <= 44.5) return '44 / XL';
        return '46 / XXL';
      };

      expect(getClosestMenBenchmark(38)).toBe('38 / S');
      expect(getClosestMenBenchmark(40)).toBe('40 / M');
      expect(getClosestMenBenchmark(42)).toBe('42 / L');
      expect(getClosestMenBenchmark(44)).toBe('44 / XL');
      expect(getClosestMenBenchmark(46)).toBe('46 / XXL');
    });
  });

  // ==========================================
  // 5. PRODUCT-TO-BRAND DESTINATION MATCHING
  // ==========================================
  describe('5. Product-to-Brand Referral Security', () => {
    it('should verify that all 14 catalog products point to approved brand root domains', () => {
      for (const product of CLOTHING_CATALOG) {
        const check = verifyBrandDomain(product.destinationUrl, product.brandSlug);
        expect(check.isValid).toBe(true);
        expect(check.isVerifiedOfficial).toBe(true);
        expect(check.securityStatus).toBe('VERIFIED_OFFICIAL');
      }
    });

    it('should ensure no product points to a mismatched brand domain', () => {
      for (const product of CLOTHING_CATALOG) {
        const check = verifyBrandDomain(product.destinationUrl, product.brandSlug);
        expect(check.securityStatus).not.toBe('CROSS_BRAND_MISMATCH');
      }
    });
  });

  // ==========================================
  // 6. MISSING AND UNVERIFIED DATA PROTECTION
  // ==========================================
  describe('6. Missing Data and Archive Fallback', () => {
    it('should return undefined for non-existent product IDs or slugs', () => {
      expect(getProductByIdOrSlug('non-existent-product-id')).toBeUndefined();
      expect(getProductByIdOrSlug('fake-brand-lehenga')).toBeUndefined();
    });

    it('should find valid product by legacy ID, product slug, or canonical UUID without ambiguity', () => {
      // By legacy ID
      const byId = getProductByIdOrSlug('prod-ind-01');
      expect(byId).toBeDefined();
      expect(byId?.brandName).toBe('Sabyasachi');
      expect(byId?.uuid).toBe('123e4567-e89b-12d3-a456-426614174011');

      // By slug
      const bySlug = getProductByIdOrSlug('sabyasachi-heritage-bridal-lehenga');
      expect(bySlug).toBeDefined();
      expect(bySlug?.id).toBe('prod-ind-01');
      expect(bySlug?.uuid).toBe('123e4567-e89b-12d3-a456-426614174011');

      // By canonical UUID
      const byUuid = getProductByIdOrSlug('123e4567-e89b-12d3-a456-426614174011');
      expect(byUuid).toBeDefined();
      expect(byUuid?.id).toBe('prod-ind-01');
      expect(byUuid?.slug).toBe('sabyasachi-heritage-bridal-lehenga');

      // Whitespace and case-insensitivity
      const byMixed = getProductByIdOrSlug('  123E4567-E89B-12D3-A456-426614174011  ');
      expect(byMixed?.id).toBe('prod-ind-01');
    });

    it('should accurately convert a VerifiedClothingProduct to a compliant Product object with identity bridge attributes', () => {
      const item = CLOTHING_CATALOG[0];
      const prod = toCatalogProduct(item);

      expect(prod.id).toBe(item.id);
      expect(prod.name).toBe(item.name);
      expect(prod.price).toBe(0); // Internal sentinel 0
      expect(prod.currency).toBe('INR');
      expect(prod.attributes).toBeDefined();

      const parsedAttrs = JSON.parse(prod.attributes!);
      expect(parsedAttrs.uuid).toBe(item.uuid);
      expect(parsedAttrs.frontendId).toBe(item.id);
      expect(parsedAttrs.isEditorialConcept).toBe(true);
      expect(parsedAttrs.destinationUrl).toBe(item.destinationUrl);
      expect(parsedAttrs.priceVerificationStatus).toBe('PRICE_UPON_INQUIRY');
      expect(parsedAttrs.priceFormatted).toBe('Price upon atelier inquiry');
    });
  });

  // ==========================================
  // 7. STAGE 6I-C: CATALOG TRUTHFULNESS & EDITORIAL INTEGRITY
  // ==========================================
  describe('7. Stage 6I-C: Catalog Truthfulness & Editorial Integrity', () => {
    it('should ensure ALL 14 curated entries use inquiry presentation and internal sentinel 0', () => {
      expect(CLOTHING_CATALOG.length).toBe(14);
      for (const item of CLOTHING_CATALOG) {
        expect(item.priceVerificationStatus).toBe('PRICE_UPON_INQUIRY');
        expect(item.priceINR).toBe(0);
        expect(item.priceFormatted).toBe('Price upon atelier inquiry');
        expect(item.destinationType).toBe('OFFICIAL_CATEGORY_DESTINATION');
        expect(item.isEditorialConcept).toBe(true);
      }
    });

    it('should confirm ZERO curated products are labeled VERIFIED_ATELIER_PRICE', () => {
      const falseVerified = CLOTHING_CATALOG.filter(p => p.priceVerificationStatus === 'VERIFIED_ATELIER_PRICE');
      expect(falseVerified.length).toBe(0);
    });

    it('should confirm all destinations are official brand category destinations, not exact product listings', () => {
      for (const item of CLOTHING_CATALOG) {
        expect(item.destinationType).toBe('OFFICIAL_CATEGORY_DESTINATION');
        expect(item.destinationType).not.toBe('EXACT_PRODUCT_PAGE');
      }
    });

    it('should frame physical specifications as illustrative editorial concepts', () => {
      for (const item of CLOTHING_CATALOG) {
        expect(item.isEditorialConcept).toBe(true);
        expect(item.description).toBeTruthy();
        expect(item.description.toLowerCase()).not.toContain('in stock guaranteed');
        expect(item.description.toLowerCase()).not.toContain('official partner store');
      }
    });
  });

  // ==========================================
  // 8. IDENTITY BRIDGE, WISHLIST CONTINUITY & DEDUPLICATION
  // ==========================================
  describe('8. Identity Bridge, Wishlist Continuity & Deduplication', () => {
    it('should verify all 14 canonical UUIDs map exactly to Stage 6I-B3 sequence', () => {
      const expectedMapping: Record<string, string> = {
        'prod-ind-01': '123e4567-e89b-12d3-a456-426614174011',
        'prod-ind-02': '123e4567-e89b-12d3-a456-426614174012',
        'prod-ind-03': '123e4567-e89b-12d3-a456-426614174013',
        'prod-ind-04': '123e4567-e89b-12d3-a456-426614174014',
        'prod-ind-05': '123e4567-e89b-12d3-a456-426614174015',
        'prod-ind-11': '123e4567-e89b-12d3-a456-426614174016',
        'prod-ind-12': '123e4567-e89b-12d3-a456-426614174017',
        'prod-ind-16': '123e4567-e89b-12d3-a456-426614174018',
        'prod-ind-13': '123e4567-e89b-12d3-a456-426614174019',
        'prod-ind-24': '123e4567-e89b-12d3-a456-426614174021', // skips 4020
        'prod-int-02': '123e4567-e89b-12d3-a456-426614174022',
        'prod-int-09': '123e4567-e89b-12d3-a456-426614174023',
        'prod-int-10': '123e4567-e89b-12d3-a456-426614174024',
        'prod-int-01': '123e4567-e89b-12d3-a456-426614174025',
      };

      for (const [legacyId, expectedUuid] of Object.entries(expectedMapping)) {
        expect(CANONICAL_CATALOG_UUIDS[legacyId]).toBe(expectedUuid);
        const item = CLOTHING_CATALOG.find(p => p.id === legacyId);
        expect(item).toBeDefined();
        expect(item?.uuid).toBe(expectedUuid);
      }
    });

    it('should maintain wishlist continuity across legacy IDs, product slugs, and canonical UUIDs', () => {
      const wishlistIds = [
        'prod-ind-01',
        'anita-dongre-pichhwai-silk-saree',
        '123e4567-e89b-12d3-a456-426614174013'
      ];

      const resolved = CLOTHING_CATALOG.filter(item =>
        wishlistIds.includes(item.id) ||
        wishlistIds.includes(item.slug) ||
        (item.uuid && wishlistIds.includes(item.uuid))
      );

      expect(resolved.length).toBe(3);
      expect(resolved.map(r => r.id)).toEqual(['prod-ind-01', 'prod-ind-02', 'prod-ind-03']);
    });

    it('should prevent duplicate rendering when backend API returns persisted products matching curated items', () => {
      const verifiedProducts = CLOTHING_CATALOG.map(toCatalogProduct);
      
      const apiProducts = [
        {
          id: '123e4567-e89b-12d3-a456-426614174011',
          sku: 'SABYASACHI-HERITAGE-BRIDAL-LEHENGA',
          name: 'Royal Heritage Zardozi Velvet Lehenga',
          price: 0,
          currency: 'INR',
          attributes: JSON.stringify({
            uuid: '123e4567-e89b-12d3-a456-426614174011',
            frontendId: 'prod-ind-01',
          }),
        },
        {
          id: 'new-genuine-backend-prod',
          sku: 'NEW-GENUINE-SKU',
          name: 'Genuine In-House Accessory',
          price: 4500,
          currency: 'INR',
        }
      ];

      const combined = [...verifiedProducts];
      for (const apiProd of apiProducts) {
        const isDuplicate = combined.some((p) => {
          if (p.id === apiProd.id) return true;
          if (p.sku && apiProd.sku && p.sku.toUpperCase() === apiProd.sku.toUpperCase()) return true;
          let pAttr: any = {};
          try { if (p.attributes) pAttr = JSON.parse(p.attributes); } catch {}
          let apiAttr: any = {};
          try { if (apiProd.attributes) apiAttr = JSON.parse(apiProd.attributes); } catch {}
          if (pAttr.uuid && (apiProd.id === pAttr.uuid || apiAttr.uuid === pAttr.uuid)) return true;
          if (apiAttr.frontendId && p.id === apiAttr.frontendId) return true;
          return false;
        });
        if (!isDuplicate) {
          combined.push(apiProd as any);
        }
      }

      expect(combined.length).toBe(15);
      expect(combined.filter(p => p.sku === 'SABYASACHI-HERITAGE-BRIDAL-LEHENGA').length).toBe(1);
      expect(combined.some(p => p.id === 'new-genuine-backend-prod')).toBe(true);
    });
  });
});
