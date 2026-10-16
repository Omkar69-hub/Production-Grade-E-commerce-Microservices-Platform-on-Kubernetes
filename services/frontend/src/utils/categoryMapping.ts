import type { Product } from '../types/product';

/**
 * LUMIÈRE Category Contract & API Serialization Boundary
 * 
 * Defines the explicit mapping between frontend discovery slugs ('clothing', 'footwear', etc.)
 * and canonical PostgreSQL backend UUIDs established in Flyway migration V4__add_categories_and_attributes.sql.
 * 
 * Safety Principle:
 * - Frontend discovery, URL parameters, routes, and static catalog continue to use human-readable slugs ('clothing').
 * - At the API serialization boundary (ProductService outgoing HTTP requests), slugs are safely converted to UUIDs.
 * - This prevents breaking frontend discovery while ensuring Spring Boot's @RequestParam UUID categoryId receives a valid UUID.
 */

export const BACKEND_CATEGORY_UUIDS = {
  CLOTHING: '123e4567-e89b-12d3-a456-426614174010',
  FOOTWEAR: '123e4567-e89b-12d3-a456-426614174020',
  ACCESSORIES: '123e4567-e89b-12d3-a456-426614174030',
  ELECTRONICS: '123e4567-e89b-12d3-a456-426614174000',
} as const;

export const FRONTEND_CATEGORY_SLUGS = {
  CLOTHING: 'clothing',
  FOOTWEAR: 'footwear',
  ACCESSORIES: 'accessories',
  ELECTRONICS: 'electronics',
} as const;

/**
 * Mapping table from frontend slug to backend canonical UUID
 */
export const CATEGORY_SLUG_TO_BACKEND_UUID: Record<string, string> = {
  clothing: BACKEND_CATEGORY_UUIDS.CLOTHING,
  footwear: BACKEND_CATEGORY_UUIDS.FOOTWEAR,
  accessories: BACKEND_CATEGORY_UUIDS.ACCESSORIES,
  electronics: BACKEND_CATEGORY_UUIDS.ELECTRONICS,
};

/**
 * Mapping table from backend canonical UUID to frontend slug
 */
