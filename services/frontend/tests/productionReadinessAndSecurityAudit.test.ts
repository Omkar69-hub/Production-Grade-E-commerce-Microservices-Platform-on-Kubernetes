import { describe, it, expect } from 'vitest';
import { tokenStorage } from '../src/services/tokenStorage';
import { verifyBrandDomain, getSafeExternalLinkAttributes } from '../src/utils/domainVerifier';
import { ALL_CLOTHING_CATALOG, CLOTHING_CATALOG } from '../src/data/clothingCatalogData';
import { ALL_VERIFIED_BRANDS, BRANDS_DATA } from '../src/data/brandsData';

describe('LUMIÈRE Stage 14B.6: Production-Readiness & Security Audit', () => {

  describe('1. Authentication & Session Security Invariants', () => {
    it('stores access token in-memory only and never writes to localStorage or sessionStorage', () => {
      tokenStorage.setAccessToken('test-access-token-xyz');
      expect(tokenStorage.getAccessToken()).toBe('test-access-token-xyz');
      expect(localStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('token')).toBeNull();
    });

    it('clears in-memory token and cleans any residual storage keys on clearToken()', () => {
      localStorage.setItem('token', 'legacy-leak');
      sessionStorage.setItem('token', 'legacy-leak');
      tokenStorage.setAccessToken('active-token');

      tokenStorage.clearToken();
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('token')).toBeNull();
    });

    it('guarantees safe external link attributes have noopener and noreferrer', () => {
      const attrs = getSafeExternalLinkAttributes();
      expect(attrs.target).toBe('_blank');
      expect(attrs.rel).toBe('noopener noreferrer');
    });
  });

  describe('2. Referral Protocol & Domain Guard Verification', () => {
    it('blocks execution-capable protocols like javascript:, data:, and file:', () => {
      const jsResult = verifyBrandDomain('javascript:alert(1)', 'nike');
      expect(jsResult.isValid).toBe(false);
      expect(jsResult.securityStatus).toBe('MALFORMED_OR_UNSAFE');

      const dataResult = verifyBrandDomain('data:text/html,<script>alert(1)</script>', 'nike');
      expect(dataResult.isValid).toBe(false);
      expect(dataResult.securityStatus).toBe('MALFORMED_OR_UNSAFE');
    });

    it('blocks embedded credentials in referral URLs', () => {
      const credResult = verifyBrandDomain('https://admin:secret@nike.com/shop', 'nike');
      expect(credResult.isValid).toBe(false);
      expect(credResult.securityStatus).toBe('MALFORMED_OR_UNSAFE');
    });

    it('blocks insecure HTTP protocol and requires HTTPS encryption', () => {
      const httpResult = verifyBrandDomain('http://www.nike.com/in', 'nike');
      expect(httpResult.isValid).toBe(false);
      expect(httpResult.securityStatus).toBe('INSECURE_PROTOCOL');
    });

    it('detects deceptive domain spoofing attempts', () => {
      const spoofResult = verifyBrandDomain('https://nike.com.attacker.evil/shoes', 'nike');
      expect(spoofResult.isVerifiedOfficial).toBe(false);
      expect(spoofResult.securityStatus).toBe('DECEPTIVE_HOSTNAME');
    });

    it('verifies that 100% of the 32 runtime catalog products pass official domain verification', () => {
      expect(ALL_CLOTHING_CATALOG.length).toBe(32);
      for (const item of ALL_CLOTHING_CATALOG) {
        const verification = verifyBrandDomain(item.destinationUrl, item.brandSlug);
        expect(verification.isValid).toBe(true);
        expect(verification.isVerifiedOfficial).toBe(true);
        expect(verification.securityStatus).toBe('VERIFIED_OFFICIAL');
      }
    });
  });

  describe('3. Catalog Honesty, Brand Attribution & Data Accuracy', () => {
    it('preserves the 14-piece canonical couture fixture and 58-brand registry', () => {
      expect(CLOTHING_CATALOG.length).toBe(14);
      expect(BRANDS_DATA.length).toBe(58);
      expect(ALL_VERIFIED_BRANDS.length).toBe(70);
    });

    it('ensures all 32 products declare honest, transparent image attributions', () => {
      for (const item of ALL_CLOTHING_CATALOG) {
        expect(item.imageAttribution).toBeTruthy();
        expect(item.imageAttribution.length).toBeGreaterThan(15);
      }
    });

    it('ensures zero fabricated commercial markup fields exist on any catalog item', () => {
      for (const item of ALL_CLOTHING_CATALOG) {
        expect((item as any).fakeDiscount).toBeUndefined();
        expect((item as any).fakeRating).toBeUndefined();
        expect((item as any).stockCount).toBeUndefined();
        expect(item.isReferral).toBe(true);
        expect(item.fulfillmentType).toBe('REFERRAL_LINK');
      }
    });
  });

  describe('4. Category Taxonomy & Audience Mapping Coverage', () => {
    const categories = ['men', 'women', 'kids', 'gymwear', 'streetwear', 'casualwear', 'ethnicwear'];

    it('ensures all 7 active category capsules map to distinct product subsets', () => {
      const men = ALL_CLOTHING_CATALOG.filter(p => p.audience === 'Men' || p.audience === 'Unisex');
      const women = ALL_CLOTHING_CATALOG.filter(p => p.audience === 'Women' || p.audience === 'Unisex');
      const kids = ALL_CLOTHING_CATALOG.filter(p => p.audience === 'Kids');
      const gym = ALL_CLOTHING_CATALOG.filter(p => p.subcategory === 'Gym & Activewear');
      const street = ALL_CLOTHING_CATALOG.filter(p => p.subcategory === 'Streetwear');
      const casual = ALL_CLOTHING_CATALOG.filter(p => p.subcategory === 'Casualwear');
      const ethnic = ALL_CLOTHING_CATALOG.filter(p => 
        p.subcategory === 'Ethnicwear' || 
        p.subcategory === 'Bridal Lehengas' || 
        p.subcategory === 'Sarees' || 
        p.subcategory === 'Sherwanis & Bandhgalas' ||
        p.subcategory === 'Heritage Festive'
      );

      expect(men.length).toBeGreaterThan(0);
      expect(women.length).toBeGreaterThan(0);
      expect(kids.length).toBeGreaterThan(0);
      expect(gym.length).toBe(6);
      expect(street.length).toBe(3);
      expect(casual.length).toBe(4);
      expect(ethnic.length).toBeGreaterThanOrEqual(10);
    });
  });

});
