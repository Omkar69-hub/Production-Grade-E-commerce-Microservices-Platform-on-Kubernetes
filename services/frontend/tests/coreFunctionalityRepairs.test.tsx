import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../src/store/slices/authSlice';
import cartReducer from '../src/store/slices/cartSlice';
import CartPage from '../src/pages/cart/CartPage';
import CheckoutPage from '../src/pages/checkout/CheckoutPage';
import OrderSuccessPage from '../src/pages/checkout/OrderSuccessPage';
import { 
  BACKEND_CATEGORY_UUIDS, 
  serializeCategoryParamToBackendUuid, 
  getProductSubcategory, 
  getCapsuleDefinition, 
  EDITORIAL_CAPSULES,
  isValidCategoryUuid
} from '../src/utils/categoryMapping';
import { CLOTHING_CATALOG, toCatalogProduct } from '../src/data/clothingCatalogData';
import { ProductService } from '../src/services/ProductService';
import apiClient from '../src/config/axios';
import type { Product } from '../src/types/product';

// Mock axios
vi.mock('../src/config/axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: { id: 'test-cart', items: [], content: [] } } })),
    post: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

describe('LUMIÈRE Stage 7B.1: Core Functionality Repairs & Regression Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: combineReducers({
        auth: authReducer,
        cart: cartReducer,
      }),
      preloadedState: {
        auth: {
          token: 'test-token',
          user: { id: 'u-1', email: 'client@lumiere.fashion', firstName: 'Aria', lastName: 'Vance', roles: ['USER'] },
          isAuthenticated: true,
          loading: false,
          error: null,
        },
        cart: {
          cartId: 'test-cart-session',
          cart: null, // empty bag
          loading: false,
          error: null,
        },
      },
    });
  });

  // =========================================================================
  // FIX 1: SUBCATEGORY EXTRACTION & FILTERING REPAIR
  // =========================================================================
  describe('Fix 1: Subcategory Extraction & Filtering', () => {
    it('accurately extracts subcategory from all 14 curated catalog products', () => {
      for (const item of CLOTHING_CATALOG) {
        const prod = toCatalogProduct(item);
        const subcat = getProductSubcategory(prod);
        expect(subcat).toBe(item.subcategory);
        expect(subcat.length).toBeGreaterThan(0);
      }
    });

    it('safely extracts subcategory from backend API products with attributes JSON', () => {
      const apiProd: Product = {
        id: 'api-prod-99',
        sku: 'TEST-SKU',
        name: 'Test Banarasi Saree',
        description: 'Authentic handwoven piece',
        price: 85000,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        categoryName: 'Clothing', // Notice: Top-level category name from backend
        status: 'ACTIVE',
        attributes: JSON.stringify({
          subcategory: 'Sarees',
          fabric: 'Katan Silk',
        }),
      };

      const extracted = getProductSubcategory(apiProd);
      expect(extracted).toBe('Sarees');
    });

    it('handles products with direct subcategory property', () => {
      const prod = {
        id: 'prod-direct',
        sku: 'DIR-1',
        name: 'Direct Subcategory Item',
        description: '',
        price: 1000,
        currency: 'INR',
        categoryId: 'clothing',
        subcategory: 'Bridal Lehengas',
        status: 'ACTIVE' as const,
      } as Product;

      expect(getProductSubcategory(prod)).toBe('Bridal Lehengas');
    });

    it('handles absent, null, and malformed attributes safely without crashing', () => {
      const emptyAttrProd: Product = {
        id: 'p-empty',
        sku: 'P-EMPTY',
        name: 'No Attributes',
        description: '',
        price: 0,
        currency: 'INR',
        categoryId: 'clothing',
        categoryName: 'Clothing',
        status: 'ACTIVE',
      };
      expect(getProductSubcategory(emptyAttrProd)).toBe('');

      const malformedAttrProd: Product = {
        ...emptyAttrProd,
        attributes: 'INVALID_JSON_STRING{{{',
      };
      expect(getProductSubcategory(malformedAttrProd)).toBe('');

      const specificCatNameProd: Product = {
        ...emptyAttrProd,
        categoryName: 'Sherwanis & Bandhgalas',
      };
      expect(getProductSubcategory(specificCatNameProd)).toBe('Sherwanis & Bandhgalas');
    });

    it('supports subcategory filtering across all supported silhouettes in CLOTHING_CATALOG', () => {
      const catalogProducts = CLOTHING_CATALOG.map(toCatalogProduct);

      // Verify filtering for Sarees
      const sareeQuery = 'Sarees'.toLowerCase();
      const sarees = catalogProducts.filter((p) => {
        const sub = getProductSubcategory(p).toLowerCase();
        return sub === sareeQuery || sub.includes(sareeQuery);
      });
      expect(sarees.length).toBe(2); // Anita Dongre, Manish Malhotra

      // Verify filtering for Outerwear
      const outerwear = catalogProducts.filter((p) => {
        const sub = getProductSubcategory(p).toLowerCase();
        return sub === 'outerwear' || sub.includes('outerwear');
      });
      expect(outerwear.length).toBe(1); // The Row Cashmere Coat
      expect(outerwear[0].brand).toBe('The Row');

      // Verify filtering for Sherwanis & Bandhgalas
      const sherwanis = catalogProducts.filter((p) => {
        const sub = getProductSubcategory(p).toLowerCase();
        return sub.includes('sherwani') || sub.includes('bandhgala');
      });
      expect(sherwanis.length).toBe(2); // Manyavar, Shantnu & Nikhil
    });
  });

  // =========================================================================
  // FIX 2: HOMEPAGE CAPSULE ROUTING & STRICT API BOUNDARY SERIALIZATION
  // =========================================================================
  describe('Fix 2: Homepage Category Capsules & Strict API Boundary', () => {
    const supportedCapsules = [
      'outerwear',
      'evening-wear',
      'heritage-sartorial',
      'sarees-handloom',
      'suiting',
      'contemporary-pret',
    ];

    it('defines all 6 editorial homepage capsules in EDITORIAL_CAPSULES', () => {
      for (const slug of supportedCapsules) {
        expect(EDITORIAL_CAPSULES[slug]).toBeDefined();
        const def = getCapsuleDefinition(slug);
        expect(def).toBeDefined();
        expect(def?.name).toBeTruthy();
        expect(def?.subcategories.length).toBeGreaterThan(0);
      }
    });

    it('strictly serializes only valid UUIDs and rejects capsule slugs from categoryId parameter', () => {
      // True backend category slugs return valid UUIDs
      expect(serializeCategoryParamToBackendUuid('clothing')).toBe(BACKEND_CATEGORY_UUIDS.CLOTHING);
      expect(serializeCategoryParamToBackendUuid('footwear')).toBe(BACKEND_CATEGORY_UUIDS.FOOTWEAR);
      expect(serializeCategoryParamToBackendUuid('accessories')).toBe(BACKEND_CATEGORY_UUIDS.ACCESSORIES);
      expect(serializeCategoryParamToBackendUuid('electronics')).toBe(BACKEND_CATEGORY_UUIDS.ELECTRONICS);

      // Raw valid UUID passes through
      expect(serializeCategoryParamToBackendUuid(BACKEND_CATEGORY_UUIDS.CLOTHING)).toBe(BACKEND_CATEGORY_UUIDS.CLOTHING);
      expect(isValidCategoryUuid(BACKEND_CATEGORY_UUIDS.CLOTHING)).toBe(true);

      // Capsule slugs MUST return undefined so they are never passed as UUID to Spring Boot
      for (const slug of supportedCapsules) {
        expect(serializeCategoryParamToBackendUuid(slug)).toBeUndefined();
        expect(isValidCategoryUuid(slug)).toBe(false);
      }

      // Empty or invalid strings return undefined
      expect(serializeCategoryParamToBackendUuid('')).toBeUndefined();
      expect(serializeCategoryParamToBackendUuid('not-a-uuid')).toBeUndefined();
      expect(serializeCategoryParamToBackendUuid(undefined)).toBeUndefined();
    });

    it('ProductService.getProducts deletes categoryId when a capsule slug is passed', async () => {
      // When a capsule slug is provided, ProductService strips it so backend receives no invalid UUID
      await ProductService.getProducts({ page: 0, size: 20, categoryId: 'outerwear' });
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/products', {
        params: expect.not.objectContaining({ categoryId: 'outerwear' }),
      });

      // When a true category slug is provided, ProductService serializes it to the valid UUID
      await ProductService.getProducts({ page: 0, size: 20, categoryId: 'clothing' });
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/products', {
        params: expect.objectContaining({ categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING }),
      });
    });

    it('each supported capsule returns relevant products when matching catalog items', () => {
      const catalogProducts = CLOTHING_CATALOG.map(toCatalogProduct);

      for (const slug of supportedCapsules) {
        const capsule = getCapsuleDefinition(slug)!;
        const matched = catalogProducts.filter((p) => {
          const itemSub = getProductSubcategory(p).toLowerCase();
          const matchesSub = capsule.subcategories.some(
            (sub) => itemSub === sub.toLowerCase() || itemSub.includes(sub.toLowerCase())
          );
          if (matchesSub) return true;

          if (capsule.keywords && capsule.keywords.length > 0) {
            const text = `${p.name} ${p.description || ''} ${p.categoryName || ''} ${itemSub}`.toLowerCase();
            return capsule.keywords.some((kw) => text.includes(kw));
          }
          return false;
        });

        // Every capsule must return at least 1 relevant piece
        expect(matched.length).toBeGreaterThan(0);
      }
    });
  });

  // =========================================================================
  // FIX 3: CUSTOMER NAVIGATION DESTINATIONS
  // =========================================================================
  describe('Fix 3: Customer Navigation Destinations', () => {
    it('CartPage empty bag CTA links to /products', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <CartPage />
          </MemoryRouter>
        </Provider>
      );

      const exploreBtn = await screen.findByRole('link', { name: /explore collections/i });
      expect(exploreBtn).toBeInTheDocument();
      expect(exploreBtn).toHaveAttribute('href', '/products');
    });

    it('CheckoutPage empty bag CTA links to /products', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <CheckoutPage />
          </MemoryRouter>
        </Provider>
      );

      const returnBtn = await screen.findByRole('link', { name: /return to collections/i });
      expect(returnBtn).toBeInTheDocument();
      expect(returnBtn).toHaveAttribute('href', '/products');
    });

    it('OrderSuccessPage "Continue Exploring" secondary CTA links to /products', () => {
      render(
        <MemoryRouter initialEntries={['/orders/success/ORD-77491']}>
          <Routes>
            <Route path="/orders/success/:id" element={<OrderSuccessPage />} />
          </Routes>
        </MemoryRouter>
      );

      const continueBtn = screen.getByRole('link', { name: /continue exploring/i });
      expect(continueBtn).toBeInTheDocument();
      expect(continueBtn).toHaveAttribute('href', '/products');
    });
  });
});
