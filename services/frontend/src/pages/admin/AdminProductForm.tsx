import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Grid,
} from '@mui/material';
import {
  VerifiedUserOutlined,
  WarningAmberOutlined,
  CancelOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ProductService } from '../../services/ProductService';
import type { Product } from '../../types/product';
import { verifyBrandDomain, type DomainVerificationResult } from '../../utils/domainVerifier';
import { BRANDS_DATA } from '../../data/brandsData';
import { lumierePalette } from '../../styles/theme';

interface AdminProductFormProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  product?: Product;
}

const SUBCATEGORY_OPTIONS = [
  'Bridal Lehengas',
  'Sarees',
  'Haute Couture',
  'Sherwanis & Bandhgalas',
  'Outerwear',
  'Sartorial Suiting',
  'Tailoring & Suiting',
  'Couture Pret',
  'Heritage Festive',
  'Accessories',
  'Footwear',
];

const AUDIENCE_OPTIONS = ['Women', 'Men', 'Kids', 'Unisex'];

const AdminProductForm: React.FC<AdminProductFormProps> = ({ open, onClose, product }) => {
  const isEditing = !!product;
  const [activeTab, setActiveTab] = useState(0);

  // Core product state matching backend ProductRequest
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '',
    name: '',
    description: '',
    price: 0,
    brand: '',
    categoryId: '',
    status: 'ACTIVE',
    imageUrl: '',
  });

  // Clothing structured attributes
  const [audience, setAudience] = useState('Women');
  const [subcategory, setSubcategory] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');

  // Atelier & Referral attributes
  const [fulfillmentMode, setFulfillmentMode] = useState<'REFERRAL_LINK' | 'INTERNAL_PURCHASE'>('INTERNAL_PURCHASE');
  const [isEditorialConcept, setIsEditorialConcept] = useState(false);
  const [editorialDisclaimer, setEditorialDisclaimer] = useState('');
  const [priceVerificationStatus, setPriceVerificationStatus] = useState<string>('VERIFIED_ATELIER_PRICE');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [destinationType, setDestinationType] = useState<string>('OFFICIAL_CATEGORY_DESTINATION');
  const [brandSlug, setBrandSlug] = useState('');

  // Raw attributes preserved from original product to prevent data loss of unknown fields
  const [preservedUnknownAttributes, setPreservedUnknownAttributes] = useState<Record<string, any>>({});

  const [formError, setFormError] = useState<string | null>(null);

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories(),
  });

  // Load product data when opened
  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setFormError(null);

      if (product) {
        setFormData({
          id: product.id,
          sku: product.sku || '',
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? 0,
          brand: product.brand || '',
          categoryId: product.categoryId || '',
          status: product.status || 'ACTIVE',
          imageUrl: product.imageUrl || '',
        });

        // Safely parse attributes JSON without losing unknown properties
        let parsedAttrs: Record<string, any> = {};
        if (product.attributes) {
          try {
            parsedAttrs = typeof product.attributes === 'string'
              ? JSON.parse(product.attributes)
              : product.attributes;
          } catch (err) {
            console.warn('Could not parse attributes JSON on product:', err);
          }
        }

        // Determine if existing product is referral/inquiry
        const isReferralInitial = Boolean(
          parsedAttrs.isReferral === true ||
          parsedAttrs.fulfillmentType === 'REFERRAL_LINK' ||
          parsedAttrs.fulfillmentType === 'EXTERNAL_ATELIER_REFERRAL' ||
          parsedAttrs.fulfillmentType === 'EXTERNAL_REFERRAL' ||
          parsedAttrs.destinationUrl ||
          parsedAttrs.priceVerificationStatus === 'PRICE_UPON_INQUIRY' ||
          parsedAttrs.priceVerificationStatus === 'ILLUSTRATIVE_ESTIMATE' ||
          (product.price !== undefined && product.price <= 0)
        );

        setFulfillmentMode(isReferralInitial ? 'REFERRAL_LINK' : 'INTERNAL_PURCHASE');

        // Extract known clothing fields
        setAudience(parsedAttrs.audience || 'Women');
        setSubcategory(parsedAttrs.subcategory || product.categoryName || '');
        setFabric(parsedAttrs.fabric || parsedAttrs.material || '');
        setFit(parsedAttrs.fit || '');
        setSizes(
          Array.isArray(parsedAttrs.availableSizes)
            ? parsedAttrs.availableSizes.join(', ')
            : parsedAttrs.sizes || ''
        );
        setColors(
          Array.isArray(parsedAttrs.colors)
            ? parsedAttrs.colors.join(', ')
            : parsedAttrs.colors || ''
        );

        // Extract atelier & referral metadata
        setIsEditorialConcept(Boolean(parsedAttrs.isEditorialConcept));
        setEditorialDisclaimer(parsedAttrs.editorialDisclaimer || '');
        setPriceVerificationStatus(
          parsedAttrs.priceVerificationStatus ||
          (isReferralInitial ? 'PRICE_UPON_INQUIRY' : 'VERIFIED_ATELIER_PRICE')
        );
        setDestinationUrl(parsedAttrs.destinationUrl || '');
        setDestinationType(parsedAttrs.destinationType || 'OFFICIAL_CATEGORY_DESTINATION');
        setBrandSlug(parsedAttrs.brandSlug || '');

        // Preserve all other properties that are not handled by our form
        const knownKeys = new Set([
          'audience',
          'subcategory',
          'fabric',
          'material',
          'fit',
          'sizes',
          'availableSizes',
          'colors',
          'isEditorialConcept',
          'editorialDisclaimer',
          'priceVerificationStatus',
          'destinationUrl',
          'destinationType',
          'brandSlug',
          'isReferral',
          'fulfillmentType',
        ]);

        const unknownEntries: Record<string, any> = {};
        Object.entries(parsedAttrs).forEach(([k, v]) => {
          if (!knownKeys.has(k)) {
            unknownEntries[k] = v;
          }
        });
        setPreservedUnknownAttributes(unknownEntries);
      } else {
        // Reset to clean creation template
        setFormData({
          sku: '',
          name: '',
          description: '',
          price: 0,
          brand: '',
          categoryId: '',
          status: 'ACTIVE',
          imageUrl: '',
        });
        setFulfillmentMode('INTERNAL_PURCHASE');
        setAudience('Women');
        setSubcategory('');
        setFabric('');
        setFit('');
        setSizes('');
        setColors('');
        setIsEditorialConcept(false);
        setEditorialDisclaimer('');
        setPriceVerificationStatus('VERIFIED_ATELIER_PRICE');
        setDestinationUrl('');
        setDestinationType('OFFICIAL_CATEGORY_DESTINATION');
        setBrandSlug('');
        setPreservedUnknownAttributes({});
      }
    }
  }, [product, open]);

  // Live domain verification
  const domainVerification: DomainVerificationResult | null = useMemo(() => {
    if (!destinationUrl.trim()) return null;
    return verifyBrandDomain(destinationUrl.trim(), brandSlug || formData.brand);
  }, [destinationUrl, brandSlug, formData.brand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleDestinationUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDestinationUrl(val);
    if (val.trim()) {
      setFulfillmentMode('REFERRAL_LINK');
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) => ProductService.createProduct(data),
    onSuccess: () => {
      onClose(true);
    },
    onError: (error: any) => {
      console.error('Failed to create product:', error);
      setFormError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Failed to create product. Please verify all fields and try again.'
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Product>) => ProductService.updateProduct(product!.id, data),
    onSuccess: () => {
      onClose(true);
    },
    onError: (error: any) => {
      console.error('Failed to update product:', error);
      setFormError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Failed to update product. Please verify all fields and try again.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic required field validations
    if (!formData.name?.trim()) {
      setFormError('Creation Title is required.');
      setActiveTab(0);
      return;
    }
    if (!formData.sku?.trim()) {
      setFormError('SKU / Reference Code is required.');
      setActiveTab(0);
      return;
    }
    if (!formData.categoryId) {
      setFormError('Primary Category is required.');
      setActiveTab(0);
      return;
    }

    const priceNum = Number.isNaN(Number(formData.price)) ? 0 : Number(formData.price);

    // Strict validation based on fulfillment mode
    if (fulfillmentMode === 'REFERRAL_LINK') {
      // 1. Destination URL is strictly required
      const trimmedUrl = destinationUrl.trim();
      if (!trimmedUrl) {
        setFormError('Destination URL is required for external maison referral & inquiry products.');
        setActiveTab(2);
        return;
      }

      // 2. Protocol must be HTTPS
      if (!trimmedUrl.toLowerCase().startsWith('https://')) {
        setFormError('Destination URL must use secure HTTPS protocol for production brand referrals.');
        setActiveTab(2);
        return;
      }

      // 3. Domain verification & cross-brand match
      const result = verifyBrandDomain(trimmedUrl, brandSlug || formData.brand);
      if (result.securityStatus === 'INSECURE_PROTOCOL') {
        setFormError('Destination URL must use secure HTTPS protocol for production brand referrals.');
        setActiveTab(2);
        return;
      }
      if (result.securityStatus === 'CROSS_BRAND_MISMATCH') {
        setFormError(
          `Cross-Brand Destination Mismatch: Destination links to ${result.matchedBrandName}, but product is listed under ${formData.brand || 'a different brand'}.`
        );
        setActiveTab(2);
        return;
      }
      if (!result.isValid) {
        setFormError(`Destination URL Security Error: ${result.reason || result.badgeLabel}`);
        setActiveTab(2);
        return;
      }

      // 4. Destination Link Type is required
      if (!destinationType || !destinationType.trim()) {
        setFormError('Destination Link Type must be specified for external maison referrals.');
        setActiveTab(2);
        return;
      }

      // 5. Price conflicts for referral mode
      if (priceNum < 0) {
        setFormError('Price cannot be negative.');
        setActiveTab(0);
        return;
      }
      if (priceNum > 0) {
        setFormError(
          'Referral & inquiry products cannot have a positive purchase price. Set price to ₹0 (Price Upon Inquiry / Illustrative Estimate) or switch fulfillment mode to Internal Purchase.'
        );
        setActiveTab(0);
        return;
      }

      // 6. Inquiry status conflict
      if (priceVerificationStatus === 'VERIFIED_ATELIER_PRICE') {
        setFormError(
          "Referral & inquiry products cannot have Price Verification Status set to 'Verified Atelier Price'. Select 'Price Upon Atelier Inquiry' or 'Illustrative Estimate'."
        );
        setActiveTab(2);
        return;
      }
      if (
        priceVerificationStatus !== 'PRICE_UPON_INQUIRY' &&
        priceVerificationStatus !== 'ILLUSTRATIVE_ESTIMATE'
      ) {
        setFormError(
          "Referral products require Price Verification Status to be 'Price Upon Atelier Inquiry' or 'Illustrative Estimate'."
        );
        setActiveTab(2);
        return;
      }
    } else if (fulfillmentMode === 'INTERNAL_PURCHASE') {
      // 1. Destination URL must not be present
      if (destinationUrl.trim()) {
        setFormError('Deliberate Handling Required: Remove referral destination URL before switching product to Internal Purchase mode.');
        setActiveTab(2);
        return;
      }

      // 2. Price must be strictly positive
      if (priceNum <= 0) {
        setFormError('Internal purchase creations require an authoritative transaction price greater than ₹0.');
        setActiveTab(0);
        return;
      }

      // 3. Price verification status cannot be inquiry or estimate
      if (priceVerificationStatus === 'PRICE_UPON_INQUIRY' || priceVerificationStatus === 'ILLUSTRATIVE_ESTIMATE') {
        setFormError('Internal purchase creations cannot have Price Verification Status set to Price Upon Inquiry or Illustrative Estimate. Set status to Verified Atelier Price.');
        setActiveTab(2);
        return;
      }

      // 4. Editorial concept must not be flagged
      if (isEditorialConcept) {
        setFormError('Deliberate Handling Required: Remove Editorial Concept flag before switching product to Internal Purchase mode.');
        setActiveTab(2);
        return;
      }
    } else {
      setFormError('Invalid fulfillment mode selected.');
      return;
    }

    // Prepare attributes
    const mergedAttributes: Record<string, any> = {
      ...preservedUnknownAttributes,
      audience,
      subcategory: subcategory.trim() || undefined,
      fabric: fabric.trim() || undefined,
      fit: fit.trim() || undefined,
      sizes: sizes.trim() || undefined,
      colors: colors.trim() || undefined,
    };

    if (fulfillmentMode === 'REFERRAL_LINK') {
      mergedAttributes.isReferral = true;
      mergedAttributes.fulfillmentType = 'REFERRAL_LINK';
      mergedAttributes.destinationUrl = destinationUrl.trim();
      mergedAttributes.destinationType = destinationType;
      mergedAttributes.priceVerificationStatus = priceVerificationStatus;
      mergedAttributes.isEditorialConcept = Boolean(isEditorialConcept);
      mergedAttributes.editorialDisclaimer = editorialDisclaimer.trim() || undefined;
      mergedAttributes.brandSlug = brandSlug.trim() || undefined;
    } else {
      // Internal purchase - ensure zero referral leakage
      delete mergedAttributes.isReferral;
      delete mergedAttributes.fulfillmentType;
      delete mergedAttributes.destinationUrl;
      delete mergedAttributes.destinationType;
      delete mergedAttributes.isEditorialConcept;
      delete mergedAttributes.editorialDisclaimer;
      delete mergedAttributes.brandSlug;
      mergedAttributes.priceVerificationStatus = 'VERIFIED_ATELIER_PRICE';
    }

    // Clean undefined fields from JSON
    Object.keys(mergedAttributes).forEach((key) => {
      if (mergedAttributes[key] === undefined) {
        delete mergedAttributes[key];
      }
    });

    const payload: Partial<Product> = {
      ...formData,
      price: priceNum,
      attributes: JSON.stringify(mergedAttributes),
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 0.5 },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="overline" color="secondary">
              LUMIÈRE CATALOG MANAGEMENT
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {isEditing ? `Edit Creation: ${product?.name}` : 'Register New Atelier Creation'}
            </Typography>
          </Box>
          {formData.status && (
            <Chip
              label={formData.status}
              size="small"
              sx={{ fontWeight: 700, bgcolor: lumierePalette.alabaster }}
            />
          )}
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="1. Core Details" sx={{ fontWeight: 600, textTransform: 'none' }} />
            <Tab label="2. Clothing Attributes" sx={{ fontWeight: 600, textTransform: 'none' }} />
            <Tab label="3. Curation & Referrals" sx={{ fontWeight: 600, textTransform: 'none' }} />
          </Tabs>
        </Box>

        <DialogContent dividers sx={{ minHeight: 400 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          {/* TAB 1: CORE PRODUCT DETAILS */}
          {activeTab === 0 && (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  name="name"
                  label="Creation Title"
                  fullWidth
                  required
                  placeholder="e.g. Royal Heritage Zardozi Velvet Lehenga"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="sku"
                  label="SKU / Reference Code"
                  fullWidth
                  required
                  placeholder="e.g. SABYA-HL-01"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="brand"
                  label="Maison / Brand"
                  fullWidth
                  placeholder="e.g. Sabyasachi, Tarun Tahiliani"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="categoryId"
                  label="Primary Category"
                  select
                  fullWidth
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={loadingCategories}
                >
                  {categories?.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                  {!loadingCategories && categories?.length === 0 && (
                    <MenuItem value="" disabled>
                      No categories available
                    </MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="price"
                  label="Price (INR)"
                  type="number"
                  fullWidth
                  required
                  slotProps={{ htmlInput: { step: '1', min: '0' } }}
                  value={formData.price}
                  onChange={handleChange}
                  helperText={
                    priceVerificationStatus === 'PRICE_UPON_INQUIRY'
                      ? 'Price upon inquiry accepts ₹0 as placeholder'
                      : 'Authoritative transaction price'
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="status"
                  label="Lifecycle Status"
                  select
                  fullWidth
                  required
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="ACTIVE">Active (In Catalog)</MenuItem>
                  <MenuItem value="INACTIVE">Inactive (Archived)</MenuItem>
                  <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  name="imageUrl"
                  label="Hero Image URL"
                  fullWidth
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  name="description"
                  label="Artisanal Description & Provenance"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Detail the craftsmanship, embroidery, and atelier inspiration..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}

          {/* TAB 2: CLOTHING SPECIFIC ATTRIBUTES */}
          {activeTab === 1 && (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Structure fashion and tailoring specifications for runway discovery and size filtering.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Audience / Silhouette"
                  select
                  fullWidth
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  {AUDIENCE_OPTIONS.map((aud) => (
                    <MenuItem key={aud} value={aud}>
                      {aud}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Subcategory / Capsule"
                  select
                  fullWidth
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  helperText="Select or customize runway subcategory"
                >
                  {SUBCATEGORY_OPTIONS.map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Fabric & Weave"
                  fullWidth
                  placeholder="e.g. Mulberry Katan Silk, Velvet, Chanderi"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Fit & Tailoring Cut"
                  fullWidth
                  placeholder="e.g. Bespoke Tailored, Draped, Structured Fit"
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Available Sizing"
                  fullWidth
                  placeholder="e.g. XS, S, M, L, XL or Bespoke Sizing"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  helperText="Comma-separated sizing options"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Color Palette"
                  fullWidth
                  placeholder="e.g. Crimson Red, Noir, Antique Gold"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  helperText="Comma-separated colors"
                />
              </Grid>

              {Object.keys(preservedUnknownAttributes).length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                    <strong>Preserved Custom Attributes:</strong>{' '}
                    {Object.keys(preservedUnknownAttributes).join(', ')} (Retained automatically upon save)
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {/* TAB 3: CURATION, EDITORIAL, & BRAND REFERRALS */}
          {activeTab === 2 && (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ borderRadius: 2, mb: 1 }}>
                  <strong>External Atelier Referral Safeguards:</strong> Creations with an external destination URL or marked as inquiry-only will be isolated from internal checkout and routed directly to official brand destinations.
                </Alert>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Fulfillment & Checkout Mode"
                  select
                  fullWidth
                  value={fulfillmentMode}
                  onChange={(e) => {
                    const newMode = e.target.value as 'REFERRAL_LINK' | 'INTERNAL_PURCHASE';
                    if (newMode === 'INTERNAL_PURCHASE') {
                      if (destinationUrl.trim()) {
                        setFormError(
                          'Deliberate Handling Required: Remove referral destination URL before switching product to Internal Purchase mode.'
                        );
                        return;
                      }
                      if (priceVerificationStatus === 'PRICE_UPON_INQUIRY' || priceVerificationStatus === 'ILLUSTRATIVE_ESTIMATE') {
                        setPriceVerificationStatus('VERIFIED_ATELIER_PRICE');
                      }
                    }
                    setFormError(null);
                    setFulfillmentMode(newMode);
                  }}
                  helperText="Controls checkout routing: external maison referral / inquiry vs standard internal bag & checkout"
                >
                  <MenuItem value="REFERRAL_LINK">
                    External Maison Referral & Inquiry (Directs to Brand Portal or Atelier Consultation)
                  </MenuItem>
                  <MenuItem value="INTERNAL_PURCHASE">
                    Internal Atelier Purchase (Standard Bag & Checkout)
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Price Verification Status"
                  select
                  fullWidth
                  value={priceVerificationStatus}
                  onChange={(e) => setPriceVerificationStatus(e.target.value)}
                  helperText="Defines how client pricing is displayed and settled"
                >
                  <MenuItem value="VERIFIED_ATELIER_PRICE">Verified Atelier Price (Orderable)</MenuItem>
                  <MenuItem value="PRICE_UPON_INQUIRY">Price Upon Atelier Inquiry (Referral Only)</MenuItem>
                  <MenuItem value="ILLUSTRATIVE_ESTIMATE">Illustrative Estimate (Consultation)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Brand Slug (Security Match)"
                  select
                  fullWidth
                  value={brandSlug}
                  onChange={(e) => setBrandSlug(e.target.value)}
                  helperText="Used to verify domain boundaries against approved fashion houses"
                >
                  <MenuItem value="">Unspecified / External</MenuItem>
                  {BRANDS_DATA.map((b) => (
                    <MenuItem key={b.slug} value={b.slug}>
                      {b.name} ({b.verifiedDomain})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Referral Destination URL"
                  fullWidth
                  placeholder="https://www.sabyasachi.com/collection/..."
                  value={destinationUrl}
                  onChange={handleDestinationUrlChange}
                  helperText="Official verified HTTPS maison URL for direct acquisition"
                />
              </Grid>

              {/* Live Domain Verification Result Badge */}
              {domainVerification && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor:
                        domainVerification.badgeSeverity === 'success'
                          ? '#E6F4EA'
                          : domainVerification.badgeSeverity === 'error'
                          ? '#FEE2E2'
                          : '#FEF3C7',
                      border: `1px solid ${
                        domainVerification.badgeSeverity === 'success'
                          ? '#CEEAD6'
                          : domainVerification.badgeSeverity === 'error'
                          ? '#FECACA'
                          : '#FDE68A'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    {domainVerification.badgeSeverity === 'success' ? (
                      <CheckCircleOutlined sx={{ color: '#137333' }} />
                    ) : domainVerification.badgeSeverity === 'error' ? (
                      <CancelOutlined sx={{ color: '#B91C1C' }} />
                    ) : (
                      <WarningAmberOutlined sx={{ color: '#B45309' }} />
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {domainVerification.badgeLabel}
                      </Typography>
                      {domainVerification.reason && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {domainVerification.reason}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                        Security Verification Notice: Domain boundary validation confirms authorized maison hostname only. Specific product deep links and live atelier pricing are not automatically certified by domain matching.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Destination Link Type"
                  select
                  fullWidth
                  value={destinationType}
                  onChange={(e) => setDestinationType(e.target.value)}
                  disabled={!destinationUrl.trim()}
                >
                  <MenuItem value="OFFICIAL_CATEGORY_DESTINATION">Official Category Destination</MenuItem>
                  <MenuItem value="EXACT_PRODUCT_PAGE">Exact Product Runway Page</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ pt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isEditorialConcept}
                        onChange={(e) => {
                          setIsEditorialConcept(e.target.checked);
                          if (!e.target.checked) {
                            setEditorialDisclaimer('');
                          }
                        }}
                        sx={{ color: lumierePalette.crimson, '&.Mui-checked': { color: lumierePalette.crimson } }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Flag as Editorial Concept
                      </Typography>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                    Marks piece as runway inspiration with editorial attribution
                  </Typography>
                </Box>
              </Grid>

              {isEditorialConcept && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Editorial Disclaimer & Concept Context"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="e.g. Representative haute bridal silhouette from the atelier couture archive..."
                    value={editorialDisclaimer}
                    onChange={(e) => setEditorialDisclaimer(e.target.value)}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => onClose()} color="inherit" disabled={isPending}>
            Cancel
          </Button>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {activeTab > 0 && (
              <Button onClick={() => setActiveTab((prev) => prev - 1)} variant="outlined" disabled={isPending}>
                Back
              </Button>
            )}
            {activeTab < 2 ? (
              <Button onClick={() => setActiveTab((prev) => prev + 1)} variant="outlined" disabled={isPending}>
                Next Step
              </Button>
            ) : null}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isPending}
              startIcon={<VerifiedUserOutlined />}
              sx={{ bgcolor: lumierePalette.noir, '&:hover': { bgcolor: '#1E1E1E' } }}
            >
              {isPending ? <CircularProgress size={20} color="inherit" /> : isEditing ? 'Save Changes' : 'Create Creation'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminProductForm;
