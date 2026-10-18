import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Grid, Typography, Button, Box, CircularProgress, 
  Breadcrumbs, Divider, IconButton, Snackbar, Alert, Accordion, 
  AccordionSummary, AccordionDetails, Chip, Tooltip 
} from '@mui/material';
import { 
  ShoppingBagOutlined, StraightenOutlined, 
  ExpandMoreOutlined, NavigateNextOutlined, FavoriteBorderOutlined, 
  Favorite, SecurityOutlined, LocalShippingOutlined, DiamondOutlined, 
  CompareArrowsOutlined, OpenInNewOutlined, VerifiedUserOutlined
} from '@mui/icons-material';
import { useProductDetails, useProducts } from '../../hooks/useProducts';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import type { RootState, AppDispatch } from '../../store';
import ProductCard from '../../components/product/ProductCard';
import { formatINR, isDemoPrice } from '../../utils/currency';
import { useComparison } from '../../context/ComparisonContext';
import { getProductByIdOrSlug, toCatalogProduct, CLOTHING_CATALOG } from '../../data/clothingCatalogData';
import { getBrandBySlug } from '../../data/brandsData';
import { verifyBrandDomain, getSafeExternalLinkAttributes } from '../../utils/domainVerifier';
import { useWishlist } from '../../utils/wishlistStorage';
import SizingMatrixModal from '../../components/sizing/SizingMatrixModal';
import { env } from '../../config/env';

export type ProductActionState = 'VALID_REFERRAL' | 'UNTRUSTED_REFERRAL' | 'INTERNAL_PURCHASE';

export interface ProductSecurityContext {
  isCuratedCatalog: boolean;
  destinationUrl?: string;
  brandSlug?: string;
  destinationType?: string;
  priceVerificationStatus?: string;
  hasReferralMetadata: boolean;
  verifiedDestinationCheck?: {
    isValid: boolean;
    isVerifiedOfficial: boolean;
    reason?: string;
    securityStatus?: string;
  };
}

/**
 * Resolves mutually exclusive product action states:
 * 1. VALID_REFERRAL: Valid HTTPS destination on approved brand domain
 * 2. UNTRUSTED_REFERRAL: Referral intent present but destination is invalid, unapproved, deceptive, or missing
 * 3. INTERNAL_PURCHASE: Strictly ordinary internal product with zero referral intent
 */
