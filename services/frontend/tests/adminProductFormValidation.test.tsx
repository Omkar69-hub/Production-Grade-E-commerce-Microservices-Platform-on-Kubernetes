import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/styles/theme';
import AdminProductForm from '../src/pages/admin/AdminProductForm';
import { ProductService } from '../src/services/ProductService';
import type { Product, Category } from '../src/types/product';
import { BACKEND_CATEGORY_UUIDS } from '../src/utils/categoryMapping';

vi.mock('../src/services/ProductService', () => ({
  ProductService: {
    getCategories: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
}));

const mockCategories: Category[] = [
  { id: BACKEND_CATEGORY_UUIDS.CLOTHING, name: 'Clothing' },
  { id: BACKEND_CATEGORY_UUIDS.FOOTWEAR, name: 'Footwear' },
  { id: BACKEND_CATEGORY_UUIDS.ACCESSORIES, name: 'Accessories' },
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

describe('AdminProductForm Referral & Inquiry Safety Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ProductService.getCategories).mockResolvedValue(mockCategories);
  });

  describe('Referral Mode Validation Gaps', () => {
    it('prevents submission when destination URL is missing in referral mode', async () => {
      const handleClose = vi.fn();
      renderComponent(<AdminProductForm open={true} onClose={handleClose} />);

      // Fill basic details
      const nameInput = await screen.findByLabelText(/Creation Title/i);
      fireEvent.change(nameInput, { target: { value: 'Heritage Bridal Lehenga' } });

      const skuInput = screen.getByLabelText(/SKU \/ Reference Code/i);
      fireEvent.change(skuInput, { target: { value: 'SABYA-REF-01' } });

      const brandInput = screen.getByLabelText(/Maison \/ Brand/i);
      fireEvent.change(brandInput, { target: { value: 'Sabyasachi' } });

      const categorySelect = screen.getByLabelText(/Primary Category/i);
      fireEvent.mouseDown(categorySelect);
      const clothingOption = await screen.findByRole('option', { name: 'Clothing' });
      fireEvent.click(clothingOption);

      // Price is 0
      const priceInput = screen.getByLabelText(/Price \(INR\)/i);
      fireEvent.change(priceInput, { target: { value: '0' } });

      // Switch to Tab 3
      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // Select referral mode
      const fulfillmentSelect = screen.getByLabelText(/Fulfillment & Checkout Mode/i);
      fireEvent.mouseDown(fulfillmentSelect);
      const referralOption = await screen.findByRole('option', {
        name: /External Maison Referral & Inquiry/i,
      });
      fireEvent.click(referralOption);

      // Submit with empty destination URL
      const saveBtn = screen.getByRole('button', { name: /create creation/i });
      fireEvent.click(saveBtn);

      expect(
        await screen.findByText(/Destination URL is required for external maison referral/i)
      ).toBeInTheDocument();
      expect(ProductService.createProduct).not.toHaveBeenCalled();
    });

    it('prevents submission when destination URL is not HTTPS', async () => {
      const handleClose = vi.fn();
      renderComponent(<AdminProductForm open={true} onClose={handleClose} />);

      const nameInput = await screen.findByLabelText(/Creation Title/i);
      fireEvent.change(nameInput, { target: { value: 'Heritage Bridal Lehenga' } });

      const skuInput = screen.getByLabelText(/SKU \/ Reference Code/i);
      fireEvent.change(skuInput, { target: { value: 'SABYA-REF-01' } });

      const brandInput = screen.getByLabelText(/Maison \/ Brand/i);
      fireEvent.change(brandInput, { target: { value: 'Sabyasachi' } });

      const categorySelect = screen.getByLabelText(/Primary Category/i);
      fireEvent.mouseDown(categorySelect);
      const clothingOption = await screen.findByRole('option', { name: 'Clothing' });
      fireEvent.click(clothingOption);

      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, {
        target: { value: 'http://www.sabyasachi.com/collection/heritage' },
      });

      const saveBtn = screen.getByRole('button', { name: /create creation/i });
      fireEvent.click(saveBtn);

      expect(
        await screen.findByText(/must use secure HTTPS protocol for production brand referrals/i)
      ).toBeInTheDocument();
      expect(ProductService.createProduct).not.toHaveBeenCalled();
    });

    it('prevents submission when destination URL has a cross-brand mismatch', async () => {
      const handleClose = vi.fn();
      renderComponent(<AdminProductForm open={true} onClose={handleClose} />);

      const nameInput = await screen.findByLabelText(/Creation Title/i);
      fireEvent.change(nameInput, { target: { value: 'Heritage Bridal Lehenga' } });

      const skuInput = screen.getByLabelText(/SKU \/ Reference Code/i);
      fireEvent.change(skuInput, { target: { value: 'SABYA-REF-01' } });

      const brandInput = screen.getByLabelText(/Maison \/ Brand/i);
      fireEvent.change(brandInput, { target: { value: 'Sabyasachi' } });

      const categorySelect = screen.getByLabelText(/Primary Category/i);
      fireEvent.mouseDown(categorySelect);
      const clothingOption = await screen.findByRole('option', { name: 'Clothing' });
      fireEvent.click(clothingOption);

      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://www.taruntahiliani.com/collections/bridal' },
      });

      const saveBtn = screen.getByRole('button', { name: /create creation/i });
      fireEvent.click(saveBtn);

      expect(
        await screen.findByText(/Cross-Brand Destination Mismatch/i)
      ).toBeInTheDocument();
      expect(ProductService.createProduct).not.toHaveBeenCalled();
    });

    it('prevents submission when referral mode has a positive price', async () => {
      const handleClose = vi.fn();
      renderComponent(<AdminProductForm open={true} onClose={handleClose} />);

      const nameInput = await screen.findByLabelText(/Creation Title/i);
      fireEvent.change(nameInput, { target: { value: 'Heritage Bridal Lehenga' } });

      const skuInput = screen.getByLabelText(/SKU \/ Reference Code/i);
      fireEvent.change(skuInput, { target: { value: 'SABYA-REF-01' } });

      const brandInput = screen.getByLabelText(/Maison \/ Brand/i);
      fireEvent.change(brandInput, { target: { value: 'Sabyasachi' } });

      const categorySelect = screen.getByLabelText(/Primary Category/i);
      fireEvent.mouseDown(categorySelect);
      const clothingOption = await screen.findByRole('option', { name: 'Clothing' });
      fireEvent.click(clothingOption);

      // Positive price on Tab 1
      const priceInput = screen.getByLabelText(/Price \(INR\)/i);
      fireEvent.change(priceInput, { target: { value: '350000' } });

      // Navigate to Tab 3 and set referral URL
      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://www.sabyasachi.com/collection/heritage-bridal/' },
      });

      const saveBtn = screen.getByRole('button', { name: /create creation/i });
      fireEvent.click(saveBtn);

      expect(
        await screen.findByText(/cannot have a positive purchase price/i)
      ).toBeInTheDocument();
      expect(ProductService.createProduct).not.toHaveBeenCalled();
    });

    it('prevents submission when referral mode has Verified Atelier Price status', async () => {
      const handleClose = vi.fn();
      renderComponent(<AdminProductForm open={true} onClose={handleClose} />);

      const nameInput = await screen.findByLabelText(/Creation Title/i);
      fireEvent.change(nameInput, { target: { value: 'Heritage Bridal Lehenga' } });

      const skuInput = screen.getByLabelText(/SKU \/ Reference Code/i);
      fireEvent.change(skuInput, { target: { value: 'SABYA-REF-01' } });

      const brandInput = screen.getByLabelText(/Maison \/ Brand/i);
      fireEvent.change(brandInput, { target: { value: 'Sabyasachi' } });

      const categorySelect = screen.getByLabelText(/Primary Category/i);
      fireEvent.mouseDown(categorySelect);
      const clothingOption = await screen.findByRole('option', { name: 'Clothing' });
      fireEvent.click(clothingOption);

      const priceInput = screen.getByLabelText(/Price \(INR\)/i);
      fireEvent.change(priceInput, { target: { value: '0' } });

      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://www.sabyasachi.com/collection/heritage-bridal/' },
      });

      // Explicitly set priceVerificationStatus to VERIFIED_ATELIER_PRICE
      const statusSelect = screen.getByLabelText(/Price Verification Status/i);
      fireEvent.mouseDown(statusSelect);
      const verifiedOption = await screen.findByRole('option', {
        name: /Verified Atelier Price \(Orderable\)/i,
      });
      fireEvent.click(verifiedOption);

      const saveBtn = screen.getByRole('button', { name: /create creation/i });
      fireEvent.click(saveBtn);

      expect(
        await screen.findByText(/cannot have Price Verification Status set to 'Verified Atelier Price'/i)
      ).toBeInTheDocument();
      expect(ProductService.createProduct).not.toHaveBeenCalled();
    });
  });

  describe('Switching to Internal Purchase Mode Safety', () => {
    it('blocks switching to Internal Purchase mode when destination URL remains', async () => {
      const existingReferral: Product = {
        id: 'prod-switch-01',
        sku: 'SABYA-REF-02',
        name: 'Royal Zardozi Saree',
        price: 50000,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        status: 'ACTIVE',
        attributes: JSON.stringify({
          isReferral: true,
          fulfillmentType: 'REFERRAL_LINK',
          destinationUrl: 'https://www.sabyasachi.com/collection/sarees',
          destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
          priceVerificationStatus: 'PRICE_UPON_INQUIRY',
        }),
      };

      renderComponent(
        <AdminProductForm open={true} onClose={vi.fn()} product={existingReferral} />
      );

      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // Attempt to switch to Internal Purchase while destination URL is present
      const fulfillmentSelect = screen.getByLabelText(/Fulfillment & Checkout Mode/i);
      fireEvent.mouseDown(fulfillmentSelect);
      const internalOption = await screen.findByRole('option', {
        name: /Internal Atelier Purchase/i,
      });
      fireEvent.click(internalOption);

      expect(
        await screen.findByText(/Remove referral destination URL before switching/i)
      ).toBeInTheDocument();

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      expect(ProductService.updateProduct).not.toHaveBeenCalled();
    });

    it('blocks switching to Internal Purchase mode when price is zero or missing', async () => {
      const existingInquiry: Product = {
        id: 'prod-switch-02',
        sku: 'SABYA-INQ-02',
        name: 'Couture Sherwani',
        price: 0,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        status: 'ACTIVE',
        attributes: JSON.stringify({
          isReferral: true,
          fulfillmentType: 'REFERRAL_LINK',
          priceVerificationStatus: 'PRICE_UPON_INQUIRY',
        }),
      };

      renderComponent(
        <AdminProductForm open={true} onClose={vi.fn()} product={existingInquiry} />
      );

      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      const fulfillmentSelect = screen.getByLabelText(/Fulfillment & Checkout Mode/i);
      fireEvent.mouseDown(fulfillmentSelect);
      const internalOption = await screen.findByRole('option', {
        name: /Internal Atelier Purchase/i,
      });
      fireEvent.click(internalOption);

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      expect(
        await screen.findByText(/require an authoritative transaction price greater than ₹0/i)
      ).toBeInTheDocument();
      expect(ProductService.updateProduct).not.toHaveBeenCalled();
    });

    it('blocks switching to Internal Purchase mode when editorial concept remains active', async () => {
      const editorialProduct: Product = {
        id: 'prod-switch-03',
        sku: 'SABYA-ED-01',
        name: 'Runway Showcase Piece',
        price: 150000,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        status: 'ACTIVE',
        attributes: JSON.stringify({
          isEditorialConcept: true,
          editorialDisclaimer: 'Runway archival sample piece',
        }),
      };

      renderComponent(
        <AdminProductForm open={true} onClose={vi.fn()} product={editorialProduct} />
      );

      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // fulfillmentMode is INTERNAL_PURCHASE but editorial flag is active
      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      expect(
        await screen.findByText(/Remove Editorial Concept flag before switching/i)
      ).toBeInTheDocument();
      expect(ProductService.updateProduct).not.toHaveBeenCalled();
    });

    it('cleanly converts to Internal Purchase mode when all referral metadata is stripped and price is positive', async () => {
      const existingReferral: Product = {
        id: 'prod-switch-04',
        sku: 'SABYA-CLEAN-01',
        name: 'Classic Silk Kurta',
        price: 0,
        currency: 'INR',
        brand: 'Sabyasachi',
        categoryId: BACKEND_CATEGORY_UUIDS.CLOTHING,
        status: 'ACTIVE',
        attributes: JSON.stringify({
          isReferral: true,
          fulfillmentType: 'REFERRAL_LINK',
          destinationUrl: 'https://www.sabyasachi.com/collection/kurta',
          destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
          priceVerificationStatus: 'PRICE_UPON_INQUIRY',
          isEditorialConcept: true,
          editorialDisclaimer: 'Archive concept',
        }),
      };

      vi.mocked(ProductService.updateProduct).mockResolvedValue(existingReferral);

      renderComponent(
        <AdminProductForm open={true} onClose={vi.fn()} product={existingReferral} />
      );

      // Set positive price on Tab 1
      const priceInput = await screen.findByLabelText(/Price \(INR\)/i);
      fireEvent.change(priceInput, { target: { value: '45000' } });

      // Navigate to Tab 3
      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      // Clear destination URL
      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, { target: { value: '' } });

      // Clear editorial concept checkbox
      const editorialCheckbox = screen.getByRole('checkbox', { name: /Flag as Editorial Concept/i });
      fireEvent.click(editorialCheckbox);

      // Switch fulfillment mode to Internal Purchase
      const fulfillmentSelect = screen.getByLabelText(/Fulfillment & Checkout Mode/i);
      fireEvent.mouseDown(fulfillmentSelect);
      const internalOption = await screen.findByRole('option', {
        name: /Internal Atelier Purchase/i,
      });
      fireEvent.click(internalOption);

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(ProductService.updateProduct).toHaveBeenCalled();
      });

      const payload = vi.mocked(ProductService.updateProduct).mock.calls[0][1];
      expect(payload.price).toBe(45000);
      const attrs = JSON.parse(payload.attributes!);
      expect(attrs.isReferral).toBeUndefined();
      expect(attrs.fulfillmentType).toBeUndefined();
      expect(attrs.destinationUrl).toBeUndefined();
      expect(attrs.destinationType).toBeUndefined();
      expect(attrs.isEditorialConcept).toBeUndefined();
      expect(attrs.priceVerificationStatus).toBe('VERIFIED_ATELIER_PRICE');
    });
  });

  describe('Successful Referral Creation Contract', () => {
    it('successfully creates a valid referral product with complete metadata', async () => {
      const handleClose = vi.fn();
      vi.mocked(ProductService.createProduct).mockResolvedValue({} as Product);

      renderComponent(<AdminProductForm open={true} onClose={handleClose} />);

      // Fill Tab 1
      const nameInput = await screen.findByLabelText(/Creation Title/i);
      fireEvent.change(nameInput, { target: { value: 'Haute Bridal Velvet Lehenga' } });

      const skuInput = screen.getByLabelText(/SKU \/ Reference Code/i);
      fireEvent.change(skuInput, { target: { value: 'SABYA-LEH-001' } });

      const brandInput = screen.getByLabelText(/Maison \/ Brand/i);
      fireEvent.change(brandInput, { target: { value: 'Sabyasachi' } });

      const categorySelect = screen.getByLabelText(/Primary Category/i);
      fireEvent.mouseDown(categorySelect);
      const clothingOption = await screen.findByRole('option', { name: 'Clothing' });
      fireEvent.click(clothingOption);

      const priceInput = screen.getByLabelText(/Price \(INR\)/i);
      fireEvent.change(priceInput, { target: { value: '0' } });

      // Tab 3
      const referralTab = await screen.findByRole('tab', { name: /curation & referrals/i });
      fireEvent.click(referralTab);

      const urlInput = screen.getByLabelText(/referral destination url/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://www.sabyasachi.com/collection/heritage-bridal/' },
      });

      const statusSelect = screen.getByLabelText(/Price Verification Status/i);
      fireEvent.mouseDown(statusSelect);
      const inqOption = await screen.findByRole('option', {
        name: /Price Upon Atelier Inquiry/i,
      });
      fireEvent.click(inqOption);

      const saveBtn = screen.getByRole('button', { name: /create creation/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(ProductService.createProduct).toHaveBeenCalled();
      });

      const payload = vi.mocked(ProductService.createProduct).mock.calls[0][0];
      expect(payload.price).toBe(0);
      const attrs = JSON.parse(payload.attributes!);
      expect(attrs.isReferral).toBe(true);
      expect(attrs.fulfillmentType).toBe('REFERRAL_LINK');
      expect(attrs.destinationUrl).toBe('https://www.sabyasachi.com/collection/heritage-bridal/');
      expect(attrs.destinationType).toBe('OFFICIAL_CATEGORY_DESTINATION');
      expect(attrs.priceVerificationStatus).toBe('PRICE_UPON_INQUIRY');
    });
  });
});
