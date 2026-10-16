import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/styles/theme';
import AdminDashboard from '../src/pages/admin/AdminDashboard';
import AdminProductForm from '../src/pages/admin/AdminProductForm';
import AdminOrderList from '../src/pages/admin/AdminOrderList';
import ProtectedRoute from '../src/components/auth/ProtectedRoute';
import authReducer from '../src/store/slices/authSlice';
import { OrderService } from '../src/services/OrderService';
import { ProductService } from '../src/services/ProductService';
import type { OrderResponse } from '../src/types/order';
import type { Product, Category } from '../src/types/product';
import { BACKEND_CATEGORY_UUIDS } from '../src/utils/categoryMapping';

// Mock react-chartjs-2 to avoid canvas issues in jsdom
vi.mock('react-chartjs-2', () => ({
  Doughnut: (props: any) => (
    <div data-testid="doughnut-chart" data-labels={JSON.stringify(props.data.labels)} />
  ),
}));

// Mock services
vi.mock('../src/services/OrderService', () => ({
  OrderService: {
    getAllOrders: vi.fn(),
  },
}));

vi.mock('../src/services/ProductService', () => ({
  ProductService: {
    getProducts: vi.fn(),
    getCategories: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

const mockCategories: Category[] = [
  { id: BACKEND_CATEGORY_UUIDS.CLOTHING, name: 'Clothing' },
  { id: BACKEND_CATEGORY_UUIDS.FOOTWEAR, name: 'Footwear' },
];

const mockOrders: OrderResponse[] = [
  {
    id: 'ord-001',
    orderNumber: 'ORD-LUM-001',
    userId: 'user-100',
    status: 'CONFIRMED',
    totalAmount: 185000,
    shippingAddress: {
      fullName: 'Aria Vance',
      street: '72 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      phoneNumber: '+91 98200 12345',
    },
    paymentMethod: 'CREDIT_CARD',
    items: [
      {
        productId: 'prod-01',
        sku: 'SABYA-ROYAL-01',
        name: 'Royal Heritage Velvet Lehenga',
        quantity: 1,
        unitPrice: 185000,
        totalPrice: 185000,
      },
    ],
    createdAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'ord-002',
    orderNumber: 'ORD-LUM-002',
    userId: 'user-200',
    status: 'PENDING',
    totalAmount: 95000,
    shippingAddress: {
      fullName: 'Vikramaditya Rao',
      street: '14 Palace Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302001',
      country: 'India',
      phoneNumber: '+91 98200 54321',
    },
    paymentMethod: 'NET_BANKING',
    items: [],
    createdAt: '2026-10-11T09:15:00Z',
  },
];

const renderWithProviders = (ui: React.ReactElement, initialAuthState?: any) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: initialAuthState || {
        user: { id: 'admin-1', email: 'admin@lumiere.com', roles: ['ROLE_ADMIN', 'ADMIN'] },
        token: 'admin-jwt-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/admin']}>{ui}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

describe('Stage 7B.3: Admin Data Integrity, Referral Safeguards & Route Privacy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ProductService.getCategories).mockResolvedValue(mockCategories);
  });

  // =========================================================================
  // 1. DASHBOARD DATA INTEGRITY & API LIMITATIONS
  // =========================================================================
  describe('Dashboard Telemetry Integrity', () => {
    it('handles order API error by showing unavailable placeholder — instead of fabricating 0 or misleading empty state', async () => {
      vi.mocked(OrderService.getAllOrders).mockRejectedValue(new Error('Gateway timeout (504)'));
      vi.mocked(ProductService.getProducts).mockResolvedValue({
        content: [],
        totalElements: 12,
        pageNumber: 0,
        pageSize: 1,
        totalPages: 12,
        last: false,
      });

      renderWithProviders(<AdminDashboard />);

      // Error banner is shown
      expect(await screen.findByText(/Failed to load administrative orders/i)).toBeInTheDocument();

      // Placeholder '—' is displayed for orders and revenue metrics instead of fabricating 0
      const placeholders = await screen.findAllByText('—');
      expect(placeholders.length).toBeGreaterThanOrEqual(2);

      // Does NOT claim "No recent orders found." (which misleadingly indicates empty database)
      expect(screen.queryByText('No recent orders found.')).not.toBeInTheDocument();
      expect(screen.getByText('Unable to load recent orders.')).toBeInTheDocument();

      // Chart indicates service failure rather than empty data
      expect(
        screen.getByText('Unable to load order status distribution due to service error.')
      ).toBeInTheDocument();
    });

    it('renders sampled telemetry disclosure when totalElements exceeds content length (partial-data state)', async () => {
      // Backend returns 2 orders in page 0, but totalElements is 150
      vi.mocked(OrderService.getAllOrders).mockResolvedValue({
        content: mockOrders,
        totalElements: 150,
        pageNumber: 0,
        pageSize: 50,
        totalPages: 3,
        last: false,
      });

      vi.mocked(ProductService.getProducts).mockResolvedValue({
        content: [],
        totalElements: 20,
        pageNumber: 0,
        pageSize: 1,
        totalPages: 20,
        last: false,
      });

      renderWithProviders(<AdminDashboard />);

      // Partial data disclosure alert must be visible
      expect(await screen.findByText(/Sampled Telemetry:/i)).toBeInTheDocument();
      expect(screen.getByText(/Dashboard metrics reflect the latest 2 orders/i)).toBeInTheDocument();

      // Authoritative total orders count matches totalElements
      expect(screen.getByText('150')).toBeInTheDocument();

      // Awaiting dispatch clarifies that the count is from the sampled subset
      expect(screen.getByText(/in recent 2 sampled/i)).toBeInTheDocument();

      // Chart discloses sampled count
      expect(screen.getByText(/Derived from authoritative order records \(2 of 150 sampled\)/i)).toBeInTheDocument();
    });

    it('clearly labels Settled Sales with Unverified Settlement chip and gateway limitation disclaimer', async () => {
      vi.mocked(OrderService.getAllOrders).mockResolvedValue({
        content: mockOrders,
        totalElements: 2,
        pageNumber: 0,
        pageSize: 50,
        totalPages: 1,
        last: true,
      });

      vi.mocked(ProductService.getProducts).mockResolvedValue({
        content: [],
        totalElements: 5,
        pageNumber: 0,
        pageSize: 1,
        totalPages: 5,
        last: true,
      });

      renderWithProviders(<AdminDashboard />);

      // Metric title and Unverified Settlement badge
      expect(await screen.findByText('Settled Sales')).toBeInTheDocument();
      expect(screen.getByText('Unverified Settlement')).toBeInTheDocument();

      // Disclaimer distinguishing order total from verified gateway payment settlement
      expect(
        screen.getByText(/payment gateway settlement unverified/i)
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. REFERRAL AND INQUIRY SAFETY IN ADMIN PRODUCT FORM
  // =========================================================================
  describe('Admin Product Form Referral Safeguards', () => {
    it('editing an existing referral product and changing unrelated fields strictly preserves isReferral and fulfillmentType', async () => {
      const existingReferralProduct: Product = {
        id: 'ref-prod-001',
        sku: 'SABYA-HERITAGE-REF-01',
        name: 'Heritage Velvet Couture Lehenga',
        description: 'Original atelier creation description',
        price: 0,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        status: 'ACTIVE',
        imageUrl: 'https://images.unsplash.com/lehenga.jpg',
        attributes: JSON.stringify({
          isReferral: true,
          fulfillmentType: 'EXTERNAL_ATELIER_REFERRAL',
          priceVerificationStatus: 'PRICE_UPON_INQUIRY',
          brandSlug: 'sabyasachi',
          customAtelierCode: 'ATELIER-SPECIAL-2026',
        }),
      };

      vi.mocked(ProductService.updateProduct).mockResolvedValue(existingReferralProduct);
      const handleClose = vi.fn();

      renderWithProviders(
        <AdminProductForm open={true} onClose={handleClose} product={existingReferralProduct} />
      );

      // Edit an unrelated field on Tab 1 (Title)
      const nameInput = await screen.findByLabelText(/Creation Title/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Heritage Velvet Couture Lehenga' } });

      // Save changes without visiting Tab 3
      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(ProductService.updateProduct).toHaveBeenCalled();
      });

      const payload = vi.mocked(ProductService.updateProduct).mock.calls[0][1];
      const parsedAttrs = JSON.parse(payload.attributes!);

      // Referral markers MUST remain strictly preserved!
      expect(parsedAttrs.isReferral).toBe(true);
      expect(parsedAttrs.fulfillmentType).toBe('EXTERNAL_ATELIER_REFERRAL');
      expect(parsedAttrs.customAtelierCode).toBe('ATELIER-SPECIAL-2026');
      expect(payload.name).toBe('Updated Heritage Velvet Couture Lehenga');
    });

    it('blocks switching to Internal Purchase mode while a referral destination URL is still set', async () => {
      const referralProductWithUrl: Product = {
        id: 'ref-prod-002',
        sku: 'SABYA-URL-01',
        name: 'Bridal Saree with Destination',
        price: 250000,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        status: 'ACTIVE',
        attributes: JSON.stringify({
          isReferral: true,
          fulfillmentType: 'EXTERNAL_ATELIER_REFERRAL',
          destinationUrl: 'https://www.sabyasachi.com/collection/saree',
          brandSlug: 'sabyasachi',
        }),
      };

      renderWithProviders(
        <AdminProductForm open={true} onClose={vi.fn()} product={referralProductWithUrl} />
      );

      // Switch to Tab 3
      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // Attempt to change fulfillment mode to Internal Purchase while destination URL exists
      const fulfillmentSelect = screen.getByLabelText(/Fulfillment & Checkout Mode/i);
      fireEvent.mouseDown(fulfillmentSelect);

      const internalOption = await screen.findByRole('option', { name: /Internal Atelier Purchase/i });
      fireEvent.click(internalOption);

      // Form validation error must be displayed and submission blocked
      expect(
        await screen.findByText(/Remove referral destination URL before switching/i)
      ).toBeInTheDocument();

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      expect(ProductService.updateProduct).not.toHaveBeenCalled();
    });

    it('blocks switching to Internal Purchase when product price is zero or price upon inquiry', async () => {
      const zeroPriceInquiryProduct: Product = {
        id: 'ref-prod-003',
        sku: 'INQ-ZERO-01',
        name: 'Bespoke Zero Price Gown',
        price: 0,
        currency: 'INR',
        brand: 'Tarun Tahiliani',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        status: 'ACTIVE',
        attributes: JSON.stringify({
          isReferral: true,
          fulfillmentType: 'EXTERNAL_ATELIER_REFERRAL',
          priceVerificationStatus: 'PRICE_UPON_INQUIRY',
        }),
      };

      renderWithProviders(
        <AdminProductForm open={true} onClose={vi.fn()} product={zeroPriceInquiryProduct} />
      );

      // Navigate to Tab 3
      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // Switch fulfillment mode to Internal Purchase
      const fulfillmentSelect = screen.getByLabelText(/Fulfillment & Checkout Mode/i);
      fireEvent.mouseDown(fulfillmentSelect);
      const internalOption = await screen.findByRole('option', { name: /Internal Atelier Purchase/i });
      fireEvent.click(internalOption);

      // Submit
      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      // Must be rejected because price is 0
      expect(
        await screen.findByText(/require an authoritative transaction price greater than ₹0/i)
      ).toBeInTheDocument();
      expect(ProductService.updateProduct).not.toHaveBeenCalled();
    });

    it('allows deliberate conversion to Internal Purchase when destination URL is removed and price > 0', async () => {
      const convertedProduct: Product = {
        id: 'ref-prod-004',
        sku: 'CONVERT-01',
        name: 'In-House Ready Silk Robe',
        price: 45000,
        currency: 'INR',
        brand: 'LUMIÈRE Atelier',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        status: 'ACTIVE',
        attributes: JSON.stringify({
          isReferral: true,
          fulfillmentType: 'EXTERNAL_ATELIER_REFERRAL',
          preservedToken: 'SECURE-TOKEN-123',
        }),
      };

      vi.mocked(ProductService.updateProduct).mockResolvedValue({
        ...convertedProduct,
        attributes: JSON.stringify({ preservedToken: 'SECURE-TOKEN-123' }),
      });

      renderWithProviders(
        <AdminProductForm open={true} onClose={vi.fn()} product={convertedProduct} />
      );

      // Navigate to Tab 3
      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // Deliberately set to Internal Purchase
      const fulfillmentSelect = screen.getByLabelText(/Fulfillment & Checkout Mode/i);
      fireEvent.mouseDown(fulfillmentSelect);
      const internalOption = await screen.findByRole('option', { name: /Internal Atelier Purchase/i });
      fireEvent.click(internalOption);

      // Submit
      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(ProductService.updateProduct).toHaveBeenCalled();
      });

      const payload = vi.mocked(ProductService.updateProduct).mock.calls[0][1];
      const parsedAttrs = JSON.parse(payload.attributes!);

      // Referral markers deliberately removed, unknown attributes strictly preserved
      expect(parsedAttrs.isReferral).toBeUndefined();
      expect(parsedAttrs.fulfillmentType).toBeUndefined();
      expect(parsedAttrs.preservedToken).toBe('SECURE-TOKEN-123');
    });
  });

  // =========================================================================
  // 3. ADMIN ROUTE AUTHORIZATION & ORDER PRIVACY
  // =========================================================================
  describe('Admin Route Authorization & Order Privacy', () => {
    it('redirects unauthenticated users attempting to access protected admin routes to /login', () => {
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/admin/orders']}>
            <Routes>
              <Route path="/login" element={<div>LOGIN_PAGE_REDIRECTED</div>} />
              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/admin/orders" element={<AdminOrderList />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Should be redirected to /login
      expect(screen.getByText('LOGIN_PAGE_REDIRECTED')).toBeInTheDocument();
      expect(screen.queryByText(/Client Orders & Dispatches/i)).not.toBeInTheDocument();
    });

    it('redirects authenticated non-admin users attempting to access /admin/orders to root /', () => {
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: { id: 'cust-1', email: 'client@example.com', roles: ['ROLE_CUSTOMER'] },
            token: 'customer-jwt-token',
            isAuthenticated: true,
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/admin/orders']}>
            <Routes>
              <Route path="/" element={<div>STOREFRONT_HOME_PAGE</div>} />
              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/admin/orders" element={<AdminOrderList />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Should be redirected away from admin to root /
      expect(screen.getByText('STOREFRONT_HOME_PAGE')).toBeInTheDocument();
      expect(screen.queryByText(/Client Orders & Dispatches/i)).not.toBeInTheDocument();
    });

    it('does not leak internal JWT tokens or sensitive credentials in order dossier', async () => {
      vi.mocked(OrderService.getAllOrders).mockResolvedValue({
        content: mockOrders,
        totalElements: 2,
        pageNumber: 0,
        pageSize: 10,
        totalPages: 1,
        last: true,
      });

      renderWithProviders(<AdminOrderList />);

      expect(await screen.findByText('ORD-LUM-001')).toBeInTheDocument();

      const inspectButtons = await screen.findAllByRole('button', { name: /inspect order/i });
      fireEvent.click(inspectButtons[0]);

      // Dossier is open
      expect(await screen.findByText('ORDER DOSSIER')).toBeInTheDocument();
      expect(screen.getAllByText('Aria Vance').length).toBeGreaterThanOrEqual(2);

      // Ensure no raw bearer tokens or passwords appear in the modal text
      expect(screen.queryByText(/Bearer /i)).not.toBeInTheDocument();
      expect(screen.queryByText(/admin-jwt-token/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password/i)).not.toBeInTheDocument();
    });
  });
});
