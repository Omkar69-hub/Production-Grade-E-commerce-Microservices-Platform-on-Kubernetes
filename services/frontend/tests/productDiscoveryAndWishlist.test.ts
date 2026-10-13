import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  CLOTHING_CATALOG, 
  getProductByIdOrSlug, 
  toCatalogProduct 
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

    it('should categorize items into accurate price brackets and price-upon-inquiry', () => {
      const inquiryItems = CLOTHING_CATALOG.filter(p => p.priceVerificationStatus === 'PRICE_UPON_INQUIRY');
      expect(inquiryItems.length).toBe(2); // Sabyasachi Lehenga and Chanel Jacket
      expect(inquiryItems.every(p => p.priceINR === 0)).toBe(true);

      const under50k = CLOTHING_CATALOG.filter(p => p.priceINR > 0 && p.priceINR < 50000);
      expect(under50k.length).toBe(4); // Raw Mango, Manyavar, Torani, Biba

      const above300k = CLOTHING_CATALOG.filter(p => p.priceINR > 300000);
      expect(above300k.length).toBe(2); // The Row, Brunello Cucinelli
    });
  });

  // ==========================================
  // 2. SORTING AND EMPTY STATES
  // ==========================================
  describe('2. Sorting & Graceful Empty States', () => {
    it('should sort comparable prices ascending, placing inquiry items at the end', () => {
      const sorted = [...CLOTHING_CATALOG].sort((a, b) => {
        if (a.priceINR === 0 && b.priceINR > 0) return 1;
        if (b.priceINR === 0 && a.priceINR > 0) return -1;
        return a.priceINR - b.priceINR;
      });

      // Lowest priced items should come first
      expect(sorted[0].priceINR).toBe(4999); // Biba
      expect(sorted[1].priceINR).toBe(18500); // Torani
      // Last items should be the inquiry items
      expect(sorted[sorted.length - 1].priceVerificationStatus).toBe('PRICE_UPON_INQUIRY');
      expect(sorted[sorted.length - 2].priceVerificationStatus).toBe('PRICE_UPON_INQUIRY');
    });

    it('should sort comparable prices descending with inquiry items at the end', () => {
      const sorted = [...CLOTHING_CATALOG].sort((a, b) => {
        if (a.priceINR === 0 && b.priceINR > 0) return 1;
        if (b.priceINR === 0 && a.priceINR > 0) return -1;
        return b.priceINR - a.priceINR;
      });

      expect(sorted[0].priceINR).toBe(520000); // The Row Cashmere Overcoat
      expect(sorted[1].priceINR).toBe(460000); // Brunello Cucinelli Suit
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

    it('should find valid product by ID or by slug', () => {
      const byId = getProductByIdOrSlug('prod-ind-01');
      expect(byId).toBeDefined();
      expect(byId?.brandName).toBe('Sabyasachi');

      const bySlug = getProductByIdOrSlug('sabyasachi-heritage-bridal-lehenga');
      expect(bySlug).toBeDefined();
      expect(bySlug?.id).toBe('prod-ind-01');
    });

    it('should accurately convert a VerifiedClothingProduct to a compliant Product object', () => {
      const item = CLOTHING_CATALOG[0];
      const prod = toCatalogProduct(item);

      expect(prod.id).toBe(item.id);
      expect(prod.name).toBe(item.name);
      expect(prod.price).toBe(item.priceINR);
      expect(prod.currency).toBe('INR');
      expect(prod.attributes).toBeDefined();

      const parsedAttrs = JSON.parse(prod.attributes!);
      expect(parsedAttrs.destinationUrl).toBe(item.destinationUrl);
      expect(parsedAttrs.priceVerificationStatus).toBe(item.priceVerificationStatus);
      expect(parsedAttrs.fabric).toBe(item.fabric);
    });
  });
});
