import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Button, IconButton, Chip, Tooltip } from '@mui/material';
import { ShoppingBagOutlined, FavoriteBorder, Favorite, CompareArrowsOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import type { RootState, AppDispatch } from '../../store';
import { formatINR, isDemoPrice } from '../../utils/currency';
import { useComparison } from '../../context/ComparisonContext';

import { useWishlist } from '../../utils/wishlistStorage';
import { verifyBrandDomain } from '../../utils/domainVerifier';
import { env } from '../../config/env';

export interface ProductCardEvaluation {
  isInquiryOrReferral: boolean;
  isPriceOnInquiry: boolean;
  isTrustedDestination: boolean;
  isUntrustedDestination: boolean;
  subLabelText: string | null;
  ctaText: 'View Dossier' | 'Acquire' | 'Reserved';
}

export const evaluateProductCardState = (
  product: Product,
  enableInternalCheckout = env.ENABLE_INTERNAL_CHECKOUT
): ProductCardEvaluation => {
  let attrData: any = {};
  try {
    if (product.attributes) {
      attrData = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
    }
  } catch {
    attrData = {};
  }

  const isPriceOnInquiry = attrData.priceVerificationStatus === 'PRICE_UPON_INQUIRY' || !product.price || product.price <= 0;

  const destinationUrl = attrData.destinationUrl;
  const brandQuery = attrData.brandSlug || (product.brand ? product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);
  const domainCheck = destinationUrl ? verifyBrandDomain(destinationUrl, brandQuery) : undefined;
  const isTrustedDestination = Boolean(domainCheck?.isValid && domainCheck?.isVerifiedOfficial);
  const isUntrustedDestination = Boolean(destinationUrl && !isTrustedDestination);

  const isExplicitInquiryOrReferral = Boolean(
    isPriceOnInquiry ||
    attrData.priceVerificationStatus === 'PRICE_UPON_INQUIRY' ||
    !product.price ||
    product.price <= 0 ||
    attrData.isReferral === true ||
    Boolean(attrData.destinationUrl) ||
    Boolean(attrData.destinationType) ||
    attrData.fulfillmentType === 'REFERRAL_LINK' ||
    attrData.fulfillmentType === 'EXTERNAL_REFERRAL' ||
    attrData.fulfillmentType === 'EXTERNAL_ATELIER_REFERRAL' ||
    attrData.isEditorialConcept === true ||
    (product.id && product.id.startsWith('prod-'))
  );

  // When internal checkout is disabled, fail closed: all products operate in inquiry/dossier mode
  const isInquiryOrReferral = !enableInternalCheckout || isExplicitInquiryOrReferral;

  let subLabelText: string | null = null;
  if (isUntrustedDestination) {
    subLabelText = 'Unverified Referral';
  } else if (isExplicitInquiryOrReferral || !enableInternalCheckout) {
    if (isPriceOnInquiry) {
      subLabelText = 'Atelier Consultation';
    } else if (attrData.priceVerificationStatus === 'VERIFIED_ATELIER_PRICE' && product.price > 0) {
      subLabelText = 'Verified Atelier Price';
    } else if (!enableInternalCheckout) {
      subLabelText = 'Atelier Consultation';
    } else {
      subLabelText = 'Price on Inquiry';
    }
  } else if (isDemoPrice(product.sku)) {
    subLabelText = 'Unverified Demo Feed';
  }

  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const ctaText = (!enableInternalCheckout || isInquiryOrReferral)
    ? 'View Dossier'
    : (isOutOfStock ? 'Reserved' : 'Acquire');

  return {
    isInquiryOrReferral,
    isPriceOnInquiry,
    isTrustedDestination,
    isUntrustedDestination,
    subLabelText,
    ctaText,
  };
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cartId } = useSelector((state: RootState) => state.cart);

  const [imgError, setImgError] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const { isWishlisted: checkWishlisted, toggleWishlist: toggleWishlistGlobal } = useWishlist();
  const isWishlisted = checkWishlisted(product.id);

  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const comparing = isInComparison(product.id);

  const cardEvaluation = evaluateProductCardState(product);

  const toggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (comparing) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    toggleWishlistGlobal(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Fail-closed: Never perform internal add-to-cart on inquiry or referral items, or when internal checkout is disabled
    if (cardEvaluation.isInquiryOrReferral || !env.ENABLE_INTERNAL_CHECKOUT) {
      return;
    }
    if (cartId && !addingToCart) {
      setAddingToCart(true);
      try {
        await dispatch(addToCart({ item: { productId: product.id, quantity: 1 } })).unwrap();
      } finally {
        setTimeout(() => setAddingToCart(false), 500);
      }
    }
  };

  const attrData = (() => {
    try {
      return product.attributes ? JSON.parse(product.attributes) : {};
    } catch {
      return {};
    }
  })();

  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  // High-fidelity luxury editorial imagery for couture atelier garments
  const luxuryFallbackImg = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900';

  return (
    <Card
      className="lumiere-product-card"
      data-cursor="view"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        textDecoration: 'none',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        borderRadius: '22px',
        border: '1px solid var(--line, #e5dccb)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 32px rgba(26, 20, 32, 0.08)',
        },
        '&:hover .product-quick-sizes': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      }}
      component={Link}
      to={`/products/${product.id}`}
    >
      {/* Product Image Area */}
      <Box sx={{ position: 'relative', pt: '115%', overflow: 'hidden', bgcolor: '#F5F0E6' }}>
        <CardMedia
          component="img"
          image={imgError ? luxuryFallbackImg : (product.imageUrl || luxuryFallbackImg)}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              transform: 'scale(1.06)'
            }
          }}
        />

        {/* Hover Quick Size Availability Overlay (VIVANT Inspired) */}
        <Box
          className="product-quick-sizes"
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.6,
            bgcolor: 'rgba(251, 246, 236, 0.92)',
            backdropFilter: 'blur(8px)',
            py: 0.8,
            px: 1.5,
            borderRadius: '999px',
            border: '1px solid rgba(229, 220, 203, 0.8)',
            opacity: 0,
            transform: 'translateY(8px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1420', mr: 0.5, fontFamily: '"Instrument Sans", sans-serif' }}>
            SIZES:
          </Typography>
          {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
            <Box
              key={size}
              component="span"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#1a1420',
                px: 0.6,
                py: 0.1,
                borderRadius: '4px',
                bgcolor: 'rgba(26, 20, 32, 0.06)',
                fontFamily: '"Instrument Sans", sans-serif',
              }}
            >
              {size}
            </Box>
          ))}
        </Box>

        {/* Top Actions: Compare & Wishlist */}
        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
          <Tooltip title={comparing ? "Remove from Comparison" : "Add to Comparison"}>
            <IconButton
              onClick={toggleComparison}
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: comparing ? 'var(--cobalt, #3a3ce0)' : 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(8px)',
                p: 0,
                color: comparing ? '#FFFFFF' : 'var(--ink, #1a1420)',
                border: '1px solid var(--line, #e5dccb)',
                '&:hover': { bgcolor: '#FFFFFF', color: 'var(--cobalt, #3a3ce0)' }
              }}
            >
              <CompareArrowsOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={toggleWishlist}
            aria-pressed={isWishlisted}
            aria-label={`Save ${product.name}`}
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: isWishlisted ? 'var(--tang, #e8572b)' : 'rgba(255, 255, 255, 0.90)',
              backdropFilter: 'blur(8px)',
              p: 0,
              color: isWishlisted ? '#FFFFFF' : 'var(--ink, #1a1420)',
              border: isWishlisted ? '1px solid var(--tang, #e8572b)' : '1px solid var(--line, #e5dccb)',
              '&:hover': {
                bgcolor: isWishlisted ? '#d2481f' : '#FFFFFF',
                color: isWishlisted ? '#FFFFFF' : 'var(--tang, #e8572b)'
              }
            }}
          >
            {isWishlisted ? (
              <Favorite className={heartAnim ? "heart-popped" : ""} sx={{ fontSize: 18, color: '#FFFFFF' }} />
            ) : (
              <FavoriteBorder className={heartAnim ? "heart-popped" : ""} sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>

        {/* Category & Editorial Concept Pill Tags */}
        <Box sx={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {product.categoryName && (
            <Chip
              label={product.categoryName}
              size="small"
              sx={{
                bgcolor: 'rgba(24, 24, 22, 0.82)',
                backdropFilter: 'blur(6px)',
                color: '#FAF8F5',
                fontFamily: '"Cinzel", serif',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                borderRadius: '4px',
                height: 24,
              }}
            />
          )}
          {attrData.isEditorialConcept && (
            <Chip
              label="Editorial Concept"
              size="small"
              sx={{
                bgcolor: 'rgba(184, 151, 88, 0.92)',
                backdropFilter: 'blur(6px)',
                color: '#181816',
                fontFamily: '"Cinzel", serif',
                fontSize: '0.62rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 700,
                borderRadius: '4px',
                height: 24,
              }}
            />
          )}
        </Box>

        {isOutOfStock && (
          <Box sx={{
            position: 'absolute', inset: 0,
            bgcolor: 'rgba(250, 248, 245, 0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Typography variant="overline" sx={{
              color: 'error.main', fontWeight: 700,
              bgcolor: '#FFFFFF', px: 2, py: 0.5, borderRadius: 1, border: '1px solid #EAE5DC'
            }}>
              Temporarily Reserved
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: '"Instrument Sans", sans-serif',
                color: 'var(--cobalt, #3a3ce0)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontSize: '0.80rem',
                fontWeight: 700,
              }}
            >
              {product.brand || 'ATELIER'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Instrument Sans", sans-serif',
                color: '#8A5800',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontSize: '0.66rem',
                fontWeight: 600
              }}
            >
              {product.sku || 'SIGNATURE'}
            </Typography>
          </Box>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.15rem',
              color: '#1a1420',
              lineHeight: 1.3,
              mt: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.name}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#686070',
            fontFamily: '"Instrument Sans", sans-serif',
            mb: 2,
            fontSize: '0.85rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.description || 'Artisanal engineering tailored for effortless performance and distinction.'}
        </Typography>

        {/* Price and Action */}
        <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #e5dccb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#8C827A', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.05em', fontFamily: '"Instrument Sans", sans-serif' }}>
              PRICE (INR)
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, color: '#1a1420', fontSize: cardEvaluation.isPriceOnInquiry ? '0.92rem' : '1.1rem' }}>
              {cardEvaluation.isPriceOnInquiry ? 'Price on Inquiry' : formatINR(product.price)}
            </Typography>
            {cardEvaluation.subLabelText && (
              <Typography
                variant="caption"
                sx={{
                  color: cardEvaluation.isUntrustedDestination ? '#D32F2F' : '#3a3ce0',
                  fontSize: '0.68rem',
                  display: 'block',
                  fontWeight: 600,
                  fontFamily: '"Instrument Sans", sans-serif',
                  letterSpacing: cardEvaluation.subLabelText === 'Unverified Demo Feed' ? '0.02em' : 'inherit'
                }}
              >
                {cardEvaluation.subLabelText}
              </Typography>
            )}
          </Box>

          {cardEvaluation.isInquiryOrReferral ? (
            <Button
              variant="contained"
              className="lumiere-pill-btn"
              sx={{
                py: 0.9,
                px: 2.4,
                fontWeight: 600,
                fontSize: '0.82rem',
                borderRadius: '99px',
                fontFamily: '"Instrument Sans", sans-serif',
                bgcolor: 'var(--ink, #1a1420)',
                color: 'var(--bg, #fbf6ec)',
                border: '1px solid var(--ink, #1a1420)',
                '&:hover': { bgcolor: 'var(--cobalt, #3a3ce0)', color: '#FFFFFF', borderColor: 'var(--cobalt, #3a3ce0)' }
              }}
            >
              View Dossier
            </Button>
          ) : (
            <Button
              variant="contained"
              className={!isOutOfStock ? "lumiere-shimmer-btn lumiere-pill-btn" : ""}
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              startIcon={<ShoppingBagOutlined sx={{ fontSize: 16 }} />}
              sx={{
                py: 0.9,
                px: 2.4,
                fontWeight: 600,
                fontSize: '0.82rem',
                borderRadius: '99px',
                fontFamily: '"Instrument Sans", sans-serif',
                bgcolor: '#1a1420',
                color: '#fbf6ec',
                border: '1px solid transparent',
                '&:hover': { bgcolor: '#3a3ce0', color: '#ffffff' }
              }}
            >
              {isOutOfStock ? 'Reserved' : addingToCart ? 'Added' : 'Acquire'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
