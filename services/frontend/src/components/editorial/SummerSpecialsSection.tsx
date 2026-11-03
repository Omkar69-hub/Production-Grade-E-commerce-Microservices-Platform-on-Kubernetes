import React, { useState } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { StarRounded, ShoppingBagOutlined, ArrowForwardOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface SummerItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  price: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  sizes: string[];
}

const SUMMER_ITEMS: SummerItem[] = [
  {
    id: 'sum-1',
    category: 'DRESSES',
    title: 'Lemon Pleated Midi Skirt',
    subtitle: 'Satin • Sunray accordion pleats',
    price: '₹19,200',
    rating: 4.8,
    reviews: 94,
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 'sum-2',
    category: 'CO-ORDS',
    title: 'Aqua Crochet Co-ord',
    subtitle: 'Hand-crocheted cotton • Two-piece',
    price: '₹20,200',
    rating: 4.7,
    reviews: 112,
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    sizes: ['S', 'M', 'L']
  },
  {
    id: 'sum-3',
    category: 'LINEN',
    title: 'Ultramarine Flare Jeans',
    subtitle: 'Rigid organic denim • High-rise flare',
    price: '₹15,200',
    rating: 4.6,
    reviews: 86,
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=900',
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 'sum-4',
    category: 'DRESSES',
    title: 'Cobalt Camp-Collar Shirt',
    subtitle: 'Washed French linen • Boxy silhouette',
    price: '₹12,800',
    rating: 4.9,
    reviews: 145,
    imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=900',
    sizes: ['S', 'M', 'L', 'XL']
  }
];

export const SummerSpecialsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeSizes, setActiveSizes] = useState<Record<string, string>>({});
  const [cartCount, setCartCount] = useState<Record<string, boolean>>({});

  const handleSizeSelect = (itemId: string, size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSizes(prev => ({ ...prev, [itemId]: size }));
  };

  const handleAddToCart = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCartCount(prev => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setCartCount(prev => ({ ...prev, [itemId]: false }));
    }, 1500);
  };

  const filtered = selectedCategory === 'ALL'
    ? SUMMER_ITEMS
    : SUMMER_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <Box
      component="section"
      aria-label="Summer Specials and Trending Today"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid var(--line, #e5dccb)'
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            mb: 5,
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
                  bgcolor: '#e7c04a'
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
                SUMMER DROP
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
              Summer Specials
            </Typography>
          </Box>

          <Box
            component={Link}
            to="/products?season=summer"
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
            <span>SHOP SUMMER</span>
            <ArrowForwardOutlined sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Filter Pills */}
        <Box sx={{ display: 'flex', gap: 1.2, mb: 4, overflowX: 'auto', pb: 0.5 }}>
          {['ALL', 'DRESSES', 'CO-ORDS', 'LINEN'].map((cat) => (
            <Box
              key={cat}
              component="button"
              type="button"
              onClick={() => setSelectedCategory(cat)}
              sx={{
                px: 2.2,
                py: 0.8,
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--ink, #1a1420)' : 'var(--line, #e5dccb)',
                bgcolor: selectedCategory === cat ? 'var(--ink, #1a1420)' : 'transparent',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--ink, #1a1420)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: '"Instrument Sans", sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </Box>
          ))}
        </Box>

        {/* Product Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            gap: 3.5
          }}
        >
          {filtered.map((item) => {
            const chosenSize = activeSizes[item.id] || item.sizes[0];
            const isAdded = cartCount[item.id] || false;

            return (
              <Box
                key={item.id}
                component={Link}
                to={`/products?item=${item.id}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid var(--line, #e5dccb)',
                  overflow: 'hidden',
                  p: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 36px rgba(26, 20, 32, 0.08)'
                  }
                }}
              >
                {/* Visual Area */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    pt: '120%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    bgcolor: '#FAF7F2',
                    mb: 2
                  }}
                >
                  <Box
                    component="img"
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Rating Tag */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '999px',
                      bgcolor: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(8px)',
                      color: '#1a1420',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      fontFamily: '"Instrument Sans", sans-serif'
                    }}
                  >
                    <StarRounded sx={{ color: '#e7c04a', fontSize: 15 }} />
                    <span>{item.rating}</span>
                    <span style={{ color: '#888' }}>({item.reviews})</span>
                  </Box>
                </Box>

                {/* Info */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: '1.14rem',
                      fontWeight: 600,
                      color: 'var(--ink, #1a1420)',
                      mb: 0.4
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--mute, #6b6173)',
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: '0.82rem',
                      mb: 1.8,
                      flexGrow: 1
                    }}
                  >
                    {item.subtitle}
                  </Typography>

                  {/* Size Selectors Chips */}
                  <Box sx={{ display: 'flex', gap: 0.8, mb: 2 }}>
                    {item.sizes.map((sz) => (
                      <Box
                        key={sz}
                        component="button"
                        type="button"
                        onClick={(e) => handleSizeSelect(item.id, sz, e)}
                        sx={{
                          px: 1.2,
                          py: 0.4,
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: chosenSize === sz ? 'var(--ink, #1a1420)' : 'var(--line, #e5dccb)',
                          bgcolor: chosenSize === sz ? 'var(--ink, #1a1420)' : 'transparent',
                          color: chosenSize === sz ? '#FFFFFF' : 'var(--ink, #1a1420)',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          fontFamily: '"Instrument Sans", sans-serif',
                          cursor: 'pointer'
                        }}
                      >
                        {sz}
                      </Box>
                    ))}
                  </Box>

                  {/* Price & Yellow Round Bag Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid var(--line, #e5dccb)' }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 700,
                        color: 'var(--ink, #1a1420)',
                        fontSize: '1.08rem'
                      }}
                    >
                      {item.price}
                    </Typography>

                    <IconButton
                      onClick={(e) => handleAddToCart(item.id, e)}
                      aria-label="Add to bag"
                      size="small"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: isAdded ? 'var(--lime, #d8f25a)' : '#E7C04A',
                        color: '#1a1420',
                        boxShadow: '0 4px 12px rgba(231, 192, 74, 0.35)',
                        '&:hover': {
                          bgcolor: '#d8b038',
                          transform: 'scale(1.06)'
                        }
                      }}
                    >
                      <ShoppingBagOutlined sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default SummerSpecialsSection;