export const resolveProductActionState = (ctx: ProductSecurityContext): ProductActionState => {
  const isReferralIntent = ctx.isCuratedCatalog || ctx.hasReferralMetadata;

  if (isReferralIntent) {
    if (
      ctx.destinationUrl &&
      ctx.destinationUrl.startsWith('https://') &&
      ctx.verifiedDestinationCheck?.isValid &&
      ctx.verifiedDestinationCheck?.isVerifiedOfficial
    ) {
      return 'VALID_REFERRAL';
    }
    // Fail-closed: do not infer internal purchase when referral intent exists
    return 'UNTRUSTED_REFERRAL';
  }

  // Pure ordinary internal product
  return 'INTERNAL_PURCHASE';
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // 1. Check if ID or slug matches our curated atelier clothing catalog
  const catalogItem = id ? getProductByIdOrSlug(id) : undefined;
  
  // 2. Otherwise query backend API
  const { data: apiProduct, isLoading: isApiLoading, isError: isApiError } = useProductDetails(
    catalogItem ? '' : (id || '')
  );

  const product = catalogItem ? toCatalogProduct(catalogItem) : apiProduct;
  const isCuratedAtelier = Boolean(catalogItem);

  // Fetch related products
  const { data: relatedProductsData } = useProducts({ 
    categoryId: !catalogItem ? product?.categoryId : undefined,
    size: 5
  });
  
  const relatedProducts = catalogItem 
    ? CLOTHING_CATALOG
        .filter(p => p.id !== catalogItem.id && (p.brandId === catalogItem.brandId || p.audience === catalogItem.audience))
        .slice(0, 4)
        .map(toCatalogProduct)
    : (relatedProductsData?.content || [])
        .filter(p => p.id !== id && !p.name.toLowerCase().includes('phone') && !p.name.toLowerCase().includes('electronic'))
        .slice(0, 4);

  const dispatch = useDispatch<AppDispatch>();
  const { cartId } = useSelector((state: RootState) => state.cart);
  
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Wishlist integration
  const { isWishlisted: checkWishlisted, toggleWishlist: toggleWishlistGlobal } = useWishlist();
  const isWishlisted = product ? checkWishlisted(product.id) : false;

  // Salon Comparison
  const { addToComparison, removeFromComparison, isInComparison, setIsComparisonOpen } = useComparison();
  const comparing = product ? isInComparison(product.id) : false;

  const handleToggleComparison = () => {
    if (!product) return;
    if (comparing) {
      removeFromComparison(product.id);
      setSnackbar({ open: true, message: 'Removed piece from salon comparison', severity: 'success' });
    } else {
      const res = addToComparison(product);
      if (res.success) {
        setSnackbar({ open: true, message: 'Added piece to salon comparison', severity: 'success' });
        setIsComparisonOpen(true);
      } else {
        setSnackbar({ open: true, message: res.message || 'Unable to add to comparison', severity: 'error' });
      }
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    const added = toggleWishlistGlobal(product.id);
    setSnackbar({
      open: true,
      message: added ? 'Added to your private wishlist' : 'Removed from curated wishlist',
      severity: 'success'
    });
  };

  const handleAddToCart = async () => {
    if (!env.ENABLE_INTERNAL_CHECKOUT) {
      return;
    }
    if (!product || product.price <= 0) {
      return;
    }
    if (cartId && !adding) {
      setAdding(true);
      try {
        await dispatch(addToCart({ item: { productId: product.id, quantity } })).unwrap();
        setSnackbar({ open: true, message: `Added ${quantity} item(s) to your shopping bag`, severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err || 'Failed to add item to bag', severity: 'error' });
      } finally {
        setAdding(false);
      }
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (!catalogItem && isApiLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 2 }}>
        <CircularProgress sx={{ color: '#E50914' }} />
        <Typography variant="caption" sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Consulting the Atelier...
        </Typography>
      </Box>
    );
  }

  if (!catalogItem && (isApiError || !apiProduct)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, mb: 10, textAlign: 'center' }}>
        <Typography variant="overline" sx={{ letterSpacing: '0.2em', color: '#E50914', fontWeight: 600 }}>
          ARCHIVE INQUIRY
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', mt: 1, mb: 2 }}>
          Piece Unavailable
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          This specific creation is no longer in current circulation or the atelier record could not be retrieved.
        </Typography>
        <Button component={Link} to="/products" variant="contained" className="lumiere-red-btn lumiere-pill-btn">
          Explore Current Collection
        </Button>
      </Container>
    );
  }

  if (!product) return null;

  const productAttributes = (() => {
    if (!product?.attributes) return null;
    try {
      return JSON.parse(product.attributes);
    } catch {
      return null;
    }
  })();

  const destinationUrl = catalogItem?.destinationUrl || productAttributes?.destinationUrl;
  const brandSlug = catalogItem?.brandSlug || productAttributes?.brandSlug || (product?.brand ? product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);
  const brandName = catalogItem?.brandName || product?.brand || 'HAUTE MAISON';
  const destinationType = catalogItem?.destinationType || productAttributes?.destinationType;
  const priceVerificationStatus = catalogItem?.priceVerificationStatus || productAttributes?.priceVerificationStatus;
  const priceSource = catalogItem?.priceSource || productAttributes?.priceSource;

  const brandEntity = brandSlug ? getBrandBySlug(brandSlug) : undefined;
  const verifiedDestinationCheck = destinationUrl && brandSlug ? verifyBrandDomain(destinationUrl, brandSlug) : undefined;

  const isCuratedCatalog = Boolean(catalogItem);
  const hasReferralMetadata = Boolean(
    catalogItem ||
    destinationUrl ||
    destinationType ||
    priceVerificationStatus === 'PRICE_UPON_INQUIRY' ||
    priceVerificationStatus ||
    productAttributes?.isReferral ||
    productAttributes?.brandSlug ||
    productAttributes?.fulfillmentType === 'REFERRAL_LINK' ||
    productAttributes?.fulfillmentType === 'EXTERNAL_ATELIER_REFERRAL' ||
    productAttributes?.fulfillmentType === 'EXTERNAL_REFERRAL' ||
    productAttributes?.isEditorialConcept ||
    (product?.price !== undefined && product.price <= 0) ||
    (product?.id && product.id.startsWith('prod-'))
  );

  const isReferralIntent = isCuratedCatalog || hasReferralMetadata;

  const productActionState: ProductActionState = resolveProductActionState({
    isCuratedCatalog,
    destinationUrl,
    brandSlug,
    destinationType,
    priceVerificationStatus,
    hasReferralMetadata,
    verifiedDestinationCheck
  });

  const isPriceUponInquiry = priceVerificationStatus === 'PRICE_UPON_INQUIRY' || product.price === 0;

  const displaySizes = catalogItem?.availableSizes || (productAttributes?.sizes ? String(productAttributes.sizes).split(',').map((s: string) => s.trim()) : undefined);
  const displayColors = catalogItem?.colors || (productAttributes?.colors ? String(productAttributes.colors).split(',').map((c: string) => c.trim()) : undefined);
  const displayFabric = catalogItem?.fabric || productAttributes?.fabric;
  const displayFit = catalogItem?.fit || productAttributes?.fit;

  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const fallbackImg = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900';

  return (
    <Box sx={{ pb: 12, bgcolor: '#FAF8F5' }}>
      {/* Editorial Breadcrumbs */}
      <Box sx={{ bgcolor: '#FFFFFF', py: 2, borderBottom: '1px solid #EAE5DC', mb: 6 }}>
        <Container maxWidth="xl">
          <Breadcrumbs separator={<NavigateNextOutlined fontSize="small" sx={{ color: 'text.secondary', fontSize: '0.85rem' }} />} aria-label="breadcrumb">
            <Link to="/" style={{ textDecoration: 'none', color: '#666' }}>
              <Typography variant="caption" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', '&:hover': { color: '#E50914' } }}>
                Maison
              </Typography>
            </Link>
            <Link to="/products" style={{ textDecoration: 'none', color: '#666' }}>
              <Typography variant="caption" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', '&:hover': { color: '#E50914' } }}>
                Collections
              </Typography>
            </Link>
            {brandSlug && brandName ? (
              <Link to={`/brands/${brandSlug}`} style={{ textDecoration: 'none', color: '#B89758' }}>
                <Typography variant="caption" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {brandName}
                </Typography>
              </Link>
            ) : product.categoryName ? (
              <Link to={`/products?categoryId=${product.categoryId}`} style={{ textDecoration: 'none', color: '#666' }}>
                <Typography variant="caption" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', '&:hover': { color: '#E50914' } }}>
                  {product.categoryName}
                </Typography>
              </Link>
            ) : null}
            <Typography variant="caption" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.primary', fontWeight: 600 }}>
              {product.name}
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={8}>
          {/* Gallery Showcase Section */}
          <Grid size={{ xs: 12, md: 6, lg: 7 }}>
            <Box 
              className="lumiere-card"
              sx={{ 
                position: 'relative', 
                pt: '100%', 
                bgcolor: '#FFFFFF', 
                borderRadius: 2, 
                overflow: 'hidden',
                border: '1px solid #EAE5DC',
                boxShadow: '0 8px 30px rgba(24, 24, 22, 0.04)'
              }}
            >
              <Box
                component="img"
                src={imgError ? fallbackImg : (product.imageUrl || fallbackImg)}
                alt={product.name}
                onError={() => setImgError(true)}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'scale(1.03)',
                  }
                }}
              />
              
              {/* Category Ribbon */}
              <Box sx={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 1 }}>
                <Chip
                  label={catalogItem ? `${catalogItem.audience} • ${catalogItem.subcategory}` : (product.categoryName || 'Exclusive Piece')}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(24, 24, 22, 0.88)',
                    color: '#FAF8F5',
                    backdropFilter: 'blur(8px)',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(184, 151, 88, 0.4)'
                  }}
                />
                {(isCuratedAtelier || productActionState === 'VALID_REFERRAL') && (
                  <Chip
                    icon={<VerifiedUserOutlined sx={{ fontSize: '14px !important', color: '#FAF8F5 !important' }} />}
                    label={destinationType === 'OFFICIAL_CATEGORY_DESTINATION' ? 'Official Category Destination' : 'Official Verified Destination'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(229, 9, 20, 0.92)',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(8px)',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      letterSpacing: '0.08em',
                    }}
                  />
                )}
                {(catalogItem?.isEditorialConcept || productAttributes?.isEditorialConcept) && (
                  <Chip
                    label="Editorial Concept"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(184, 151, 88, 0.92)',
                      color: '#181816',
                      backdropFilter: 'blur(8px)',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      letterSpacing: '0.08em',
                    }}
                  />
                )}
                {productActionState === 'UNTRUSTED_REFERRAL' && (
                  <Chip
                    icon={<SecurityOutlined sx={{ fontSize: '14px !important', color: '#FAF8F5 !important' }} />}
                    label="Untrusted Destination"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(180, 83, 9, 0.92)',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(8px)',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      letterSpacing: '0.08em',
                    }}
                  />
                )}
              </Box>

              {/* Wishlist Action */}
              <Tooltip title={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}>
                <IconButton
                  onClick={toggleWishlist}
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    bgcolor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    color: isWishlisted ? '#E50914' : 'text.primary',
                    border: '1px solid #EAE5DC',
                    '&:hover': {
                      bgcolor: '#FFFFFF',
                      transform: 'scale(1.08)'
                    }
                  }}
                >
                  {isWishlisted ? <Favorite sx={{ color: '#E50914' }} /> : <FavoriteBorderOutlined />}
                </IconButton>
              </Tooltip>

              {isOutOfStock && productActionState === 'INTERNAL_PURCHASE' && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 24, 
                    left: 24, 
                    bgcolor: 'rgba(192, 57, 43, 0.95)', 
                    color: 'white', 
                    px: 2.5, 
                    py: 0.8, 
                    borderRadius: 1, 
                    fontWeight: 700, 
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase' 
                  }}
                >
                  Allocation Exhausted
                </Box>
              )}
            </Box>

            {/* Image Attribution */}
            {(catalogItem?.imageAttribution || productAttributes?.imageAttribution) && (
              <Typography variant="caption" sx={{ color: '#8C827A', display: 'block', mt: 1.5, px: 0.5 }}>
                Imagery: {catalogItem?.imageAttribution || productAttributes?.imageAttribution}
              </Typography>
            )}
          </Grid>

          {/* Product Dossier & Buying Panel */}
          <Grid size={{ xs: 12, md: 6, lg: 5 }}>
            <Box sx={{ position: 'sticky', top: 120 }}>
              {/* Maison Provenance Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                {brandSlug && brandName ? (
                  <Link to={`/brands/${brandSlug}`} style={{ textDecoration: 'none' }}>
                    <Typography 
                      variant="overline" 
                      sx={{ 
                        color: '#B89758', 
                        fontWeight: 700, 
                        letterSpacing: '0.18em',
                        display: 'block',
                        fontSize: '0.82rem',
                        '&:hover': { color: '#E50914', textDecoration: 'underline' }
                      }}
                    >
                      {brandName} • {brandEntity?.city || 'HAUTE ATELIER'}, {brandEntity?.country || 'FRANCE'}
                    </Typography>
                  </Link>
                ) : (
                  <Typography 
                    variant="overline" 
                    sx={{ 
                      color: 'primary.main', 
                      fontWeight: 600, 
                      letterSpacing: '0.2em',
                      display: 'block'
                    }}
                  >
                    {product.categoryName || 'AUTHENTIC LUXURY'}
                  </Typography>
                )}
              </Box>
              
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 700, 
                  color: '#181816',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                  mb: 2 
                }}
              >
                {product.name}
              </Typography>
              
              {/* Pricing Dossier */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                {isPriceUponInquiry ? (
                  <Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontFamily: '"Cinzel", serif',
                        fontWeight: 700, 
                        color: '#181816',
                        letterSpacing: '0.04em' 
                      }}
                    >
                      Price Upon Inquiry
                    </Typography>
                    <Chip
                      label="Bespoke Atelier Consultation"
                      size="small"
                      sx={{ mt: 0.5, bgcolor: '#F4EFE6', color: '#181816', fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 700, 
                        color: '#181816',
                        letterSpacing: '-0.02em' 
                      }}
                    >
                      {productAttributes?.priceFormatted || (catalogItem ? catalogItem.priceFormatted : formatINR(product.price))}
                    </Typography>
                    {productActionState === 'VALID_REFERRAL' && priceVerificationStatus === 'VERIFIED_ATELIER_PRICE' && product.price > 0 ? (
                      <Chip
                        label="Verified Atelier Price"
                        size="small"
                        sx={{ bgcolor: '#EBF5EB', color: '#1E7E34', fontWeight: 700, fontSize: '0.72rem' }}
                      />
                    ) : productActionState === 'UNTRUSTED_REFERRAL' ? (
                      <Chip
                        label="Unverified Referral"
                        size="small"
                        variant="outlined"
                        sx={{ color: '#D4A373', borderColor: '#D4A373', fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    ) : isDemoPrice(product.sku) ? (
                      <Chip
                        label="Unverified Demo Feed"
                        size="small"
                        variant="outlined"
                        sx={{ color: '#A08040', borderColor: '#D4AF37', fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    ) : null}
                  </Box>
                )}
              </Box>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#6B665E', 
                  mb: 4, 
                  lineHeight: 1.8,
                  fontSize: '0.95rem'
                }}
              >
                {product.description || 'Masterfully engineered and tailored with uncompromising materials for discerning connoisseurs.'}
              </Typography>
              
              <Divider sx={{ mb: 4, borderColor: '#EAE5DC' }} />

              {/* Supported Sizes & Colors (Only when supported by catalog) */}
              {(displaySizes || displayColors) && (
                <Box sx={{ mb: 4 }}>
                  {displaySizes && displaySizes.length > 0 && (
                    <Box sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#181816' }}>
                          Representative Sizing Benchmark
                        </Typography>
                        <Button 
                          size="small" 
                          startIcon={<StraightenOutlined sx={{ fontSize: 16 }} />}
                          onClick={() => setSizeGuideOpen(true)}
                          sx={{ color: '#B89758', fontSize: '0.75rem', p: 0, textTransform: 'none' }}
                        >
                          Size Matrix & Conversions
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {displaySizes.map(sz => (
                          <Chip 
                            key={sz} 
                            label={sz} 
                            variant="outlined"
                            sx={{ borderRadius: '4px', fontWeight: 600, borderColor: '#D5C9B3', color: '#181816' }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {displayColors && displayColors.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#181816', display: 'block', mb: 1 }}>
                        Atelier Colorways
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {displayColors.map(col => (
                          <Chip 
                            key={col} 
                            label={col} 
                            size="small"
                            sx={{ bgcolor: '#F4EFE6', color: '#181816', fontWeight: 500 }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* ACTION SECTION */}
              {productActionState === 'VALID_REFERRAL' ? (
                /* OFFICIAL BRAND DIRECT REFERRAL FLOW */
                <Box sx={{ mb: 4 }} data-testid="referral-action-section">
                  <Button 
                    fullWidth
                    component="a"
                    href={destinationUrl}
                    {...getSafeExternalLinkAttributes()}
                    variant="contained" 
                    size="large"
                    endIcon={<OpenInNewOutlined />}
                    className="lumiere-red-btn lumiere-pill-btn"
                    sx={{ 
                      py: 2, 
                      borderRadius: '30px', 
                      mb: 2,
                      fontSize: '0.9rem',
                      letterSpacing: '0.08em',
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 700
                    }}
                  >
                    Acquire via Official {brandName} Portal
                  </Button>

                  {/* LUMIÈRE Direct-Referral Protocol Disclosure Box */}
                  <Box sx={{ 
                    p: 2.5, 
                    bgcolor: '#FFFFFF', 
                    borderRadius: '8px', 
                    border: '1px solid #EAE5DC', 
                    mb: 2,
                    boxShadow: '0 2px 10px rgba(24, 24, 22, 0.02)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <VerifiedUserOutlined sx={{ color: '#E50914', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Cinzel", serif', fontWeight: 700, color: '#181816', fontSize: '0.8rem' }}>
                        LUMIÈRE VERIFIED DIRECT-REFERRAL PROTOCOL
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6B665E', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      This creation directs to {brandName}'s official {destinationType === 'OFFICIAL_CATEGORY_DESTINATION' ? 'category & collection destination' : 'website'}. Purchases, bespoke tailoring, inquiries, and returns happen directly on {brandName}'s official website. LUMIÈRE applies 0% markup and guarantees verified destination domain safety ({verifiedDestinationCheck?.approvedDomain || brandSlug}).
                    </Typography>
                  </Box>

                  {/* Editorial Fashion Concept Notice */}
                  {(catalogItem?.isEditorialConcept || productAttributes?.isEditorialConcept) && (
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#FBF9F5', 
                      borderRadius: '8px', 
                      border: '1px dashed #D5C9B3', 
                      mb: 3 
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#8A5800', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Curated Editorial Fashion Concept
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B665E', display: 'block', lineHeight: 1.5 }}>
                        This piece represents an illustrative fashion concept highlighting {brandName}'s signature craftsmanship. Specifications are illustrative design archetypes and do not represent confirmed available inventory, pricing, or an official commercial endorsement by {brandName}.
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : productActionState === 'UNTRUSTED_REFERRAL' ? (
                /* UNTRUSTED / INVALID REFERRAL DESTINATION WARNING (FAIL-CLOSED) */
                <Box sx={{ mb: 4 }} data-testid="untrusted-referral-section">
                  <Alert 
                    severity="warning" 
                    icon={<SecurityOutlined />}
                    sx={{ 
                      mb: 2.5, 
                      border: '1px solid #D4A373', 
                      bgcolor: '#FFFDF9', 
                      borderRadius: '8px',
                      '& .MuiAlert-message': { width: '100%' }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif', color: '#8A5800', letterSpacing: '0.05em' }}>
                      UNTRUSTED DESTINATION WARNING
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B665E', fontSize: '0.82rem', mt: 0.5, lineHeight: 1.6 }}>
                      {verifiedDestinationCheck?.reason || 'This creation is designated for brand-direct referral, but its destination link failed LUMIÈRE security verification. External navigation is blocked to protect against deceptive or malicious domains.'}
                    </Typography>
                  </Alert>

                  <Button 
                    fullWidth
                    disabled
                    variant="contained" 
                    size="large"
                    sx={{ 
                      py: 2, 
                      borderRadius: '30px', 
                      mb: 2,
                      fontSize: '0.88rem',
                      letterSpacing: '0.08em',
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 700,
                      bgcolor: '#EAE5DC !important',
                      color: '#8C827A !important'
                    }}
                  >
                    Direct Acquisition Blocked (Security Precaution)
                  </Button>

                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#FFFFFF', 
                    borderRadius: '8px', 
                    border: '1px solid #EAE5DC', 
                    mb: 3
                  }}>
                    <Typography variant="caption" sx={{ color: '#8C827A', display: 'block', lineHeight: 1.5 }}>
                      <strong>LUMIÈRE Fail-Closed Security Policy:</strong> Referral catalog creations are fulfilled exclusively by their respective fashion houses and cannot be purchased through LUMIÈRE internal bags. If destination authenticity cannot be established, acquisition is halted.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                /* INTERNAL SHOPPING BAG FLOW FOR ORDINARY DATABASE PRODUCTS ONLY */
                <Box sx={{ mb: 4 }} data-testid="internal-purchase-section">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Quantity:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #D5C9B3', borderRadius: 1, bgcolor: '#FFFFFF' }}>
                      <Button size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock || quantity <= 1}>-</Button>
                      <Typography sx={{ px: 2, fontWeight: 600 }}>{quantity}</Typography>
                      <Button size="small" onClick={() => setQuantity(Math.min(10, quantity + 1))} disabled={isOutOfStock || quantity >= 10}>+</Button>
                    </Box>
                  </Box>

                  <Button 
                    fullWidth
                    variant="contained" 
                    size="large"
                    disabled={isOutOfStock || adding}
                    onClick={handleAddToCart}
                    startIcon={<ShoppingBagOutlined />}
                    className="lumiere-red-btn lumiere-pill-btn"
                    sx={{ py: 2, mb: 2 }}
                  >
                    {isOutOfStock ? 'Allocation Exhausted' : adding ? 'Securing Piece...' : 'Acquire Piece'}
                  </Button>
                </Box>
              )}

              {/* Utility Buttons: Salon Comparison & Sizing Specifications */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  startIcon={<CompareArrowsOutlined />}
                  onClick={handleToggleComparison}
                  sx={{ 
                    py: 1.4, 
                    borderRadius: 1, 
                    borderColor: comparing ? '#B89758' : '#D5C9B3',
                    bgcolor: comparing ? 'rgba(184, 151, 88, 0.08)' : 'transparent',
                    color: '#181816',
                    letterSpacing: '0.06em',
                    fontFamily: '"Cinzel", serif',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {comparing ? 'In Salon Comparison' : 'Add to Comparison'}
                </Button>

                <Button 
                  fullWidth
                  variant="outlined" 
                  startIcon={<StraightenOutlined />}
                  onClick={() => setSizeGuideOpen(true)}
                  sx={{ 
                    py: 1.4, 
                    borderRadius: 1, 
                    borderColor: '#D5C9B3',
                    color: '#181816',
                    letterSpacing: '0.06em',
                    fontFamily: '"Cinzel", serif',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  Sizing Matrix
                </Button>
              </Box>

              {/* Detailed Atelier Specifications Accordions */}
              {(displayFabric || displayFit || isReferralIntent) && (
                <Box sx={{ mb: 4 }}>
                  {displayFabric && (
                    <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #EAE5DC', borderRadius: '4px !important', mb: 1, '&::before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif' }}>
                          Fabric & Material Architecture {(catalogItem?.isEditorialConcept || productAttributes?.isEditorialConcept) ? '(Editorial Concept)' : ''}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Typography variant="body2" sx={{ color: '#6B665E', lineHeight: 1.7 }}>
                          {displayFabric}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {displayFit && (
                    <Accordion elevation={0} sx={{ border: '1px solid #EAE5DC', borderRadius: '4px !important', mb: 1, '&::before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif' }}>
                          Silhouette & Tailoring Fit {(catalogItem?.isEditorialConcept || productAttributes?.isEditorialConcept) ? '(Editorial Concept)' : ''}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Typography variant="body2" sx={{ color: '#6B665E', lineHeight: 1.7 }}>
                          {displayFit}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {isReferralIntent && (
                    <Accordion elevation={0} sx={{ border: '1px solid #EAE5DC', borderRadius: '4px !important', '&::before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif' }}>
                          Provenance & Verification Source
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Typography variant="body2" sx={{ color: '#6B665E', lineHeight: 1.7 }}>
                          {priceSource && <><strong>Price Source:</strong> {priceSource}<br /></>}
                          <strong>Destination Type:</strong> {destinationType === 'OFFICIAL_CATEGORY_DESTINATION' ? 'Official Brand Category / Collection Portal (Category browse; not an exact product listing)' : destinationType === 'EXACT_PRODUCT_PAGE' ? 'Exact Product Listing' : 'Unspecified'}<br />
                          <strong>Destination URL:</strong> {destinationUrl || 'None provided'}<br />
                          <strong>Security Status:</strong> {verifiedDestinationCheck ? `${verifiedDestinationCheck.badgeLabel} (${verifiedDestinationCheck.securityStatus})` : 'Unverified Destination'}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              )}

              {/* Maison Guarantees */}
              <Box 
                sx={{ 
                  p: 2.5, 
                  bgcolor: '#FFFFFF', 
                  border: '1px solid #EAE5DC', 
                  borderRadius: 1, 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <DiamondOutlined sx={{ color: '#B89758', fontSize: '1.2rem' }} />
                  <Typography variant="caption" sx={{ color: '#6B665E' }}>
                    <strong>Verified Authenticity:</strong> Direct provenance link to approved brand portals.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocalShippingOutlined sx={{ color: '#B89758', fontSize: '1.2rem' }} />
                  <Typography variant="caption" sx={{ color: '#6B665E' }}>
                    <strong>Atelier Delivery:</strong> Shipping, delivery timelines, and insurance handled directly by the brand.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SecurityOutlined sx={{ color: '#B89758', fontSize: '1.2rem' }} />
                  <Typography variant="caption" sx={{ color: '#6B665E' }}>
                    <strong>Zero Intermediary Fees:</strong> 0% transaction markups applied by LUMIÈRE.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Related Creations Showcase */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 14 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 4, pb: 2, borderBottom: '1px solid #EAE5DC' }}>
              <Box>
                <Typography variant="overline" sx={{ color: '#B89758', fontWeight: 700, letterSpacing: '0.15em' }}>
                  CURATED SALON
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#181816', mt: 0.5 }}>
                  Related Creations
                </Typography>
              </Box>
              <Button component={Link} to="/products" sx={{ color: '#181816', fontWeight: 600 }}>
                View All Collections
              </Button>
            </Box>

            <Grid container spacing={4}>
              {relatedProducts.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Sizing Matrix Modal */}
      <SizingMatrixModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        initialCategory={catalogItem ? (catalogItem.audience === 'Kids' ? 'Kids' : catalogItem.audience === 'Men' ? 'Men' : 'Women') : 'Women'}
        brandName={catalogItem?.brandName}
        brandSlug={catalogItem?.brandSlug}
        verifiedWebsiteUrl={catalogItem?.destinationUrl}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%', 
            fontWeight: 500,
            bgcolor: snackbar.severity === 'success' ? '#181816' : '#C0392B',
            color: '#FFFFFF',
            border: '1px solid #B89758',
            '& .MuiAlert-icon': {
              color: '#B89758'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetailPage;
