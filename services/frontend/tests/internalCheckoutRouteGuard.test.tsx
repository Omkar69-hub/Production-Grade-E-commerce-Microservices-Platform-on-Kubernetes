import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import authReducer from '../src/store/slices/authSlice';
import cartReducer from '../src/store/slices/cartSlice';
import { EffectsProvider } from '../src/context/EffectsContext';
import { ComparisonProvider } from '../src/context/ComparisonContext';
import { isInternalCheckoutEnabled, env } from '../src/config/env';
import AppRoutes from '../src/routes/AppRoutes';
import MainLayout from '../src/layouts/MainLayout';

// Mock window.matchMedia for JSDOM
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Helper component to observe current location in tests
const LocationTracker = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('Stage 9E: Fix 3 — Internal Checkout Disabled by Default & Route Redirection', () => {
  let store: ReturnType<typeof configureStore>;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    store = configureStore({
      reducer: combineReducers({
        auth: authReducer,
        cart: cartReducer,
      }),
      preloadedState: {
        auth: {
          user: {
            id: 'client-user-123',
            email: 'client@lumiere.com',
            firstName: 'Aurelia',
            lastName: 'Vance',
            roles: ['USER'],
            status: 'ACTIVE',
          },
          token: 'mock-valid-jwt-token',
          refreshToken: 'mock-refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
        cart: {
          cartId: 'test-cart-session',
          cart: null,
          loading: false,
          error: null,
        },
      },
    });
  });

  // =========================================================================
  // 1. FEATURE FLAG EVALUATION LOGIC
  // =========================================================================
  describe('1. Feature Flag Evaluation Logic (isInternalCheckoutEnabled)', () => {
    it('evaluates to false when environment variable is undefined, null, or empty', () => {
      expect(isInternalCheckoutEnabled(undefined)).toBe(false);
      expect(isInternalCheckoutEnabled(null)).toBe(false);
      expect(isInternalCheckoutEnabled('')).toBe(false);
    });

    it('evaluates to false when environment variable is "false", "0", or arbitrary string', () => {
      expect(isInternalCheckoutEnabled('false')).toBe(false);
      expect(isInternalCheckoutEnabled('FALSE')).toBe(false);
      expect(isInternalCheckoutEnabled('0')).toBe(false);
      expect(isInternalCheckoutEnabled('disabled')).toBe(false);
    });

    it('evaluates to true only when explicitly set to "true" or boolean true', () => {
      expect(isInternalCheckoutEnabled('true')).toBe(true);
      expect(isInternalCheckoutEnabled(true)).toBe(true);
    });

    it('defaults to disabled (false) in default application configuration', () => {
      // In default environment (where VITE_ENABLE_INTERNAL_CHECKOUT is unset)
      expect(env.ENABLE_INTERNAL_CHECKOUT).toBe(false);
    });
  });

  // =========================================================================
  // 2. ROUTE GUARDS AND REDIRECTIONS
  // =========================================================================
  describe('2. Route Redirections When Internal Checkout Is Disabled', () => {
    const renderWithRoute = (initialPath: string) => {
      return render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <EffectsProvider>
              <ComparisonProvider>
                <MemoryRouter initialEntries={[initialPath]}>
                  <LocationTracker />
                  <AppRoutes />
                </MemoryRouter>
              </ComparisonProvider>
            </EffectsProvider>
          </Provider>
        </QueryClientProvider>
      );
    };

    it('redirects /cart to /collection when internal checkout is disabled', async () => {
      renderWithRoute('/cart');
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/collection');
      }, { timeout: 4000 });
    });

    it('redirects /checkout to /collection when internal checkout is disabled', async () => {
      renderWithRoute('/checkout');
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/collection');
      }, { timeout: 4000 });
    });

    it('redirects /orders/success/:id to /collection when internal checkout is disabled', async () => {
      renderWithRoute('/orders/success/123e4567-e89b-12d3-a456-426614174000');
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/collection');
      }, { timeout: 4000 });
    });

    it('preserves public clothing discovery routes without redirection', async () => {
      renderWithRoute('/collection');
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/collection');
      }, { timeout: 4000 });
    });

    it('preserves wishlist page without redirection', async () => {
      renderWithRoute('/wishlist');
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/wishlist');
      }, { timeout: 4000 });
    });

    it('preserves brands directory without redirection', async () => {
      renderWithRoute('/brands');
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/brands');
      }, { timeout: 4000 });
    });
  });

  // =========================================================================
  // 3. MAIN LAYOUT HEADER BEHAVIOR
  // =========================================================================
  describe('3. MainLayout Shopping Bag Visibility', () => {
    it('does not render the Shopping Bag button when internal checkout is disabled', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <EffectsProvider>
              <ComparisonProvider>
                <MemoryRouter initialEntries={['/']}>
                  <MainLayout />
                </MemoryRouter>
              </ComparisonProvider>
            </EffectsProvider>
          </Provider>
        </QueryClientProvider>
      );

      expect(screen.queryByLabelText(/shopping bag/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /shopping bag/i })).not.toBeInTheDocument();
    });

    it('preserves the Private Wishlist button in the header', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <EffectsProvider>
              <ComparisonProvider>
                <MemoryRouter initialEntries={['/']}>
                  <MainLayout />
                </MemoryRouter>
              </ComparisonProvider>
            </EffectsProvider>
          </Provider>
        </QueryClientProvider>
      );

      expect(screen.getByLabelText(/curated wishlist/i)).toBeInTheDocument();
    });
  });
});