export const BACKEND_UUID_TO_CATEGORY_SLUG: Record<string, string> = {
  [BACKEND_CATEGORY_UUIDS.CLOTHING]: FRONTEND_CATEGORY_SLUGS.CLOTHING,
  [BACKEND_CATEGORY_UUIDS.FOOTWEAR]: FRONTEND_CATEGORY_SLUGS.FOOTWEAR,
  [BACKEND_CATEGORY_UUIDS.ACCESSORIES]: FRONTEND_CATEGORY_SLUGS.ACCESSORIES,
  [BACKEND_CATEGORY_UUIDS.ELECTRONICS]: FRONTEND_CATEGORY_SLUGS.ELECTRONICS,
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidCategoryUuid = (val?: string): boolean => {
  if (!val) return false;
  return UUID_REGEX.test(val.trim());
};

/**
 * Editorial Homepage Capsules & Subcategory Filters
 * These represent frontend aesthetic groupings, NOT PostgreSQL category entities.
 */
export interface CapsuleDefinition {
  name: string;
  subcategories: string[];
  keywords?: string[];
}

export const EDITORIAL_CAPSULES: Record<string, CapsuleDefinition> = {
  'outerwear': {
    name: 'Haute Outerwear & Trench',
    subcategories: ['Outerwear'],
    keywords: ['coat', 'jacket', 'trench', 'cashmere', 'outerwear']
  },
  'evening-wear': {
    name: 'Evening Gowns & Draped Silks',
    subcategories: ['Haute Couture', 'Couture Pret', 'Bridal Lehengas', 'Sarees'],
    keywords: ['evening', 'gown', 'silk', 'draped', 'couture', 'tweed']
  },
  'heritage-sartorial': {
    name: 'Heritage Sherwanis & Bandhgalas',
    subcategories: ['Sherwanis & Bandhgalas'],
    keywords: ['sherwani', 'bandhgala', 'kurta', 'sartorial', 'jacquard']
  },
  'sarees-handloom': {
    name: 'Artisanal Handloom Sarees',
    subcategories: ['Sarees'],
    keywords: ['saree', 'handloom', 'chanderi', 'silk', 'pichhwai', 'zari']
  },
  'suiting': {
    name: 'Sartorial Suiting & Blazers',
    subcategories: ['Sartorial Suiting', 'Tailoring & Suiting'],
    keywords: ['suit', 'tuxedo', 'blazer', 'smoking', 'tailored']
  },
  'contemporary-pret': {
    name: 'Quiet Luxury Casualwear',
    subcategories: ['Heritage Festive', 'Couture Pret'],
    keywords: ['kurta', 'festive', 'anarkali', 'pret', 'brocade']
  }
};

export const isCapsuleSlug = (slug?: string): boolean => {
  if (!slug) return false;
  return Boolean(EDITORIAL_CAPSULES[slug.trim().toLowerCase()]);
};

export const getCapsuleDefinition = (slug?: string): CapsuleDefinition | undefined => {
  if (!slug) return undefined;
  return EDITORIAL_CAPSULES[slug.trim().toLowerCase()];
};

/**
 * Safely extracts subcategory string from a Product,
 * checking `(p as any).subcategory`, `p.attributes.subcategory`, or falling back to `p.categoryName`.
 */
export const getProductSubcategory = (p: Product): string => {
  if ((p as any).subcategory && typeof (p as any).subcategory === 'string') {
    return (p as any).subcategory.trim();
  }
  if (p.attributes) {
    try {
      const parsed = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
      if (parsed && typeof parsed === 'object' && parsed.subcategory) {
        return String(parsed.subcategory).trim();
      }
    } catch {
      // safely ignore malformed JSON
    }
  }
  if (p.categoryName && typeof p.categoryName === 'string') {
    const trimmed = p.categoryName.trim();
    // If categoryName is not the top-level entity name, it represents the subcategory
    if (!['clothing', 'footwear', 'accessories', 'electronics'].includes(trimmed.toLowerCase())) {
      return trimmed;
    }
  }
  return '';
};

/**
 * Serializes a category identifier (slug or UUID) to a canonical backend UUID.
 * Narrowly scoped strictly to the API request boundary.
 * 
 * Safety Rule:
 * - Only true backend category slugs ('clothing', 'footwear', 'accessories', 'electronics')
 *   or existing valid UUIDs are returned.
 * - Capsule slugs (e.g. 'outerwear', 'evening-wear') or arbitrary non-UUID strings
 *   return undefined to protect Spring Boot's @RequestParam UUID categoryId.
 */
export const serializeCategoryParamToBackendUuid = (param?: string): string | undefined => {
  if (!param) return undefined;
  const clean = param.trim().toLowerCase();
  if (CATEGORY_SLUG_TO_BACKEND_UUID[clean]) {
    return CATEGORY_SLUG_TO_BACKEND_UUID[clean];
  }
  if (isValidCategoryUuid(clean)) {
    return clean;
  }
  return undefined;
};

/**
 * Normalizes a category identifier (UUID or slug) to a frontend discovery slug.
 */
export const normalizeCategoryToSlug = (identifier?: string): string | undefined => {
  if (!identifier) return undefined;
  const clean = identifier.trim().toLowerCase();
  return BACKEND_UUID_TO_CATEGORY_SLUG[clean] || clean;
};

/**
 * Verifies category equality across slug and UUID formats.
 */
export const isCategoryMatch = (a?: string, b?: string): boolean => {
  if (!a || !b) return false;
  const cleanA = a.trim().toLowerCase();
  const cleanB = b.trim().toLowerCase();
  if (cleanA === cleanB) return true;
  const uuidA = CATEGORY_SLUG_TO_BACKEND_UUID[cleanA] || (isValidCategoryUuid(cleanA) ? cleanA : undefined);
  const uuidB = CATEGORY_SLUG_TO_BACKEND_UUID[cleanB] || (isValidCategoryUuid(cleanB) ? cleanB : undefined);
  if (uuidA && uuidB) {
    return uuidA === uuidB;
  }
  return false;
};
