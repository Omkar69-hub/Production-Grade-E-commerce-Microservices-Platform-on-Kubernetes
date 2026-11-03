import React, { useState, useRef } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import {
  ArrowForwardOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface NewArrivalItem {
  id: string;
  badge: 'NEW' | 'BESTSELLER';
  title: string;
  subtitle: string;
  price: string;
  imageUrl: string;
  bgColor: string;
  swatches: string[];
}

const NEW_ARRIVALS: NewArrivalItem[] = [
  {
    id: 'na-1',
    badge: 'NEW',
    title: 'Riviera Linen Blazer',
    subtitle: 'Linen-silk • Relaxed double-breasted',
    price: '₹28,500',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    bgColor: '#D8EFE8', // Mint pastel
    swatches: ['#e2d7c5', '#1a1420', '#2b4162']
  },
  {
    id: 'na-2',
    badge: 'BESTSELLER',
    title: 'Saffron Linen Suit',
    subtitle: 'Irish linen • Double-breasted bespoke',
    price: '₹46,800',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
    bgColor: '#F7D9C4', // Blush peach
    swatches: ['#e69f4b', '#d8c292', '#333333']
  },
  {
    id: 'na-3',
    badge: 'NEW',
    title: 'Petal Bouclé Jacket',
    subtitle: 'Cotton-silk bouclé • Cropped profile',
    price: '₹31,800',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
    bgColor: '#E3D8F5', // Lavender
    swatches: ['#f2c6de', '#e8e5e8', '#222222']
  },
  {
    id: 'na-4',
    badge: 'NEW',
    title: 'Aqua Crochet Co-ord',
    subtitle: 'Hand-crocheted cotton • Two-piece',
    price: '₹20,200',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    bgColor: '#D0F0EA', // Soft cyan
    swatches: ['#4ecdc4', '#ffffff', '#292f36']
  },
  {
    id: 'na-5',
    badge: 'BESTSELLER',
    title: 'Sorbet Silk Midi Dress',
    subtitle: '100% Habotai silk • Fluted hemline',
    price: '₹24,500',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    bgColor: '#FDF1C8', // Lemon sorbet
    swatches: ['#faedcd', '#f7b05b', '#e29578']
  },
  {
    id: 'na-6',
    badge: 'NEW',
    title: 'Cobalt Silk Slip Dress',
    subtitle: 'Bias-cut deadstock silk • Floor length',
    price: '₹21,800',
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    bgColor: '#E0E6F8', // Pale cobalt
    swatches: ['#3a3ce0', '#1a1420', '#e56b6f']
  }
];

export const NewArrivalsTrack: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [wishlistState, setWishlistState] = useState<Record<string, boolean>>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectSize = (id: string, size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSizes(prev => ({ ...prev, [id]: size }));
  };

  const handleScroll = () => {
    if (trackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      const totalScroll = scrollWidth - clientWidth;
      const progress = totalScroll > 0 ? (scrollLeft / totalScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Box
      component="section"
      aria-label="New Arrivals Fresh Off The Cutting Table"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'var(--bg, #fbf6ec)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--line, #e5dccb)'
      }}
    >
      {/* Background Watermark Outlined Text */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          textAlign: 'center',
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 'clamp(55px, 13vw, 175px)',
          fontWeight: 800,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(229, 220, 203, 0.45)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 1,
          letterSpacing: '0.04em'
        }}
      >
        NEW ARRIVALS • NEW ARRIVALS
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            mb: 4.5,
            gap: 2
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#3a3ce0'
                }}
              />
              <Typography
                variant="overline"
                sx={{
                  color: 'var(--ink, #1a1420)',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  fontSize: '0.78rem',
                  fontFamily: '"Instrument Sans", sans-serif'
                }}
              >
                FRESH OFF THE CUTTING TABLE
              </Typography>
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
                fontWeight: 500,
                color: 'var(--ink, #1a1420)',
                letterSpacing: '-0.025em',
                lineHeight: 1.08
              }}
            >
              New Arrivals
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              component={Link}
              to="/products"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
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
              <span>VIEW ALL NEW ARRIVALS</span>
              <ArrowForwardOutlined sx={{ fontSize: 16 }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => scroll('left')}
                aria-label="Previous new arrivals"
                size="small"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid var(--line, #e5dccb)',
                  bgcolor: '#FFFFFF',
                  color: 'var(--ink, #1a1420)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  '&:hover': { bgcolor: 'var(--ink, #1a1420)', color: '#FFFFFF' }
                }}
              >
                <ArrowBackIosNewOutlined sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                onClick={() => scroll('right')}
                aria-label="Next new arrivals"
                size="small"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid var(--line, #e5dccb)',
                  bgcolor: '#FFFFFF',
                  color: 'var(--ink, #1a1420)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  '&:hover': { bgcolor: 'var(--ink, #1a1420)', color: '#FFFFFF' }
                }}
              >
                <ArrowForwardIosOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Product Cards Track */}
        <Box
          ref={trackRef}
          onScroll={handleScroll}
          sx={{
            display: 'flex',
            gap: 3.5,
            overflowX: 'auto',
            pb: 4,
            pt: 1,
            px: 0.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollSnapType: 'x mandatory'
          }}
        >
          {NEW_ARRIVALS.map((product) => {
            const isHovered = hoveredCard === product.id;
            const isSaved = wishlistState[product.id] || false;
            const chosenSize = selectedSizes[product.id] || 'M';

            return (
              <Box
                key={product.id}
                component={Link}
                to={`/products?item=${product.id}`}
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  flex: { xs: '0 0 270px', sm: '0 0 310px', md: '0 0 340px' },
                  scrollSnapAlign: 'start',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.35s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                {/* Pastel Frame Card */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    pt: '130%',
                    borderRadius: '22px',
                    overflow: 'hidden',
                    bgcolor: product.bgColor,
                    border: '1px solid rgba(26, 20, 32, 0.08)',
                    boxShadow: '0 12px 30px rgba(26, 20, 32, 0.06)',
                    mb: 2.2
                  }}
                >
                  {/* Model Image */}
                  <Box
                    component="img"
                    src={product.imageUrl}
                    alt={product.title}
                    loading="lazy"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />

                  {/* Top Badges */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      right: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      zIndex: 3
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.6,
                        py: 0.5,
                        borderRadius: '999px',
                        bgcolor: '#1a1420',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        fontFamily: '"Instrument Sans", sans-serif',
                        textTransform: 'uppercase'
                      }}
                    >
                      {product.badge}
                    </Box>

                    {/* Wishlist Button */}
                    <IconButton
                      onClick={(e) => toggleWishlist(product.id, e)}
                      aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                      size="small"
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        color: isSaved ? '#d92672' : '#1a1420',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: '#FFFFFF', transform: 'scale(1.08)' }
                      }}
                    >
                      {isSaved ? <FavoriteOutlined sx={{ fontSize: 18 }} /> : <FavoriteBorderOutlined sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </Box>

                  {/* Lime Floating VIEW Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '46%',
                      left: '50%',
                      transform: `translate(-50%, -50%) scale(${isHovered ? 1 : 0.8})`,
                      opacity: isHovered ? 1 : 0,
                      px: 2.2,
                      py: 0.7,
                      borderRadius: '999px',
                      bgcolor: 'var(--lime, #d8f25a)',
                      color: '#1a1420',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      letterSpacing: '0.12em',
                      fontFamily: '"Instrument Sans", sans-serif',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                      pointerEvents: 'none',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: 4
                    }}
                  >
                    VIEW
                  </Box>

                  {/* Quick Add Overlay on Hover */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 2,
                      bgcolor: 'rgba(26, 20, 32, 0.88)',
                      backdropFilter: 'blur(12px)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: 3
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#FFFFFF',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        fontSize: '0.66rem',
                        textTransform: 'uppercase',
                        fontFamily: '"Instrument Sans", sans-serif'
                      }}
                    >
                      QUICK ADD SIZE
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                        <Box
                          key={size}
                          component="button"
                          type="button"
                          onClick={(e) => selectSize(product.id, size, e)}
                          sx={{
                            flex: 1,
                            py: 0.5,
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: chosenSize === size ? 'var(--lime, #d8f25a)' : 'rgba(255, 255, 255, 0.25)',
                            bgcolor: chosenSize === size ? 'var(--lime, #d8f25a)' : 'transparent',
                            color: chosenSize === size ? '#1a1420' : '#FFFFFF',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            fontFamily: '"Instrument Sans", sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {size}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Product Metadata */}
                <Box sx={{ px: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontSize: '1.18rem',
                        fontWeight: 600,
                        color: 'var(--ink, #1a1420)'
                      }}
                    >
                      {product.title}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 700,
                        color: 'var(--ink, #1a1420)',
                        fontSize: '1.02rem'
                      }}
                    >
                      {product.price}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--mute, #6b6173)',
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: '0.84rem',
                      mb: 1.2
                    }}
                  >
                    {product.subtitle}
                  </Typography>

                  {/* Swatches dots */}
                  <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                    {product.swatches.map((color, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: color,
                          border: '1px solid rgba(0,0,0,0.15)'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Scroll Progress Indicator Bar */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            mx: 'auto',
            height: 3,
            bgcolor: 'rgba(26, 20, 32, 0.1)',
            borderRadius: '999px',
            mt: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '40%',
              transform: `translateX(${(scrollProgress * 1.5).toFixed(1)}%)`,
              bgcolor: 'var(--ink, #1a1420)',
              borderRadius: '999px',
              transition: 'transform 0.1s linear'
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default NewArrivalsTrack;

