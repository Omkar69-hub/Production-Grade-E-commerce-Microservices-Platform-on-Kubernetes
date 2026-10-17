import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/styles/theme';
import AdminDashboard from '../src/pages/admin/AdminDashboard';
import AdminProductList from '../src/pages/admin/AdminProductList';
import AdminProductForm from '../src/pages/admin/AdminProductForm';
import AdminOrderList from '../src/pages/admin/AdminOrderList';
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

const sampleOrders: OrderResponse[] = [
  {
    id: 'ord-uuid-001',
    orderNumber: 'ORD-LUM-001',
    userId: 'user-uuid-1234',
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
    notes: 'Please wrap with bespoke ribbon',
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
    id: 'ord-uuid-002',
    orderNumber: 'ORD-LUM-002',
    userId: 'user-uuid-5678',
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
    items: [
      {
        productId: 'prod-02',
        sku: 'TARUN-SHERWANI-01',
        name: 'Ivory Zari Sherwani',
        quantity: 1,
        unitPrice: 95000,
        totalPrice: 95000,
      },
    ],
    createdAt: '2026-10-11T09:15:00Z',
  },
  {
    id: 'ord-uuid-003',
    orderNumber: 'ORD-LUM-003',
    userId: 'user-uuid-9999',
    status: 'DELIVERED',
    totalAmount: 120000,
    shippingAddress: {
      fullName: 'Tara Sharma',
      street: '88 Colaba Causeway',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400005',
      country: 'India',
      phoneNumber: '+91 98200 99999',
    },
    paymentMethod: 'LUXURY_CARD',
    items: [
      {
        productId: 'prod-03',
        sku: 'RAW-MANGO-01',
        name: 'Chanderi Brocade Saree',
        quantity: 1,
        unitPrice: 120000,
        totalPrice: 120000,
      },
    ],
    createdAt: '2026-10-09T18:00:00Z',
  },
  {
    id: 'ord-uuid-004',
    orderNumber: 'ORD-LUM-004',
    userId: 'user-uuid-7777',
    status: 'CANCELLED',
    totalAmount: 45000,
    shippingAddress: {
      fullName: 'Devansh Roy',
      street: '12 Alipore',
      city: 'Kolkata',
      state: 'West Bengal',
      zipCode: '700027',
      country: 'India',
      phoneNumber: '+91 98200 77777',
    },
    items: [],
    createdAt: '2026-10-08T11:00:00Z',
  },
];

const sampleCategories: Category[] = [
  { id: BACKEND_CATEGORY_UUIDS.CLOTHING, name: 'Clothing' },
  { id: BACKEND_CATEGORY_UUIDS.FOOTWEAR, name: 'Footwear' },
  { id: BACKEND_CATEGORY_UUIDS.ACCESSORIES, name: 'Accessories' },
];

const sampleProducts: Product[] = [
  {
    id: 'p-1',
    sku: 'SABYA-LEHENGA-01',
    name: 'Zardozi Velvet Bridal Lehenga',
    description: 'Masterpiece bridal lehenga with antique gold zardozi',
    price: 385000,
    currency: 'INR',
    brand: 'Sabyasachi',
    categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
    categoryName: 'Bridal Lehengas',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/sample-lehenga.jpg',
    attributes: JSON.stringify({
      audience: 'Women',
      subcategory: 'Bridal Lehengas',
      fabric: 'Velvet',
      fit: 'Bespoke Tailored',
      sizes: 'XS, S, M, L',
      colors: 'Crimson, Gold',
      uuid: 'canonical-uuid-1',
      customArchiveCode: 'ARCHIVE-2026-SABYA',
    }),
  },
  {
    id: 'p-2',
    sku: 'TARUN-SHERWANI-01',
    name: 'Heritage Silk Sherwani',
    description: 'Artisanal hand-embroidered sherwani',
    price: 245000,
    currency: 'INR',
    brand: 'Tarun Tahiliani',
    categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
    categoryName: '', // Notice: empty categoryName to test UUID lookup!
    status: 'OUT_OF_STOCK',
    imageUrl: '', // Notice: empty image to test fallback!
    attributes: JSON.stringify({
      audience: 'Men',
      subcategory: 'Sherwanis & Bandhgalas',
      fabric: 'Mulberry Silk',
    }),
  },
];

