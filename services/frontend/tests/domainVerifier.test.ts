import { describe, it, expect } from 'vitest';
import { verifyBrandDomain } from '../src/utils/domainVerifier';
import { BRANDS_DATA, getBrandBySlug } from '../src/data/brandsData';
import { CLOTHING_CATALOG, getProductsByBrand } from '../src/data/clothingCatalogData';

describe('LUMIÈRE Domain Verifier & Referral Security', () => {

  describe('1. Valid Approved-Domain URLs', () => {
    it('should verify exact official brand root domain via HTTPS', () => {
      const result = verifyBrandDomain('https://sabyasachi.com/collection/heritage-bridal/', 'sabyasachi');
      expect(result.isValid).toBe(true);
      expect(result.isVerifiedOfficial).toBe(true);
      expect(result.securityStatus).toBe('VERIFIED_OFFICIAL');
      expect(result.approvedDomain).toBe('sabyasachi.com');
    });

    it('should verify approved www subdomain via HTTPS', () => {
      const result = verifyBrandDomain('https://www.anitadongre.com/women/clothing/sarees/', 'anita-dongre');
      expect(result.isValid).toBe(true);
      expect(result.isVerifiedOfficial).toBe(true);
      expect(result.securityStatus).toBe('VERIFIED_OFFICIAL');
    });

    it('should verify approved e-commerce subdomains (e.g., shop, store)', () => {
      const result = verifyBrandDomain('https://shop.brunellocucinelli.com/en-in/men/ready-to-wear/suits/', 'brunello-cucinelli');
      expect(result.isValid).toBe(true);
      expect(result.isVerifiedOfficial).toBe(true);
      expect(result.securityStatus).toBe('VERIFIED_OFFICIAL');
    });
  });

  describe('2. Malformed and Unsafe URLs', () => {
    it('should reject javascript: execution protocols', () => {
      const result = verifyBrandDomain('javascript:alert(1)', 'sabyasachi');
      expect(result.isValid).toBe(false);
      expect(result.isVerifiedOfficial).toBe(false);
      expect(result.securityStatus).toBe('MALFORMED_OR_UNSAFE');
    });

    it('should reject data: protocols', () => {
      const result = verifyBrandDomain('data:text/html,<script>alert(1)</script>', 'sabyasachi');
      expect(result.isValid).toBe(false);
      expect(result.securityStatus).toBe('MALFORMED_OR_UNSAFE');
    });

    it('should reject empty or malformed strings', () => {
      const result = verifyBrandDomain('not-a-valid-url-format', 'sabyasachi');
      expect(result.isValid).toBe(false);
      expect(result.securityStatus).toBe('MALFORMED_OR_UNSAFE');
    });

    it('should reject embedded user credentials in URL', () => {
      const result = verifyBrandDomain('https://admin:secret@sabyasachi.com/collections', 'sabyasachi');
      expect(result.isValid).toBe(false);
      expect(result.securityStatus).toBe('MALFORMED_OR_UNSAFE');
    });
  });

  describe('3. Insecure Protocol Enforcement', () => {
    it('should reject plain HTTP URLs for production brand referrals', () => {
      const result = verifyBrandDomain('http://www.sabyasachi.com/bridal', 'sabyasachi');
      expect(result.isValid).toBe(false);
      expect(result.isVerifiedOfficial).toBe(false);
      expect(result.securityStatus).toBe('INSECURE_PROTOCOL');
    });
  });

  describe('4. Deceptive Hostname Suffixes', () => {
    it('should reject deceptive hostname incorporating brand domain before attacker suffix', () => {
      // Attacker owns .attacker.test
      const result = verifyBrandDomain('https://sabyasachi.com.attacker.test/phishing', 'sabyasachi');
      expect(result.isVerifiedOfficial).toBe(false);
      expect(['DECEPTIVE_HOSTNAME', 'THIRD_PARTY_UNVERIFIED']).toContain(result.securityStatus);
    });

    it('should reject deceptive prefix homographs (e.g., fakesabyasachi.com)', () => {
      const result = verifyBrandDomain('https://fakesabyasachi.com/store', 'sabyasachi');
      expect(result.isVerifiedOfficial).toBe(false);
      expect(result.securityStatus).toBe('DECEPTIVE_HOSTNAME');
    });
  });

  describe('5. Unapproved Subdomains', () => {
    it('should flag unapproved/arbitrary subdomains', () => {
      const result = verifyBrandDomain('https://untrusted-affiliate.sabyasachi.com/promo', 'sabyasachi');
      expect(result.isVerifiedOfficial).toBe(false);
      expect(result.securityStatus).toBe('UNAPPROVED_SUBDOMAIN');
    });
  });

  describe('6. Cross-Brand Destination Mismatches', () => {
    it('should flag when Brand A product points to Brand B domain', () => {
      // Product is for Sabyasachi, but link directs to Anita Dongre
      const result = verifyBrandDomain('https://www.anitadongre.com/women', 'sabyasachi');
      expect(result.isVerifiedOfficial).toBe(false);
      expect(result.securityStatus).toBe('CROSS_BRAND_MISMATCH');
      expect(result.matchedBrandName).toBe('Anita Dongre');
    });
  });

  describe('7. Brand Directory Slugs & Lookup', () => {
    it('should find valid brand by slug', () => {
      const brand = getBrandBySlug('sabyasachi');
      expect(brand).toBeDefined();
      expect(brand?.name).toBe('Sabyasachi');
      expect(brand?.origin).toBe('INDIAN');
      expect(brand?.verifiedDomain).toBe('sabyasachi.com');
    });

    it('should return undefined for invalid brand slug', () => {
      const brand = getBrandBySlug('non-existent-fake-couture');
      expect(brand).toBeUndefined();
    });

    it('should maintain 55-60 curated brands (currently 58)', () => {
      expect(BRANDS_DATA.length).toBeGreaterThanOrEqual(55);
      expect(BRANDS_DATA.length).toBeLessThanOrEqual(60);
      expect(BRANDS_DATA.length).toBe(58);
    });
  });

  describe('8. Clothing Catalog Dataset & Price Verification', () => {
    it('should have products associated with correct brand IDs', () => {
      for (const prod of CLOTHING_CATALOG) {
        expect(prod.id).toBeTruthy();
        expect(prod.brandId).toBeTruthy();
        expect(prod.destinationUrl.startsWith('https://')).toBe(true);
        expect(prod.priceFormatted).toBeTruthy();
        expect(['VERIFIED_ATELIER_PRICE', 'PRICE_UPON_INQUIRY', 'ILLUSTRATIVE_ESTIMATE']).toContain(prod.priceVerificationStatus);
      }
    });

    it('should correctly query products for a given brand', () => {
      const sabyaProducts = getProductsByBrand('sabyasachi');
      expect(sabyaProducts.length).toBeGreaterThan(0);
      expect(sabyaProducts[0].brandSlug).toBe('sabyasachi');
    });

    it('should return empty array for brand without catalog products', () => {
      const emptyBrandProducts = getProductsByBrand('kallol-datta');
      expect(Array.isArray(emptyBrandProducts)).toBe(true);
      expect(emptyBrandProducts.length).toBe(0);
    });
  });
});
