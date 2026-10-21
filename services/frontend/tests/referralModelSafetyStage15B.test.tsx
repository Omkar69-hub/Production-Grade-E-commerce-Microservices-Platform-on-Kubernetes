import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import authReducer from '../src/store/slices/authSlice';
import cartReducer, { addToCart } from '../src/store/slices/cartSlice';
import { ComparisonProvider } from '../src/context/ComparisonContext';
import ProductCard, { evaluateProductCardState } from '../src/components/product/ProductCard';
import ProductDetailPage, { resolveProductActionState } from '../src/pages/product/ProductDetailPage';
import type { Product } from '../src/types/product';
import { CLOTHING_CATALOG, toCatalogProduct } from '../src/data/clothingCatalogData';
import { verifyBrandDomain } from '../src/utils/domainVerifier';
import { env } from '../src/config/env';

// Mock product hooks for backend product scenarios
vi.mock('../src/hooks/useProducts', () => ({
  useProductDetails: vi.fn(() => ({ data: undefined, isLoading: false, isError: false })),
  useProducts: vi.fn(() => ({ data: { content: [] } })),
}));

import { useProductDetails } from '../src/hooks/useProducts';

describe('LUMIÈRE Stage 15B-1 — Referral-Model Safety & Editorial Discovery Regression Suite', () => {
  let store: ReturnType<typeof configureStore>;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    store = configureStore({
      reducer: combineReducers({
        auth: authReducer,
        cart: cartReducer,
      }),
      preloadedState: {
        cart: {
          cartId: 'test-cart-stage-15b',
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

  const renderProductDetail = (initialPath: string) => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ComparisonProvider>
            <MemoryRouter initialEntries={[initialPath]}>
              <Routes>
                <Route path="/products/:id" element={<ProductDetailPage />} />
              </Routes>
            </MemoryRouter>
          </ComparisonProvider>
        </QueryClientProvider>
      </Provider>
    );
  };

  // =========================================================================
  // 1. PRODUCT DOMAIN ACTION RESOLUTION MATRIX
  // =========================================================================
  describe('1. resolveProductActionState Mutually Exclusive Matrix', () => {

    it('Matrix 1: Verified external referral metadata resolves VALID_REFERRAL', () => {
      const check = verifyBrandDomain('https://www.sabyasachi.com/collection/heritage-bridal/', 'sabyasachi');
      const state = resolveProductActionState({
        isCuratedCatalog: true,
        destinationUrl: 'https://www.sabyasachi.com/collection/heritage-bridal/',
        brandSlug: 'sabyasachi',
        destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
        priceVerificationStatus: 'PRICE_UPON_INQUIRY',
        hasReferralMetadata: true,
        verifiedDestinationCheck: check,
        enableInternalCheckout: false,
      });
      expect(state).toBe('VALID_REFERRAL');
    });

    it('Matrix 2: Untrusted external referral metadata resolves UNTRUSTED_REFERRAL', () => {
      const check = verifyBrandDomain('https://sabyasachi.com.attacker.test/phishing', 'sabyasachi');
      const state = resolveProductActionState({
        isCuratedCatalog: true,
        destinationUrl: 'https://sabyasachi.com.attacker.test/phishing',
        brandSlug: 'sabyasachi',
        hasReferralMetadata: true,
        verifiedDestinationCheck: check,
        enableInternalCheckout: false,
      });
      expect(state).toBe('UNTRUSTED_REFERRAL');
    });

    it('Matrix 3: Static catalogue data with missing referral destination fails closed to ATELIER_INQUIRY', () => {
      const state = resolveProductActionState({
        isCuratedCatalog: true,
        destinationUrl: undefined,
        brandSlug: 'manish-malhotra',
        hasReferralMetadata: true,
        enableInternalCheckout: false,
      });
      expect(state).toBe('ATELIER_INQUIRY');
    });

    it('Matrix 4: Database-backed product with missing referral metadata fails closed to ATELIER_INQUIRY when checkout is disabled', () => {
      const state = resolveProductActionState({
        isCuratedCatalog: false,
        destinationUrl: undefined,
        brandSlug: undefined,
        destinationType: undefined,
        priceVerificationStatus: undefined,
        hasReferralMetadata: false,
        enableInternalCheckout: false,
      });
      expect(state).toBe('ATELIER_INQUIRY');
    });

    it('Matrix 5: Database-backed product resolves INTERNAL_PURCHASE ONLY in explicitly authorized checkout configuration', () => {
      const state = resolveProductActionState({
        isCuratedCatalog: false,
        destinationUrl: undefined,
        brandSlug: undefined,
        destinationType: undefined,
        priceVerificationStatus: undefined,
        hasReferralMetadata: false,
        enableInternalCheckout: true,
      });
      expect(state).toBe('INTERNAL_PURCHASE');
    });
  });

  // =========================================================================
  // 2. PRODUCT CARD EVALUATION & FAIL-CLOSED LOGIC
  // =========================================================================
  describe('2. evaluateProductCardState Across All Product Sources', () => {

    it('evaluates static catalogue entry to View Dossier', () => {
      const staticItem = toCatalogProduct(CLOTHING_CATALOG[0]);
      const cardState = evaluateProductCardState(staticItem, false);

      expect(cardState.isInquiryOrReferral).toBe(true);
      expect(cardState.ctaText).toBe('View Dossier');
    });

    it('evaluates database-backed product with missing referral metadata to View Dossier when checkout disabled', () => {
      const dbProduct: Product = {
        id: 'db-product-001',
        sku: 'DB-RAW-SILK-001',
        name: 'Database Silk Garment',
        description: 'Physical warehouse item in database',
        price: 95000,
        currency: 'INR',
        brand: 'LUMIÈRE Maison',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: JSON.stringify({ fabric: 'Mulberry Silk' }),
      };

      const cardState = evaluateProductCardState(dbProduct, false);
      expect(cardState.isInquiryOrReferral).toBe(true);
      expect(cardState.ctaText).toBe('View Dossier');
      expect(cardState.subLabelText).toBe('Atelier Consultation');
    });

    it('evaluates database-backed product to Acquire only when checkout is explicitly enabled', () => {
      const dbProduct: Product = {
        id: 'db-product-001',
        sku: 'DB-RAW-SILK-001',
        name: 'Database Silk Garment',
        description: 'Physical warehouse item in database',
        price: 95000,
        currency: 'INR',
        brand: 'LUMIÈRE Maison',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: JSON.stringify({ fabric: 'Mulberry Silk' }),
      };

      const cardState = evaluateProductCardState(dbProduct, true);
      expect(cardState.isInquiryOrReferral).toBe(false);
      expect(cardState.ctaText).toBe('Acquire');
      expect(cardState.subLabelText).toBeNull();
    });

    it('evaluates unverified referral destination to Unverified Referral', () => {
      const deceptiveProduct: Product = {
        id: 'prod-deceptive-01',
        name: 'Deceptive Couture Piece',
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

      const cardState = evaluateProductCardState(deceptiveProduct, false);
      expect(cardState.isInquiryOrReferral).toBe(true);
      expect(cardState.isUntrustedDestination).toBe(true);
      expect(cardState.subLabelText).toBe('Unverified Referral');
      expect(cardState.ctaText).toBe('View Dossier');
    });
  });

  // =========================================================================
  // 3. UI RENDERING: ZERO PURCHASE CONTROLS WHEN CHECKOUT DISABLED
  // =========================================================================
  describe('3. UI Rendering & Absence of Internal Purchase Controls', () => {

    it('renders View Dossier and never Acquire button on ProductCard for database product when checkout disabled', () => {
      const dbProduct: Product = {
        id: 'db-product-zero-controls',
        sku: 'DB-NO-PURCHASE-01',
        name: 'Atelier Velvet Bandhgala',
        description: 'Handcrafted bandhgala',
        price: 120000,
        currency: 'INR',
        brand: 'LUMIÈRE Maison',
        categoryId: 'clothing',
        status: 'ACTIVE',
        attributes: '{}',
      };

      renderProductCard(dbProduct);

      // Must render View Dossier link
      expect(screen.getByRole('link', { name: /view dossier/i })).toBeInTheDocument();
      // Must NOT render Acquire button
      expect(screen.queryByRole('button', { name: /acquire/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/acquire piece/i)).not.toBeInTheDocument();
    });

    it('renders Atelier Consultation and ZERO quantity/purchase controls on ProductDetailPage for database product when checkout disabled', () => {
      (useProductDetails as any).mockReturnValue({
        data: {
          id: 'db-product-detail-safety',
          sku: 'DB-SAFETY-01',
          name: 'Hand-Woven Pashmina Shawl',
          description: 'Pure Pashmina creation from Kashmir atelier',
          price: 85000,
          currency: 'INR',
          brand: 'LUMIÈRE Atelier',
          categoryName: 'Accessories',
          status: 'ACTIVE',
          attributes: '{}', // zero referral metadata
        },
        isLoading: false,
        isError: false,
      });

      renderProductDetail('/products/db-product-detail-safety');

      // 1. Must render Atelier Consultation section and button
      expect(screen.getByTestId('atelier-inquiry-section')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /atelier consultation/i })).toBeInTheDocument();
      expect(screen.getByText(/LUMIÈRE ATELIER DISCOVERY PROTOCOL/i)).toBeInTheDocument();

      // 2. Must NEVER render internal purchase UI
      expect(screen.queryByTestId('internal-purchase-section')).not.toBeInTheDocument();
      expect(screen.queryByText(/quantity:/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /acquire piece/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '+' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '-' })).not.toBeInTheDocument();
    });

    it('renders official brand flagship portal button for verified static catalogue piece', () => {
      // First static catalog item is Sabyasachi Heritage Bridal Velvet Lehenga
      renderProductDetail('/products/prod-ind-01');

      // Must render official external portal link
      expect(screen.getByTestId('referral-action-section')).toBeInTheDocument();
      const referralLink = screen.getByRole('link', { name: /acquire via official sabyasachi portal/i });
      expect(referralLink).toBeInTheDocument();
      expect(referralLink).toHaveAttribute('target', '_blank');
      expect(referralLink).toHaveAttribute('rel', 'noopener noreferrer');

      // Must NEVER render internal purchase UI
      expect(screen.queryByTestId('internal-purchase-section')).not.toBeInTheDocument();
      expect(screen.queryByText(/quantity:/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /acquire piece/i })).not.toBeInTheDocument();
    });

    it('renders internal purchase controls ONLY when ENABLE_INTERNAL_CHECKOUT is explicitly authorized', () => {
      const origCheckout = env.ENABLE_INTERNAL_CHECKOUT;
      (env as any).ENABLE_INTERNAL_CHECKOUT = true;
      try {
        (useProductDetails as any).mockReturnValue({
          data: {
            id: 'db-product-detail-authorized',
            sku: 'DB-AUTH-01',
            name: 'Authorized Physical Inventory Piece',
            description: 'Warehouse stock in test mode',
            price: 50000,
            currency: 'INR',
            brand: 'LUMIÈRE Maison',
            categoryName: 'Accessories',
            status: 'ACTIVE',
            attributes: '{}',
          },
          isLoading: false,
          isError: false,
        });

        renderProductDetail('/products/db-product-detail-authorized');

        // Internal shopping bag controls MUST appear in authorized configuration
        expect(screen.getByTestId('internal-purchase-section')).toBeInTheDocument();
        expect(screen.getByText(/quantity:/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /acquire piece/i })).toBeInTheDocument();
      } finally {
        (env as any).ENABLE_INTERNAL_CHECKOUT = origCheckout;
      }
    });
  });

  // =========================================================================
  // 4. PRICE INTEGRITY & CURRENCY
  // =========================================================================
  describe('4. Price Integrity & Currency (INR)', () => {

    it('displays unpriced item as Price Upon Inquiry and does not fabricate numbers or show ₹0', () => {
      (useProductDetails as any).mockReturnValue({
        data: {
          id: 'unpriced-piece-01',
          sku: 'RAW-ARCHIVE-01',
          name: 'Archival Raw Mango Sari',
          description: 'Historical archive item',
          price: 0,
          currency: 'INR',
          brand: 'Raw Mango',
          categoryName: 'Saris',
          status: 'ACTIVE',
          attributes: JSON.stringify({ priceVerificationStatus: 'PRICE_UPON_INQUIRY' }),
        },
        isLoading: false,
        isError: false,
      });

      renderProductDetail('/products/unpriced-piece-01');

      expect(screen.getByText('Price Upon Inquiry')).toBeInTheDocument();
      expect(screen.queryByText('₹0.00')).not.toBeInTheDocument();
      expect(screen.queryByText('₹0')).not.toBeInTheDocument();
    });

    it('formats verified positive price in INR with symbol', () => {
      (useProductDetails as any).mockReturnValue({
        data: {
          id: 'priced-piece-01',
          sku: 'PRICED-01',
          name: 'Tarun Tahiliani Draped Concept Gown',
          price: 275000,
          currency: 'INR',
          brand: 'Tarun Tahiliani',
          categoryName: 'Couture',
          status: 'ACTIVE',
          attributes: JSON.stringify({
            brandSlug: 'tarun-tahiliani',
            destinationUrl: 'https://www.taruntahiliani.com/couture',
            priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
          }),
        },
        isLoading: false,
        isError: false,
      });

      renderProductDetail('/products/priced-piece-01');

      // ₹2,75,000 in Indian numbering format
      expect(screen.getByText(/2,75,000/)).toBeInTheDocument();
    });
  });
});
