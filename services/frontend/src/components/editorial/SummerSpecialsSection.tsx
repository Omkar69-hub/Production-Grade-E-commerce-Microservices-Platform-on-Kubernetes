import React, { useState, useRef, useEffect } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import {
  ShoppingBagOutlined,
  ArrowForwardOutlined,
  CheckOutlined,
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface EditorialProductItem {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  rating: number;
  imageUrl: string;
  bgColor: string;
  sizes: string[];
  link: string;
}

const TRENDING_ITEMS: EditorialProductItem[] = [
  {
    id: 'tr-1',
    title: 'Lemon Pleated Midi Skirt',
    subtitle: 'Satin · Sunray pleats',
    price: '₹19,200',
    originalPrice: '₹24,500',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
    bgColor: '#D8CEF6', // Soft lilac purple
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    link: '/products?item=lemon-pleated-midi-skirt'
  },
  {
    id: 'tr-2',
    title: 'Ultramarine Flare Jeans',
    subtitle: 'Rigid organic denim · High-rise flare',
    price: '₹15,200',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=900',
    bgColor: '#B4DC45', // Vibrant lime
    sizes: ['26', '27', '28', '29'],
    link: '/products?item=ultramarine-flare-jeans'
  },
  {
    id: 'tr-3',
    title: 'Lilac Organza Blouse',
    subtitle: 'Silk organza · Puff sleeve',
    price: '₹16,500',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    bgColor: '#C8ECE5', // Soft mint cyan
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    link: '/products?item=lilac-organza-blouse'
  }
];

const SUMMER_ITEMS: EditorialProductItem[] = [
  {
    id: 'su-1',
    title: 'Aqua Crochet Co-ord',
    subtitle: 'Hand-crocheted cotton · Two-piece',
    price: '₹20,200',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    bgColor: '#F7D9C4', // Peach blush
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    link: '/products?item=aqua-crochet-co-ord'
  },
  {
    id: 'su-2',
    title: 'Mint Terry Polo',
    subtitle: 'Cotton terry · Resort collar',
    price: '₹11,500',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    bgColor: '#E75A2A', // Warm terracotta
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    link: '/products?item=mint-terry-polo'
  },
  {
    id: 'su-3',
    title: 'Riviera Wide-Leg Trousers',
    subtitle: 'Linen-silk · High-rise, double pleat',
    price: '₹18,500',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    bgColor: '#E8C547', // Warm solar yellow
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    link: '/products?item=riviera-wide-leg-trousers'
  }
];

interface EditorialTrackRowProps {
  title: string;
  accentColor: string;
  shopLink: string;
  shopLabel: string;
  items: EditorialProductItem[];
}

const EditorialTrackRow: React.FC<EditorialTrackRowProps> = ({
  title,
  accentColor,
  shopLink,
  shopLabel,
  items
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasMovedRef = useRef(false);

  const [activeSizes, setActiveSizes] = useState<Record<string, string>>({});
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = trackRef.current ? trackRef.current.scrollLeft : 0;
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current || !trackRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 6) {
        hasMovedRef.current = true;
      }
      trackRef.current.scrollLeft = scrollLeftStartRef.current - deltaX;
    };

    const handleWindowPointerUp = () => {
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, []);

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
    }
  };

  const handleSizeSelect = (itemId: string, size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSizes(prev => ({ ...prev, [itemId]: size }));
  };

  const handleAddToCart = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedItems(prev => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [itemId]: false }));
    }, 1500);
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ mb: { xs: 8, md: 10 } }}>
      {/* Header with Vertical Color Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3.5,
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
          {/* Vertical Accent Color Bar (Reference Match) */}
          <Box
            sx={{
              width: 3.5,
              height: { xs: 32, md: 42 },
              bgcolor: accentColor,
              borderRadius: '2px'
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
              fontWeight: 500,
              color: 'var(--ink, #1a1420)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box
            component={Link}
            to={shopLink}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              color: 'var(--ink, #1a1420)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.1em',
              fontFamily: '"Instrument Sans", sans-serif',
              textTransform: 'uppercase',
              transition: 'color 0.2s ease',
              '&:hover': { color: 'var(--cobalt, #3a3ce0)' }
            }}
          >
            <span>{shopLabel}</span>
            <ArrowForwardOutlined sx={{ fontSize: 16 }} />
          </Box>

          {/* Navigation Controls */}
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            <IconButton
              onClick={() => scrollByAmount('left')}
              size="small"
              aria-label={`Scroll ${title} left`}
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '1px solid var(--line, #e5dccb)',
                bgcolor: '#FFFFFF',
                color: 'var(--ink, #1a1420)',
                '&:hover': { bgcolor: 'var(--ink, #1a1420)', color: '#FFFFFF' }
              }}
            >
              <ArrowBackIosNewOutlined sx={{ fontSize: 12 }} />
            </IconButton>
            <IconButton
              onClick={() => scrollByAmount('right')}
              size="small"
              aria-label={`Scroll ${title} right`}
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '1px solid var(--line, #e5dccb)',
                bgcolor: '#FFFFFF',
                color: 'var(--ink, #1a1420)',
                '&:hover': { bgcolor: 'var(--ink, #1a1420)', color: '#FFFFFF' }
              }}
            >
              <ArrowForwardIosOutlined sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Horizontal Drag-to-Scroll Track (Reference Match: 3 Split Cards) */}
      <Box
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        sx={{
          display: 'flex',
          gap: { xs: 2.5, md: 3.5 },
          overflowX: 'auto',
          pb: 3,
          pt: 1,
          px: 0.5,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          userSelect: 'none'
        }}
      >
        {items.map((item) => {
          const chosenSize = activeSizes[item.id] || item.sizes[item.sizes.length > 2 ? 2 : 0]; // Default M or middle
          const isAdded = addedItems[item.id] || false;

          return (
            <Box
              key={item.id}
              component={Link}
              to={item.link}
              sx={{
                flex: { xs: '0 0 320px', sm: '0 0 370px', md: '0 0 410px' },
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 2, md: 2.8 },
                p: { xs: 1.5, md: 2 },
                borderRadius: '20px',
                bgcolor: 'transparent',
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              {/* Left: Portrait Product Photo on Colored Background */}
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 130, sm: 145, md: 160 },
                  height: { xs: 185, sm: 205, md: 225 },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  bgcolor: item.bgColor,
                  flexShrink: 0,
                  boxShadow: '0 8px 24px rgba(26, 20, 32, 0.08)',
                  border: '1px solid rgba(26, 20, 32, 0.05)'
                }}
              >
                <Box
                  component="img"
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                />

                {/* Rating Badge Chip in Corner (Reference Match: ★ 4.6) */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 1.1,
                    py: 0.4,
                    borderRadius: '999px',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(6px)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#1a1420',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                  }}
                >
                  <Box component="span" sx={{ color: '#e7c04a', fontSize: '11px', lineHeight: 1 }}>★</Box>
                  <span>{item.rating}</span>
                </Box>
              </Box>

              {/* Right: Product Details & Controls (Reference Match) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontSize: { xs: '1.15rem', md: '1.25rem' },
                    fontWeight: 600,
                    color: 'var(--ink, #1a1420)',
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: '0.78rem',
                    color: 'var(--mute, #6b6173)',
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.subtitle}
                </Typography>

                {/* Size Selector Buttons Row (Reference Match: XS S [M] L XL) */}
                <Box sx={{ display: 'flex', gap: 0.6, my: 0.6, flexWrap: 'wrap' }}>
                  {item.sizes.map((size) => {
                    const isSelected = chosenSize === size;
                    return (
                      <Box
                        key={size}
                        component="button"
                        type="button"
                        onClick={(e) => handleSizeSelect(item.id, size, e)}
                        sx={{
                          px: 1,
                          py: 0.35,
                          minWidth: 28,
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--ink, #1a1420)' : 'var(--line, #e5dccb)',
                          bgcolor: isSelected ? 'var(--ink, #1a1420)' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : 'var(--ink, #1a1420)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          fontFamily: '"Instrument Sans", sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: 'var(--ink, #1a1420)'
                          }
                        }}
                      >
                        {size}
                      </Box>
                    );
                  })}
                </Box>

                {/* Bottom Row: Price + Round Yellow Shopping Bag Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 700,
                        fontSize: { xs: '1.02rem', md: '1.12rem' },
                        color: 'var(--ink, #1a1420)'
                      }}
                    >
                      {item.price}
                    </Typography>
                    {item.originalPrice && (
                      <Typography
                        sx={{
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontSize: '0.82rem',
                          color: 'var(--mute, #6b6173)',
                          textDecoration: 'line-through'
                        }}
                      >
                        {item.originalPrice}
                      </Typography>
                    )}
                  </Box>

                  {/* Round Yellow Shopping Bag Icon Button (Reference Match) */}
                  <IconButton
                    onClick={(e) => handleAddToCart(item.id, e)}
                    size="small"
                    aria-label={`Add ${item.title} to bag`}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: isAdded ? 'var(--lime, #d8f25a)' : '#E7C04A', // Warm golden yellow
                      color: '#1a1420',
                      boxShadow: '0 4px 14px rgba(231, 192, 74, 0.35)',
                      transition: 'transform 0.2s ease, background-color 0.2s ease',
                      '&:hover': {
                        bgcolor: '#d4af37',
                        transform: 'scale(1.08)'
                      }
                    }}
                  >
                    {isAdded ? <CheckOutlined sx={{ fontSize: 18 }} /> : <ShoppingBagOutlined sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const SummerSpecialsSection: React.FC = () => {
  return (
    <Box
      component="section"
      aria-label="Trending Today and Summer Specials Editorial Tracks"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'var(--bg, #fbf6ec)',
        borderBottom: '1px solid var(--line, #e5dccb)'
      }}
    >
      <Container maxWidth="xl">
        {/* ROW 1: TRENDING TODAY (FRAME 14 REFERENCE MATCH) */}
        <EditorialTrackRow
          title="Trending Today"
          accentColor="#E8572B" // Coral Red
          shopLink="/products?tag=trending"
          shopLabel="SHOP TRENDING"
          items={TRENDING_ITEMS}
        />

        {/* ROW 2: SUMMER SPECIALS (FRAME 14/15 REFERENCE MATCH) */}
        <EditorialTrackRow
          title="Summer Specials"
          accentColor="#2DD4BF" // Turquoise Teal
          shopLink="/products?season=summer"
          shopLabel="SHOP SUMMER"
          items={SUMMER_ITEMS}
        />
      </Container>
    </Box>
  );
};

export default SummerSpecialsSection;
