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

export interface ProductCardEvaluation {
  isInquiryOrReferral: boolean;
  isPriceOnInquiry: boolean;
  isTrustedDestination: boolean;
  isUntrustedDestination: boolean;
  subLabelText: string | null;
  ctaText: 'View Dossier' | 'Acquire' | 'Reserved';
}

export const evaluateProductCardState = (product: Product): ProductCardEvaluation => {
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

  const isInquiryOrReferral = Boolean(
    isPriceOnInquiry ||
    attrData.priceVerificationStatus === 'PRICE_UPON_INQUIRY' ||
    !product.price ||
    product.price <= 0 ||
    attrData.isReferral === true ||
    Boolean(attrData.destinationUrl) ||
    Boolean(attrData.destinationType) ||
    attrData.fulfillmentType === 'EXTERNAL_REFERRAL' ||
    attrData.fulfillmentType === 'EXTERNAL_ATELIER_REFERRAL' ||
    attrData.isEditorialConcept === true ||
    (product.id && product.id.startsWith('prod-'))
  );

  let subLabelText: string | null = null;
  if (isUntrustedDestination) {
    subLabelText = 'Unverified Referral';
  } else if (isInquiryOrReferral) {
    subLabelText = isPriceOnInquiry 
      ? 'Atelier Consultation' 
      : (attrData.priceVerificationStatus === 'VERIFIED_ATELIER_PRICE' && product.price > 0 ? 'Verified Atelier Price' : 'Price on Inquiry');
  } else if (isDemoPrice(product.sku)) {
    subLabelText = 'Unverified Demo Feed';
  }

  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const ctaText = isInquiryOrReferral ? 'View Dossier' : (isOutOfStock ? 'Reserved' : 'Acquire');

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
    // Fail-closed: Never perform internal add-to-cart on inquiry or referral items
    if (cardEvaluation.isInquiryOrReferral) {
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
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        textDecoration: 'none',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #EAE5DC',
      }}
      component={Link}
      to={`/products/${product.id}`}
    >
      {/* Product Image Area */}
      <Box sx={{ position: 'relative', pt: '105%', overflow: 'hidden', bgcolor: '#F8F6F2' }}>
        <CardMedia
          component="img"
          image={imgError ? luxuryFallbackImg : (product.imageUrl || luxuryFallbackImg)}
          alt={product.name}
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

        {/* Top Actions: Compare & Wishlist */}
        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
          <Tooltip title={comparing ? "Remove from Comparison" : "Add to Comparison"}>
            <IconButton
              onClick={toggleComparison}
              sx={{
                bgcolor: comparing ? '#B89758' : 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(8px)',
                p: 0.9,
                color: comparing ? '#181816' : '#6B665E',
                border: '1px solid rgba(234, 229, 220, 0.8)',
                '&:hover': { bgcolor: '#FFFFFF', color: '#B89758' }
              }}
            >
              <CompareArrowsOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={toggleWishlist}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              p: 0.9,
              color: isWishlisted ? '#E50914' : '#6B665E',
              border: '1px solid rgba(234, 229, 220, 0.8)',
              '&:hover': { bgcolor: '#FFFFFF', color: '#E50914' }
            }}
          >
            {isWishlisted ? (
              <Favorite className={heartAnim ? "heart-popped" : ""} sx={{ fontSize: 18, color: '#E50914' }} />
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
          <Typography 
            variant="caption" 
            sx={{ 
              fontFamily: '"Cinzel", serif', 
              color: '#B89758', 
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              fontWeight: 600
            }}
          >
            {product.sku || 'SIGNATURE EDITION'}
          </Typography>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 600, 
              fontSize: '1.15rem',
              color: '#181816',
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
            color: '#6B665E', 
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
        <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #F0ECE4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#8C827A', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.05em' }}>
              PRICE (INR)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#181816', fontSize: cardEvaluation.isPriceOnInquiry ? '0.92rem' : '1.1rem' }}>
              {cardEvaluation.isPriceOnInquiry ? 'Price on Inquiry' : formatINR(product.price)}
            </Typography>
            {cardEvaluation.subLabelText && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: cardEvaluation.isUntrustedDestination ? '#D32F2F' : '#B89758', 
                  fontSize: '0.65rem', 
                  display: 'block', 
                  fontWeight: 600,
                  letterSpacing: cardEvaluation.subLabelText === 'Unverified Demo Feed' ? '0.02em' : 'inherit'
                }}
              >
                {cardEvaluation.subLabelText}
              </Typography>
            )}
          </Box>

          {cardEvaluation.isInquiryOrReferral ? (
            <Button 
              variant="outlined" 
              className="lumiere-pill-btn"
              sx={{ 
                py: 0.8, 
                px: 2, 
                fontWeight: 600, 
                fontSize: '0.78rem',
                borderRadius: '30px',
                borderColor: '#181816',
                color: '#181816',
                '&:hover': { bgcolor: '#181816', color: '#FAF8F5' }
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
                borderRadius: '30px',
                bgcolor: '#0A0A0A',
                color: '#FFFFFF',
                border: '1px solid transparent',
                '&:hover': { bgcolor: '#1E1E1E', borderColor: '#E50914', boxShadow: '0 4px 14px rgba(229, 9, 20, 0.28)' }
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
