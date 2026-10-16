/**
 * Stage 6I-A — Catalog Brand Identity Regression Tests
 *
 * Ensures that every entry in CLOTHING_CATALOG accurately references its
 * parent brand in the official brand directory (brandsData.ts).
 *
 * Verified brand identity corrections:
 *   prod-int-09  The Row            int-13  (was int-09 / Burberry — FIXED)
 *   prod-int-10  Brunello Cucinelli int-07  (was int-10 / Alexander McQueen — FIXED)
 *
 * Safety constraints: read-only — no database writes, no migrations executed.
 */

import { describe, it, expect } from 'vitest';
import { CLOTHING_CATALOG } from '../src/data/clothingCatalogData';
import { BRANDS_DATA as brands } from '../src/data/brandsData';

// ---------------------------------------------------------------------------
// Helper: build lookup maps from the official brand directory
// ---------------------------------------------------------------------------
const brandById = new Map(brands.map(b => [b.id, b]));
const brandBySlug = new Map(brands.map(b => [b.slug, b]));

// ---------------------------------------------------------------------------
// 1. Brand identity coherence — every field must match the directory
// ---------------------------------------------------------------------------
describe('Stage 6I-A: Catalog Brand Identity Regression', () => {
  describe('1. Brand ID → Name → Slug coherence for all 14 catalog products', () => {
    for (const product of CLOTHING_CATALOG) {
      it(`[${product.id}] "${product.name}" — brandId, brandName, and brandSlug are coherent`, () => {
        const directoryEntry = brandById.get(product.brandId);

        expect(
          directoryEntry,
          `Product "${product.id}" has brandId="${product.brandId}" which is NOT present in brandsData.ts`
        ).toBeDefined();

        if (!directoryEntry) return;

        expect(product.brandName).toBe(directoryEntry.name);
        expect(product.brandSlug).toBe(directoryEntry.slug);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Reverse check: slug lookup must resolve the same brand
  // ---------------------------------------------------------------------------
  describe('2. brandSlug reverse lookup agrees with brandId', () => {
    for (const product of CLOTHING_CATALOG) {
      it(`[${product.id}] slug "${product.brandSlug}" resolves to the same brand as brandId "${product.brandId}"`, () => {
        const bySlug = brandBySlug.get(product.brandSlug);
        const byId   = brandById.get(product.brandId);

        expect(bySlug).toBeDefined();
        expect(byId).toBeDefined();

        if (bySlug && byId) {
          expect(bySlug.id).toBe(byId.id);
        }
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Specific spot-checks for the two corrected entries (Stage 6I-A)
  // ---------------------------------------------------------------------------
  describe('3. Spot-checks for Stage 6I-A corrections', () => {
    it('prod-int-09 (The Row Cashmere Overcoat) -> brandId must be int-13', () => {
      const product = CLOTHING_CATALOG.find(p => p.id === 'prod-int-09');
      expect(product).toBeDefined();
      expect(product?.brandId).toBe('int-13');
      expect(product?.brandName).toBe('The Row');
      expect(product?.brandSlug).toBe('the-row');
      expect(brandById.get('int-13')?.name).toBe('The Row');
      expect(brandById.get('int-09')?.name).toBe('Burberry');
    });

    it('prod-int-10 (Brunello Cucinelli Cashmere Suit) -> brandId must be int-07', () => {
      const product = CLOTHING_CATALOG.find(p => p.id === 'prod-int-10');
      expect(product).toBeDefined();
      expect(product?.brandId).toBe('int-07');
      expect(product?.brandName).toBe('Brunello Cucinelli');
      expect(product?.brandSlug).toBe('brunello-cucinelli');
      expect(brandById.get('int-07')?.name).toBe('Brunello Cucinelli');
      expect(brandById.get('int-10')?.name).toBe('Alexander McQueen');
    });

    it('prod-int-09 brandId is NOT int-09 (Burberry)', () => {
      const product = CLOTHING_CATALOG.find(p => p.id === 'prod-int-09');
      expect(product?.brandId).not.toBe('int-09');
    });

    it('prod-int-10 brandId is NOT int-10 (Alexander McQueen)', () => {
      const product = CLOTHING_CATALOG.find(p => p.id === 'prod-int-10');
      expect(product?.brandId).not.toBe('int-10');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Cross-brand mismatch prevention
  // ---------------------------------------------------------------------------
  describe('4. Cross-brand mismatch prevention', () => {
    it('no catalog product whose brandName is "The Row" has brandId pointing to Burberry (int-09)', () => {
      const theRowProducts = CLOTHING_CATALOG.filter(p => p.brandName === 'The Row');
      for (const p of theRowProducts) {
        expect(p.brandId).not.toBe('int-09');
        expect(p.brandId).toBe('int-13');
      }
    });

    it('no catalog product whose brandName is "Brunello Cucinelli" has brandId pointing to Alexander McQueen (int-10)', () => {
      const bcProducts = CLOTHING_CATALOG.filter(p => p.brandName === 'Brunello Cucinelli');
      for (const p of bcProducts) {
        expect(p.brandId).not.toBe('int-10');
        expect(p.brandId).toBe('int-07');
      }
    });

    it('all 14 catalog products have a unique (productId, brandId) pairing', () => {
      const keys   = CLOTHING_CATALOG.map(p => `${p.id}::${p.brandId}`);
      const unique = new Set(keys);
      expect(unique.size).toBe(CLOTHING_CATALOG.length);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. UUID range safety (collision-free per read-only DB audit)
  // ---------------------------------------------------------------------------
  describe('5. Proposed UUID range is collision-safe', () => {
    const EXISTING_DB_UUIDS = new Set([
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174010',
      '123e4567-e89b-12d3-a456-426614174020',
      '123e4567-e89b-12d3-a456-426614174030',
    ]);

    const PROPOSED_CATALOG_UUIDS = [
      '123e4567-e89b-12d3-a456-426614174011',
      '123e4567-e89b-12d3-a456-426614174012',
      '123e4567-e89b-12d3-a456-426614174013',
      '123e4567-e89b-12d3-a456-426614174014',
      '123e4567-e89b-12d3-a456-426614174015',
      '123e4567-e89b-12d3-a456-426614174016',
      '123e4567-e89b-12d3-a456-426614174017',
      '123e4567-e89b-12d3-a456-426614174018',
      '123e4567-e89b-12d3-a456-426614174019',
      '123e4567-e89b-12d3-a456-426614174021',
      '123e4567-e89b-12d3-a456-426614174022',
      '123e4567-e89b-12d3-a456-426614174023',
      '123e4567-e89b-12d3-a456-426614174024',
      '123e4567-e89b-12d3-a456-426614174025',
    ];

    it('all 14 proposed catalog UUIDs are distinct from existing product_db rows', () => {
      for (const uuid of PROPOSED_CATALOG_UUIDS) {
        expect(EXISTING_DB_UUIDS.has(uuid)).toBe(false);
      }
    });

    it('all 14 proposed catalog UUIDs are unique among themselves', () => {
      const unique = new Set(PROPOSED_CATALOG_UUIDS);
      expect(unique.size).toBe(14);
    });

    it('proposed range does NOT include the legacy SKU-001 UUID', () => {
      const SKU_001_UUID = '123e4567-e89b-12d3-a456-426614174001';
      expect(PROPOSED_CATALOG_UUIDS).not.toContain(SKU_001_UUID);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Catalog completeness
  // ---------------------------------------------------------------------------
  describe('6. Catalog completeness', () => {
    it('catalog contains exactly 14 curated referral products', () => {
      expect(CLOTHING_CATALOG.length).toBe(14);
    });

    it('all 14 products have a non-empty brandId, brandName, and brandSlug', () => {
      for (const p of CLOTHING_CATALOG) {
        expect(p.brandId).toBeTruthy();
        expect(p.brandName).toBeTruthy();
        expect(p.brandSlug).toBeTruthy();
      }
    });

    it('every brandId in the catalog resolves to an entry in the brand directory', () => {
      const unmapped = CLOTHING_CATALOG.filter(p => !brandById.has(p.brandId));
      expect(unmapped).toEqual([]);
    });
  });
});
