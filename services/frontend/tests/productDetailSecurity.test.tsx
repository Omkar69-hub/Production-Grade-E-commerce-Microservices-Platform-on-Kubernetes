import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import authReducer from '../src/store/slices/authSlice';
import cartReducer from '../src/store/slices/cartSlice';
import { ComparisonProvider } from '../src/context/ComparisonContext';
import ProductDetailPage, { resolveProductActionState } from '../src/pages/product/ProductDetailPage';
import { verifyBrandDomain } from '../src/utils/domainVerifier';
import { env } from '../src/config/env';

// Mock product hooks for backend product scenarios
vi.mock('../src/hooks/useProducts', () => ({
  useProductDetails: vi.fn(() => ({ data: undefined, isLoading: false, isError: false })),
  useProducts: vi.fn(() => ({ data: { content: [] } })),
}));

import { useProductDetails } from '../src/hooks/useProducts';

describe('LUMIÈRE Stage 6D: Product Detail Referral Security & Action State', () => {

  // =========================================================================
  // 1. UNIT LOGIC: resolveProductActionState Mutually Exclusive Decisions
  // =========================================================================
  describe('1. resolveProductActionState Pure Security Logic', () => {
    it('should resolve VALID_REFERRAL for curated catalog product with verified domain', () => {
      const check = verifyBrandDomain('https://www.sabyasachi.com/collection/heritage-bridal/', 'sabyasachi');
      const state = resolveProductActionState({
        isCuratedCatalog: true,
        destinationUrl: 'https://www.sabyasachi.com/collection/heritage-bridal/',
        brandSlug: 'sabyasachi',
        destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
        priceVerificationStatus: 'PRICE_UPON_INQUIRY',
        hasReferralMetadata: true,
        verifiedDestinationCheck: check,
      });
      expect(state).toBe('VALID_REFERRAL');
    });

    it('should resolve UNTRUSTED_REFERRAL when destination has deceptive suffix (attacker.test)', () => {
      const check = verifyBrandDomain('https://sabyasachi.com.attacker.test/phishing', 'sabyasachi');
      const state = resolveProductActionState({
        isCuratedCatalog: false,
        destinationUrl: 'https://sabyasachi.com.attacker.test/phishing',
        brandSlug: 'sabyasachi',
        destinationType: 'EXACT_PRODUCT_PAGE',
        priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
        hasReferralMetadata: true,
        verifiedDestinationCheck: check,
      });
      expect(state).toBe('UNTRUSTED_REFERRAL');
    });

    it('should resolve UNTRUSTED_REFERRAL when destination uses insecure HTTP', () => {
      const check = verifyBrandDomain('http://www.sabyasachi.com/bridal', 'sabyasachi');
      const state = resolveProductActionState({
        isCuratedCatalog: false,
        destinationUrl: 'http://www.sabyasachi.com/bridal',
        brandSlug: 'sabyasachi',
        hasReferralMetadata: true,
        verifiedDestinationCheck: check,
      });
      expect(state).toBe('UNTRUSTED_REFERRAL');
    });

    it('should resolve UNTRUSTED_REFERRAL on cross-brand destination mismatch', () => {
      // Product belongs to Sabyasachi, but destination points to Anita Dongre
      const check = verifyBrandDomain('https://www.anitadongre.com/women', 'sabyasachi');
      const state = resolveProductActionState({
        isCuratedCatalog: false,
        destinationUrl: 'https://www.anitadongre.com/women',
        brandSlug: 'sabyasachi',
        hasReferralMetadata: true,
        verifiedDestinationCheck: check,
      });
      expect(state).toBe('UNTRUSTED_REFERRAL');
    });

    it('should resolve ATELIER_INQUIRY when referral metadata exists but destinationUrl is missing (fail-closed)', () => {
      const state = resolveProductActionState({
        isCuratedCatalog: true,
        destinationUrl: undefined,
        brandSlug: 'sabyasachi',
        hasReferralMetadata: true,
      });
      expect(state).toBe('ATELIER_INQUIRY');
    });

    it('should resolve INTERNAL_PURCHASE only when product has zero referral intent AND internal checkout is explicitly enabled', () => {
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

    it('should resolve ATELIER_INQUIRY for ordinary product when internal checkout is disabled (fail-closed)', () => {
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
  });

  // =========================================================================
  // 2. DOM RENDERING: Mutually Exclusive Action Sections in UI
  // =========================================================================
  describe('2. ProductDetailPage Rendering & Security Boundaries', () => {
    let queryClient: QueryClient;
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      vi.clearAllMocks();
      (useProductDetails as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
      queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      store = configureStore({
        reducer: combineReducers({
          auth: authReducer,
          cart: cartReducer,
        }),
      });
    });

    const renderWithProviders = (initialRoute: string) => {
      return render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <ComparisonProvider>
              <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                </Routes>
              </MemoryRouter>
            </ComparisonProvider>
          </QueryClientProvider>
        </Provider>
      );
    };

    it('should render external brand CTA with safe attributes for valid curated referral product', async () => {
      // Render curated Sabyasachi product
      renderWithProviders('/products/prod-ind-01');

      // 1. Official Referral CTA must be rendered
      const ctaButton = screen.getByRole('link', { name: /Acquire via Official Sabyasachi Portal/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('href', 'https://www.sabyasachi.com/collection/heritage-bridal/');
      expect(ctaButton).toHaveAttribute('target', '_blank');
      expect(ctaButton).toHaveAttribute('rel', 'noopener noreferrer');

      // 2. Inquiry label rendered, ₹0.00 NEVER displayed
      expect(screen.getByText('Price Upon Inquiry')).toBeInTheDocument();
      expect(screen.queryByText('₹0.00')).not.toBeInTheDocument();
      expect(screen.queryByText('₹0')).not.toBeInTheDocument();

      // 3. Internal Add-to-Bag / Shopping Bag flow must NOT be rendered
      expect(screen.queryByText('Acquire Piece')).not.toBeInTheDocument();
      expect(screen.queryByText('Quantity:')).not.toBeInTheDocument();
    });

    it('should render Untrusted Destination Warning and block acquisition for deceptive backend destination', async () => {
      // Mock backend product with deceptive attacker URL
      (useProductDetails as any).mockReturnValue({
        data: {
          id: 'backend-prod-deceptive',
          name: 'Phishing Haute Gown',
          price: 50000,
          brand: 'Sabyasachi',
          attributes: JSON.stringify({
            destinationUrl: 'https://sabyasachi.com.attacker.test/phishing',
            brandSlug: 'sabyasachi',
            destinationType: 'EXACT_PRODUCT_PAGE',
            priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
          }),
          status: 'ACTIVE',
        },
        isLoading: false,
        isError: false,
      });

      renderWithProviders('/products/backend-prod-deceptive');

      // 1. Untrusted Destination Warning must be rendered
      expect(screen.getByText('UNTRUSTED DESTINATION WARNING')).toBeInTheDocument();

      // 2. Blocked / Disabled action button must be rendered
      const blockedBtn = screen.getByRole('button', { name: /Direct Acquisition Blocked/i });
      expect(blockedBtn).toBeInTheDocument();
      expect(blockedBtn).toBeDisabled();

      // 3. FAIL-CLOSED: Must NEVER fall back to internal Add-to-Bag
      expect(screen.queryByText('Acquire Piece')).not.toBeInTheDocument();
      expect(screen.queryByText('Quantity:')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Acquire via Official/i })).not.toBeInTheDocument();
    });

    it('should fail closed to Atelier Consultation when referral product has missing destinationUrl', async () => {
      // Mock backend product with priceVerificationStatus but missing destinationUrl
      (useProductDetails as any).mockReturnValue({
        data: {
          id: 'backend-prod-missing-url',
          name: 'Inquiry Gown Without URL',
          price: 0,
          brand: 'Sabyasachi',
          attributes: JSON.stringify({
            brandSlug: 'sabyasachi',
            priceVerificationStatus: 'PRICE_UPON_INQUIRY',
          }),
          status: 'ACTIVE',
        },
        isLoading: false,
        isError: false,
      });

      renderWithProviders('/products/backend-prod-missing-url');

      // Safe atelier consultation must be rendered
      expect(screen.getByText('Atelier Consultation')).toBeInTheDocument();
      expect(screen.getByText(/LUMIÈRE ATELIER DISCOVERY PROTOCOL/i)).toBeInTheDocument();

      // Must NEVER allow adding a ₹0 product to the internal bag
      expect(screen.queryByText('Acquire Piece')).not.toBeInTheDocument();
      expect(screen.queryByText('Quantity:')).not.toBeInTheDocument();
      expect(screen.queryByText('₹0.00')).not.toBeInTheDocument();
    });

    it('should fail closed to Atelier Consultation for ordinary database product when internal checkout is disabled', async () => {
      // Mock ordinary in-house database product (e.g. legacy smartphone or in-house apparel)
      (useProductDetails as any).mockReturnValue({
        data: {
          id: 'ordinary-internal-item-001',
          name: 'Classic Atelier Silk Pocket Square',
          price: 2500,
          brand: 'LUMIÈRE Atelier',
          categoryName: 'Accessories',
          status: 'ACTIVE',
        },
        isLoading: false,
        isError: false,
      });

      renderWithProviders('/products/ordinary-internal-item-001');

      // 1. Safe atelier consultation action MUST be rendered (NO internal purchase UI)
      expect(screen.getByText('Atelier Consultation')).toBeInTheDocument();
      expect(screen.getByText(/LUMIÈRE ATELIER DISCOVERY PROTOCOL/i)).toBeInTheDocument();
      expect(screen.queryByText('Quantity:')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Acquire Piece/i })).not.toBeInTheDocument();

      // 2. No external referral CTA or warning alert
      expect(screen.queryByText(/Acquire via Official/i)).not.toBeInTheDocument();
      expect(screen.queryByText('UNTRUSTED DESTINATION WARNING')).not.toBeInTheDocument();
    });

    it('should render internal purchase flow for ordinary database product only when internal checkout is explicitly authorized', async () => {
      const origCheckout = env.ENABLE_INTERNAL_CHECKOUT;
      (env as any).ENABLE_INTERNAL_CHECKOUT = true;
      try {
        (useProductDetails as any).mockReturnValue({
          data: {
            id: 'ordinary-internal-item-001',
            name: 'Classic Atelier Silk Pocket Square',
            price: 2500,
            brand: 'LUMIÈRE Atelier',
            categoryName: 'Accessories',
            status: 'ACTIVE',
          },
          isLoading: false,
          isError: false,
        });

        renderWithProviders('/products/ordinary-internal-item-001');

        // Internal shopping bag controls MUST be rendered only in authorized mode
        expect(screen.getByText('Quantity:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Acquire Piece/i })).toBeInTheDocument();
        expect(screen.queryByText(/Acquire via Official/i)).not.toBeInTheDocument();
        expect(screen.queryByText('UNTRUSTED DESTINATION WARNING')).not.toBeInTheDocument();
      } finally {
        (env as any).ENABLE_INTERNAL_CHECKOUT = origCheckout;
      }
    });

    it('should resolve curated product via canonical UUID and render editorial concept disclosure without verified price label', async () => {
      // Sabyasachi canonical UUID from Stage 6I-B3
      renderWithProviders('/products/123e4567-e89b-12d3-a456-426614174011');

      // 1. Correct product resolved by UUID
      expect(screen.getByRole('heading', { level: 1, name: /Royal Heritage Zardozi Velvet Lehenga/i })).toBeInTheDocument();

      // 2. Category destination badge rendered (not exact product page)
      expect(screen.getByText('Official Category Destination')).toBeInTheDocument();

      // 3. Editorial Concept notice rendered
      expect(screen.getByText('Curated Editorial Fashion Concept')).toBeInTheDocument();

      // 4. Truthful pricing: Price upon inquiry, NO false verified price, NO ₹0
      expect(screen.getByText('Price Upon Inquiry')).toBeInTheDocument();
      expect(screen.queryByText('Verified Atelier Price')).not.toBeInTheDocument();
      expect(screen.queryByText('₹0.00')).not.toBeInTheDocument();
      expect(screen.queryByText('₹0')).not.toBeInTheDocument();

      // 5. Official brand portal CTA rendered with secure external attributes
      const cta = screen.getByRole('link', { name: /Acquire via Official Sabyasachi Portal/i });
      expect(cta).toBeInTheDocument();
      expect(cta).toHaveAttribute('target', '_blank');
      expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should resolve curated product via slug and maintain category destination distinction', async () => {
      renderWithProviders('/products/anita-dongre-pichhwai-silk-saree');

      // 1. Anita Dongre product resolved by slug
      expect(screen.getByRole('heading', { level: 1, name: /Pichhwai Hand-Painted Silk Saree/i })).toBeInTheDocument();

      // 2. Price upon inquiry rendered, no numeric or false verified price
      expect(screen.getByText('Price Upon Inquiry')).toBeInTheDocument();
      expect(screen.queryByText('₹1,10,000')).not.toBeInTheDocument();
      expect(screen.queryByText('Verified Atelier Price')).not.toBeInTheDocument();

      // 3. Official Category Destination labeled
      expect(screen.getByText('Official Category Destination')).toBeInTheDocument();

      // 4. Direct referral CTA to official Anita Dongre portal
      const cta = screen.getByRole('link', { name: /Acquire via Official Anita Dongre Portal/i });
      expect(cta).toBeInTheDocument();
      expect(cta).toHaveAttribute('href', 'https://www.anitadongre.com/women/clothing/sarees/');
    });
  });
});
