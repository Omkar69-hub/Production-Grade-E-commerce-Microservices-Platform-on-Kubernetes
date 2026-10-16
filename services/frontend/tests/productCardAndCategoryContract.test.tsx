import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../src/store/slices/authSlice';
import cartReducer from '../src/store/slices/cartSlice';
import { ComparisonProvider } from '../src/context/ComparisonContext';
import ProductCard, { evaluateProductCardState } from '../src/components/product/ProductCard';
import type { Product } from '../src/types/product';
import { 
  BACKEND_CATEGORY_UUIDS, 
  FRONTEND_CATEGORY_SLUGS, 
  serializeCategoryParamToBackendUuid, 
  normalizeCategoryToSlug, 
  isCategoryMatch 
} from '../src/utils/categoryMapping';
import { CLOTHING_CATALOG, toCatalogProduct } from '../src/data/clothingCatalogData';
import { ProductService } from '../src/services/ProductService';
import apiClient from '../src/config/axios';

// Mock axios client for testing ProductService API serialization boundary
vi.mock('../src/config/axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: { content: [] } } })),
    post: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

describe('LUMIÈRE Stage 6I-E: Frontend Contract Corrections & Regression Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: combineReducers({
        auth: authReducer,
        cart: cartReducer,
      }),
      preloadedState: {
        cart: {
          cartId: 'test-cart-session-123',
          cart: null,
          loading: false,
          error: null,
        },
      },
    });
  });

  const renderProductCard = (product: Product) => {
    return render(
      <Provider store={store}>
        <ComparisonProvider>
          <MemoryRouter>
            <ProductCard product={product} />
          </MemoryRouter>
        </ComparisonProvider>
      </Provider>
    );
  };

  // =========================================================================
  // 1. PRODUCT CARD INQUIRY BEHAVIOR AUDIT
  // =========================================================================
  describe('1. ProductCard Inquiry & Fail-Closed Behavior', () => {

    it('Scenario 1: Inquiry item with a valid destination URL shows View Dossier and Atelier Consultation', () => {
      const product: Product = {
        id: 'prod-ind-01',
        sku: 'SAB-HB-01',
        name: 'Heritage Bridal Velvet Lehenga',
        description: 'Exquisite bridal creation',
        price: 0,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: 'clothing',
        categoryName: 'Bridal Couture',
        status: 'ACTIVE',
        attributes: JSON.stringify({
          brandSlug: 'sabyasachi',
          destinationUrl: 'https://www.sabyasachi.com/collection/heritage-bridal/',
          destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
          priceVerificationStatus: 'PRICE_UPON_INQUIRY',
          isReferral: true,
        }),
      };

      const evalState = evaluateProductCardState(product);
      expect(evalState.isInquiryOrReferral).toBe(true);
      expect(evalState.isPriceOnInquiry).toBe(true);
      expect(evalState.isTrustedDestination).toBe(true);
      expect(evalState.isUntrustedDestination).toBe(false);
      expect(evalState.subLabelText).toBe('Atelier Consultation');
      expect(evalState.ctaText).toBe('View Dossier');

      renderProductCard(product);
      expect(screen.getByText('Price on Inquiry')).toBeInTheDocument();
      expect(screen.getByText('Atelier Consultation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view dossier/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /acquire/i })).not.toBeInTheDocument();
    });

    it('Scenario 2: Inquiry item with a missing destination URL fails closed to View Dossier', () => {
      const product: Product = {
        id: '123e4567-e89b-12d3-a456-426614174099',
        sku: 'MAN-SR-01',
        name: 'Bespoke Zardozi Sherwani',
        description: 'Handcrafted zardozi creation',
        price: 0,
        currency: 'INR',
        brand: 'Manish Malhotra',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: JSON.stringify({
          brandSlug: 'manish-malhotra',
          priceVerificationStatus: 'PRICE_UPON_INQUIRY',
          // destinationUrl omitted
        }),
      };

      const evalState = evaluateProductCardState(product);
      expect(evalState.isInquiryOrReferral).toBe(true);
      expect(evalState.isPriceOnInquiry).toBe(true);
      expect(evalState.ctaText).toBe('View Dossier');
      expect(evalState.subLabelText).toBe('Atelier Consultation');

      renderProductCard(product);
      expect(screen.getByText('Price on Inquiry')).toBeInTheDocument();
      expect(screen.getByText('Atelier Consultation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view dossier/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /acquire/i })).not.toBeInTheDocument();
    });

    it('Scenario 3: Zero-price item with missing referral metadata fails closed to inquiry mode', () => {
      const product: Product = {
        id: '123e4567-e89b-12d3-a456-426614174098',
        sku: 'ZERO-PRICE-SKU',
        name: 'Unpriced Archival Garment',
        description: 'Archived piece without price metadata',
        price: 0,
        currency: 'INR',
        brand: 'Raw Mango',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: '{}', // zero referral metadata
      };

      const evalState = evaluateProductCardState(product);
      expect(evalState.isInquiryOrReferral).toBe(true);
      expect(evalState.isPriceOnInquiry).toBe(true);
      expect(evalState.ctaText).toBe('View Dossier');
      expect(evalState.subLabelText).toBe('Atelier Consultation');

      renderProductCard(product);
      expect(screen.getByText('Price on Inquiry')).toBeInTheDocument();
      expect(screen.getByText('Atelier Consultation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view dossier/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /acquire/i })).not.toBeInTheDocument();
    });

    it('Scenario 4: Referral item with incomplete or malformed metadata flags Unverified Referral', () => {
      const product: Product = {
        id: 'prod-ind-04',
        sku: 'TAR-MALFORMED-01',
        name: 'Concept Drape Gown',
        description: 'Ill-formed metadata test',
        price: 0,
        currency: 'INR',
        brand: 'Tarun Tahiliani',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: JSON.stringify({
          brandSlug: 'tarun-tahiliani',
          isReferral: true,
          destinationUrl: 'not-a-valid-url', // malformed URL
          destinationType: 'EXTERNAL_REFERRAL',
        }),
      };

      const evalState = evaluateProductCardState(product);
      expect(evalState.isInquiryOrReferral).toBe(true);
      expect(evalState.isUntrustedDestination).toBe(true);
      expect(evalState.subLabelText).toBe('Unverified Referral');
      expect(evalState.ctaText).toBe('View Dossier');

      renderProductCard(product);
      expect(screen.getByText('Unverified Referral')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view dossier/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /acquire/i })).not.toBeInTheDocument();
    });

    it('Scenario 5: Untrusted or mismatched external destination flags Unverified Referral and blocks internal acquire', () => {
      // 5a. Deceptive hostname mimicking brand
      const deceptiveProduct: Product = {
        id: 'prod-ind-05',
        sku: 'DECEPTIVE-01',
        name: 'Suspicious Couture Gown',
        description: 'Deceptive phishing destination',
        price: 0,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: JSON.stringify({
          brandSlug: 'sabyasachi',
          destinationUrl: 'https://sabyasachi.com.attacker.test/phishing',
          isReferral: true,
        }),
      };

      const evalDeceptive = evaluateProductCardState(deceptiveProduct);
      expect(evalDeceptive.isInquiryOrReferral).toBe(true);
      expect(evalDeceptive.isTrustedDestination).toBe(false);
      expect(evalDeceptive.isUntrustedDestination).toBe(true);
      expect(evalDeceptive.subLabelText).toBe('Unverified Referral');
      expect(evalDeceptive.ctaText).toBe('View Dossier');

      // 5b. Insecure HTTP protocol
      const httpProduct: Product = {
        id: 'prod-ind-06',
        sku: 'INSECURE-HTTP-01',
        name: 'Insecure Protocol Piece',
        description: 'Insecure URL',
        price: 0,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: JSON.stringify({
          brandSlug: 'sabyasachi',
          destinationUrl: 'http://www.sabyasachi.com/bridal',
          isReferral: true,
        }),
      };

      const evalHttp = evaluateProductCardState(httpProduct);
      expect(evalHttp.isUntrustedDestination).toBe(true);
      expect(evalHttp.subLabelText).toBe('Unverified Referral');
      expect(evalHttp.ctaText).toBe('View Dossier');

      // 5c. Cross-brand destination mismatch (Sabyasachi product -> Anita Dongre domain)
      const crossBrandProduct: Product = {
        id: 'prod-ind-07',
        sku: 'CROSS-BRAND-01',
        name: 'Mismatched Brand Piece',
        description: 'Cross-brand mismatch',
        price: 0,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: JSON.stringify({
          brandSlug: 'sabyasachi',
          destinationUrl: 'https://www.anitadongre.com/women',
          isReferral: true,
        }),
      };

      const evalCrossBrand = evaluateProductCardState(crossBrandProduct);
      expect(evalCrossBrand.isUntrustedDestination).toBe(true);
      expect(evalCrossBrand.subLabelText).toBe('Unverified Referral');
      expect(evalCrossBrand.ctaText).toBe('View Dossier');
    });

    it('Scenario 6: Verified internal product with a positive price preserves normal purchasing behavior', async () => {
      const internalProduct: Product = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        sku: 'INT-SILK-001',
        name: 'LUMIÈRE Pure Raw Silk Shawl',
        description: 'Internal warehouse catalog product with physical fulfillment',
        price: 150000,
        currency: 'INR',
        brand: 'LUMIÈRE Maison',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: JSON.stringify({
          fabric: 'Raw Silk',
          fulfillmentType: 'INTERNAL_WAREHOUSE',
        }),
      };

      const evalInternal = evaluateProductCardState(internalProduct);
      expect(evalInternal.isInquiryOrReferral).toBe(false);
      expect(evalInternal.isPriceOnInquiry).toBe(false);
      expect(evalInternal.ctaText).toBe('Acquire');
      expect(evalInternal.subLabelText).toBeNull();

      renderProductCard(internalProduct);
      expect(screen.getByText(/1,50,000/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /acquire/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /view dossier/i })).not.toBeInTheDocument();

      // Trigger add to cart
      const acquireBtn = screen.getByRole('button', { name: /acquire/i });
      await act(async () => {
        fireEvent.click(acquireBtn);
      });
      // Verify no throw and button was interactable
      expect(acquireBtn).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. CATEGORY ID MAPPING & API BOUNDARY SERIALIZATION
  // =========================================================================
  describe('2. Category ID & Slug Mapping Contract', () => {

    it('Scenario 7: Frontend clothing slug maps to canonical backend UUID only at API boundary', async () => {
      // Direct boundary serialization function
      expect(serializeCategoryParamToBackendUuid('clothing')).toBe(BACKEND_CATEGORY_UUIDS.CLOTHING);
      expect(serializeCategoryParamToBackendUuid('footwear')).toBe(BACKEND_CATEGORY_UUIDS.FOOTWEAR);
      expect(serializeCategoryParamToBackendUuid('accessories')).toBe(BACKEND_CATEGORY_UUIDS.ACCESSORIES);
      expect(serializeCategoryParamToBackendUuid('electronics')).toBe(BACKEND_CATEGORY_UUIDS.ELECTRONICS);

      // Pass-through of already-valid UUIDs
      expect(serializeCategoryParamToBackendUuid(BACKEND_CATEGORY_UUIDS.CLOTHING)).toBe(BACKEND_CATEGORY_UUIDS.CLOTHING);
      expect(serializeCategoryParamToBackendUuid(undefined)).toBeUndefined();

      // API serialization via ProductService.getProducts
      await ProductService.getProducts({ page: 0, size: 10, categoryId: 'clothing' });
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/products', {
        params: expect.objectContaining({
          categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        }),
      });

      // API serialization via ProductService.createProduct
      await ProductService.createProduct({ name: 'Test Garment', categoryId: 'clothing' });
      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/products', expect.objectContaining({
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
      }));

      // API serialization via ProductService.updateProduct
      await ProductService.updateProduct('prod-1', { categoryId: 'clothing' });
      expect(apiClient.put).toHaveBeenCalledWith('/api/v1/products/prod-1', expect.objectContaining({
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
      }));

      // Frontend static catalog objects retain the clean 'clothing' slug
      for (const item of CLOTHING_CATALOG) {
        const catalogProd = toCatalogProduct(item);
        expect(catalogProd.categoryId).toBe('clothing');
      }
    });

    it('Scenario 8: Existing category filtering and catalog routes continue to work seamlessly', () => {
      // Bidirectional matching between slug and UUID
      expect(isCategoryMatch('clothing', 'clothing')).toBe(true);
      expect(isCategoryMatch('clothing', BACKEND_CATEGORY_UUIDS.CLOTHING)).toBe(true);
      expect(isCategoryMatch(BACKEND_CATEGORY_UUIDS.CLOTHING, 'clothing')).toBe(true);
      expect(isCategoryMatch(BACKEND_CATEGORY_UUIDS.CLOTHING, BACKEND_CATEGORY_UUIDS.CLOTHING)).toBe(true);

      // Negative matching across different categories
      expect(isCategoryMatch('clothing', 'footwear')).toBe(false);
      expect(isCategoryMatch('clothing', BACKEND_CATEGORY_UUIDS.FOOTWEAR)).toBe(false);
      expect(isCategoryMatch('clothing', BACKEND_CATEGORY_UUIDS.ELECTRONICS)).toBe(false);

      // Normalization from UUID to frontend slug for discovery
      expect(normalizeCategoryToSlug(BACKEND_CATEGORY_UUIDS.CLOTHING)).toBe(FRONTEND_CATEGORY_SLUGS.CLOTHING);
      expect(normalizeCategoryToSlug(BACKEND_CATEGORY_UUIDS.FOOTWEAR)).toBe(FRONTEND_CATEGORY_SLUGS.FOOTWEAR);
      expect(normalizeCategoryToSlug('clothing')).toBe('clothing');

      // Verify all 14 curated catalog items match filtering by 'clothing' and by canonical UUID
      const catalogProducts = CLOTHING_CATALOG.map(toCatalogProduct);
      expect(catalogProducts.length).toBe(14);

      const filteredBySlug = catalogProducts.filter((p) => isCategoryMatch(p.categoryId, 'clothing'));
      expect(filteredBySlug.length).toBe(14);

      const filteredByUuid = catalogProducts.filter((p) => isCategoryMatch(p.categoryId, BACKEND_CATEGORY_UUIDS.CLOTHING));
      expect(filteredByUuid.length).toBe(14);

      const filteredByMismatch = catalogProducts.filter((p) => isCategoryMatch(p.categoryId, BACKEND_CATEGORY_UUIDS.ELECTRONICS));
      expect(filteredByMismatch.length).toBe(0);
    });
  });
});