const renderComponent = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('LUMIÈRE Stage 7B.2: Admin Management Suite Polish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. ADMIN DASHBOARD VERIFICATION
  // =========================================================================
  describe('Admin Dashboard', () => {
    it('renders executive KPI cards with authoritative backend calculations', async () => {
      vi.mocked(OrderService.getAllOrders).mockResolvedValue({
        content: sampleOrders,
        totalElements: 4,
        pageNumber: 0,
        pageSize: 50,
        totalPages: 1,
        last: true,
      });

      vi.mocked(ProductService.getProducts).mockResolvedValue({
        content: sampleProducts,
        totalElements: 14,
        pageNumber: 0,
        pageSize: 1,
        totalPages: 14,
        last: false,
      });

      renderComponent(<AdminDashboard />);

      // Total orders card
      expect(await screen.findByText('Total Orders')).toBeInTheDocument();
      expect(await screen.findByText('4')).toBeInTheDocument();

      // Orders awaiting dispatch (PENDING=1, CONFIRMED=1 -> 2)
      expect(screen.getByText('Awaiting Dispatch')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();

      // Total catalog products
      expect(screen.getByText('Catalog Creations')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();

      // Settled revenue (CONFIRMED 185k + DELIVERED 120k = 305k, CANCELLED excluded)
      expect(screen.getByText('Settled Sales')).toBeInTheDocument();
      expect(screen.getByText(/₹\s*3,05,000/)).toBeInTheDocument();

      // Inventory API disclaimer
      expect(
        screen.getByText(/Inventory Aggregation Telemetry: API Limitation/i)
      ).toBeInTheDocument();

      // Chart rendered
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();

      // Recent orders rendered
      expect(screen.getByText('ORD-LUM-001')).toBeInTheDocument();
      expect(screen.getByText('Aria Vance')).toBeInTheDocument();
    });

    it('handles empty orders state honestly without fabricated metrics', async () => {
      vi.mocked(OrderService.getAllOrders).mockResolvedValue({
        content: [],
        totalElements: 0,
        pageNumber: 0,
        pageSize: 50,
        totalPages: 0,
        last: true,
      });

      vi.mocked(ProductService.getProducts).mockResolvedValue({
        content: [],
        totalElements: 0,
        pageNumber: 0,
        pageSize: 1,
        totalPages: 0,
        last: true,
      });

      renderComponent(<AdminDashboard />);

      expect(await screen.findByText('No recent orders found.')).toBeInTheDocument();
      expect(screen.getByText('No order status data available to construct chart.')).toBeInTheDocument();
    });

    it('triggers telemetry refresh when button is clicked', async () => {
      vi.mocked(OrderService.getAllOrders).mockResolvedValue({
        content: sampleOrders,
        totalElements: 4,
        pageNumber: 0,
        pageSize: 50,
        totalPages: 1,
        last: true,
      });
      vi.mocked(ProductService.getProducts).mockResolvedValue({
        content: sampleProducts,
        totalElements: 2,
        pageNumber: 0,
        pageSize: 1,
        totalPages: 1,
        last: true,
      });

      renderComponent(<AdminDashboard />);

      const refreshBtn = await screen.findByRole('button', { name: /refresh telemetry/i });
      fireEvent.click(refreshBtn);

      expect(OrderService.getAllOrders).toHaveBeenCalled();
      expect(ProductService.getProducts).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 2. ADMIN PRODUCT LIST VERIFICATION
  // =========================================================================
  describe('Admin Product List', () => {
    beforeEach(() => {
      vi.mocked(ProductService.getCategories).mockResolvedValue(sampleCategories);
      vi.mocked(ProductService.getProducts).mockResolvedValue({
        content: sampleProducts,
        totalElements: 2,
        pageNumber: 0,
        pageSize: 10,
        totalPages: 1,
        last: true,
      });
    });

    it('resolves human-readable category names and does not show raw UUIDs', async () => {
      renderComponent(<AdminProductList />);

      // For product 1: explicitly has categoryName 'Bridal Lehengas'
      expect(await screen.findByText('Bridal Lehengas')).toBeInTheDocument();

      // For product 2: categoryName was empty, so categoryId UUID resolved to 'Clothing'
      expect(screen.getByText('Clothing')).toBeInTheDocument();

      // Verify raw UUID is NOT rendered in table text
      expect(screen.queryByText(BACKEND_CATEGORY_UUIDS.CLOTHING)).not.toBeInTheDocument();
    });

    it('corrects mismatch by displaying Status column heading and honest status labels', async () => {
      renderComponent(<AdminProductList />);

      // Table head must contain "Status" and not "Stock"
      const statusHeader = await screen.findByRole('columnheader', { name: /status/i });
      expect(statusHeader).toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: /^stock$/i })).not.toBeInTheDocument();

      // Renders honest lifecycle badges
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('uses inline SVG fallback image instead of placehold.co', async () => {
      renderComponent(<AdminProductList />);

      const images = await screen.findAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(2);

      // Product 2 has empty imageUrl -> fallback used
      const fallbackImg = images.find((img) =>
        img.getAttribute('src')?.startsWith('data:image/svg+xml')
      );
      expect(fallbackImg).toBeDefined();

      // Verify no placehold.co external dependency exists
      images.forEach((img) => {
        expect(img.getAttribute('src')).not.toContain('placehold.co');
      });
    });

    it('filters products via search bar and opens delete confirmation', async () => {
      renderComponent(<AdminProductList />);

      const searchInput = await screen.findByPlaceholderText(/search creations/i);
      fireEvent.change(searchInput, { target: { value: 'Velvet' } });

      // Search parameter passed to backend
      await waitFor(() => {
        expect(ProductService.getProducts).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'Velvet' })
        );
      });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      // Confirm dialog opens
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete creation/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 3. ADMIN PRODUCT FORM ATTRIBUTE PRESERVATION & SECURITY
  // =========================================================================
  describe('Admin Product Form', () => {
    beforeEach(() => {
      vi.mocked(ProductService.getCategories).mockResolvedValue(sampleCategories);
      vi.mocked(ProductService.updateProduct).mockResolvedValue(sampleProducts[0]);
    });

    it('preserves unknown JSON attributes when editing a product', async () => {
      const handleClose = vi.fn();

      renderComponent(
        <AdminProductForm
          open={true}
          onClose={handleClose}
          product={sampleProducts[0]} // has customArchiveCode: 'ARCHIVE-2026-SABYA'
        />
      );

      // Check that structured clothing fields populated
      expect(await screen.findByDisplayValue('Zardozi Velvet Bridal Lehenga')).toBeInTheDocument();

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(ProductService.updateProduct).toHaveBeenCalled();
      });

      const updateCallPayload = vi.mocked(ProductService.updateProduct).mock.calls[0][1];
      expect(updateCallPayload.attributes).toBeDefined();

      const parsedSavedAttrs = JSON.parse(updateCallPayload.attributes!);
      // Unknown/extra attribute was strictly preserved!
      expect(parsedSavedAttrs.customArchiveCode).toBe('ARCHIVE-2026-SABYA');
      expect(parsedSavedAttrs.uuid).toBe('canonical-uuid-1');
      // Known attributes preserved
      expect(parsedSavedAttrs.audience).toBe('Women');
      expect(parsedSavedAttrs.subcategory).toBe('Bridal Lehengas');
    });

    it('rejects cross-brand mismatch destination URLs using domainVerifier', async () => {
      const handleClose = vi.fn();

      renderComponent(
        <AdminProductForm
          open={true}
          onClose={handleClose}
          product={{
            ...sampleProducts[0],
            brand: 'Sabyasachi',
          }}
        />
      );

      // Navigate to Curation & Referrals tab
      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // Enter destination URL from a different brand (Tarun Tahiliani domain for a Sabyasachi product)
      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://www.taruntahiliani.com/collections/bridal' },
      });

      // Submit
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Must be rejected with security message
      expect(
        await screen.findByText(/Cross-Brand Destination Mismatch/i)
      ).toBeInTheDocument();
      expect(ProductService.updateProduct).not.toHaveBeenCalled();
    });

    it('rejects insecure HTTP protocol destination URLs', async () => {
      const handleClose = vi.fn();

      renderComponent(
        <AdminProductForm
          open={true}
          onClose={handleClose}
          product={sampleProducts[0]}
        />
      );

      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, {
        target: { value: 'http://www.sabyasachi.com/collection' },
      });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      expect(
        await screen.findByText(/must use secure HTTPS protocol/i)
      ).toBeInTheDocument();
      expect(ProductService.updateProduct).not.toHaveBeenCalled();
    });

    it('automatically applies isReferral and fulfillmentType for referral and inquiry products', async () => {
      const handleClose = vi.fn();
      const sampleInquiryProduct: Product = {
        ...sampleProducts[0],
        price: 0,
        attributes: JSON.stringify({
          ...JSON.parse(sampleProducts[0].attributes!),
          priceVerificationStatus: 'PRICE_UPON_INQUIRY',
        }),
      };

      renderComponent(
        <AdminProductForm
          open={true}
          onClose={handleClose}
          product={sampleInquiryProduct}
        />
      );

      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // Enter valid verified HTTPS Sabyasachi URL
      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://www.sabyasachi.com/collection/heritage-bridal/' },
      });

      // Verified badge should appear
      expect(
        await screen.findByText(/Verified Maison/i)
      ).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(ProductService.updateProduct).toHaveBeenCalled();
      });

      const payload = vi.mocked(ProductService.updateProduct).mock.calls[0][1];
      const parsedAttrs = JSON.parse(payload.attributes!);
      expect(parsedAttrs.isReferral).toBe(true);
      expect(parsedAttrs.fulfillmentType).toBe('REFERRAL_LINK');
    });
  });

  // =========================================================================
  // 4. ADMIN ORDER MANAGEMENT VERIFICATION
  // =========================================================================
  describe('Admin Order Management', () => {
    beforeEach(() => {
      vi.mocked(OrderService.getAllOrders).mockResolvedValue({
        content: sampleOrders,
        totalElements: 4,
        pageNumber: 0,
        pageSize: 10,
        totalPages: 1,
        last: true,
      });
    });

    it('renders administrative order table with customer, date, total, and status', async () => {
      renderComponent(<AdminOrderList />);

      expect(await screen.findByText('Client Orders & Dispatches')).toBeInTheDocument();

      // Orders rendered once query resolves
      expect(await screen.findByText('ORD-LUM-001')).toBeInTheDocument();
      expect(screen.getByText('Aria Vance')).toBeInTheDocument();
      expect(screen.getAllByText('Mumbai, India').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();

      expect(screen.getByText('ORD-LUM-002')).toBeInTheDocument();
      expect(screen.getByText('Vikramaditya Rao')).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
    });

    it('opens order dossier modal showing line items and automated status notice', async () => {
      renderComponent(<AdminOrderList />);

      expect(await screen.findByText('ORD-LUM-001')).toBeInTheDocument();

      const inspectButtons = await screen.findAllByRole('button', { name: /inspect order/i });
      fireEvent.click(inspectButtons[0]);

      // Dossier modal opens
      expect(await screen.findByText('ORDER DOSSIER')).toBeInTheDocument();
      expect(screen.getByText('Royal Heritage Velvet Lehenga')).toBeInTheDocument();
      expect(screen.getByText('SABYA-ROYAL-01')).toBeInTheDocument();

      // Automated status notice must be present (no fake update simulation)
      expect(screen.getByText(/Status Governance:/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Manual administrative override endpoints are not exposed by the current backend API contract./i)
      ).toBeInTheDocument();
    });

    it('filters orders by search query and status dropdown', async () => {
      renderComponent(<AdminOrderList />);

      expect(await screen.findByText('ORD-LUM-001')).toBeInTheDocument();

      const searchInput = await screen.findByPlaceholderText(/filter by order #/i);
      fireEvent.change(searchInput, { target: { value: 'Jaipur' } });

      // Vikramaditya Rao in Jaipur should be visible
      expect(await screen.findByText('ORD-LUM-002')).toBeInTheDocument();
      // Aria Vance in Mumbai should be filtered out
      expect(screen.queryByText('ORD-LUM-001')).not.toBeInTheDocument();
    });
  });
});
