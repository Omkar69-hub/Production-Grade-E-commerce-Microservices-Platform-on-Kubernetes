import React, { useState } from 'react';
import { Box, Container, Typography, Button, IconButton } from '@mui/material';
import {
  NorthEastOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShoppingBagOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface EveningProduct {
  id: string;
  badge: 'LIMITED RUN' | 'BESTSELLER' | 'EDITORIAL';
  title: string;
  subtitle: string;
  price: string;
  imageUrl: string;
}

const EVENING_PRODUCTS: EveningProduct[] = [
  {
    id: 'eve-1',
    badge: 'LIMITED RUN',
    title: 'Emerald Sequin Column Gown',
    subtitle: 'Micro-sequin embroidery • Architectural split',
    price: '₹43,500',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900'
  },
  {
    id: 'eve-2',
    badge: 'BESTSELLER',
    title: 'Fuchsia Satin Wrap Dress',
    subtitle: 'Heavy Italian satin • Fluted sleeve',
    price: '₹24,500',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900'
  },
  {
    id: 'eve-3',
    badge: 'LIMITED RUN',
    title: 'Gilded Lamé Midi Dress',
    subtitle: 'Metallic thread pleating • Halter neck',
    price: '₹28,500',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=900'
  },
  {
    id: 'eve-4',
    badge: 'EDITORIAL',
    title: 'Aubergine Velvet Tuxedo',
    subtitle: 'Silk-blend velvet • Satin peak lapel',
    price: '₹49,500',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900'
  }
];

export const EveningEditSection: React.FC = () => {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedToBag, setAddedToBag] = useState<Record<string, boolean>>({});

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToBag = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToBag(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedToBag(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <Box
      component="section"
      aria-label="After Dark The Evening Edit"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: '#2B1238', // Deep aubergine purple
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}
    >
      {/* Subtle Purple Silk Atmospheric Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(142, 68, 173, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(216, 242, 90, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Heading */}
        <Box sx={{ maxWidth: 780, mb: { xs: 6, md: 8 } }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, mb: 1.8 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'var(--lime, #d8f25a)',
                boxShadow: '0 0 10px rgba(216, 242, 90, 0.6)'
              }}
            />
            <Typography
              variant="overline"
              sx={{
                color: 'var(--lime, #d8f25a)',
                fontWeight: 700,
                letterSpacing: '0.22em',
                fontSize: '0.78rem',
                fontFamily: '"Instrument Sans", sans-serif'
              }}
            >
              AFTER DARK
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: { xs: '2.5rem', sm: '3.4rem', md: '4.2rem' },
              fontWeight: 500,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              mb: 2.2
            }}
          >
            The Evening Edit
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Instrument Sans", sans-serif',
              color: 'rgba(255, 255, 255, 0.78)',
              fontSize: { xs: '1.02rem', md: '1.18rem' },
              lineHeight: 1.65,
              maxWidth: 640
            }}
          >
            Sequins that catch every candle, satin that moves like water — for the nights you'll still be talking about in the morning.
          </Typography>
        </Box>

        {/* Evening Content Grid: Featured Left Column + Horizontal Product Track */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '380px 1fr' },
            gap: 4,
            alignItems: 'stretch'
          }}
        >
          {/* Featured Left Campaign Look */}
          <Box
            component={Link}
            to="/products?tag=evening"
            sx={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              textDecoration: 'none',
              bgcolor: '#1E0C28',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 3.5,
              minHeight: { xs: 360, lg: 500 },
              transition: 'transform 0.4s ease, border-color 0.4s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: 'var(--lime, #d8f25a)'
              }
            }}
          >
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1200"
              alt="The Evening Collection Campaign"
              loading="lazy"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.85)',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            />

            {/* Gradient Overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(43, 18, 56, 0.95) 0%, rgba(43, 18, 56, 0.2) 60%, transparent 100%)',
                pointerEvents: 'none'
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.2,
                  px: 2.2,
                  borderRadius: '999px',
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  fontFamily: '"Instrument Sans", sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'var(--lime, #d8f25a)',
                    color: '#1a1420'
                  }
                }}
              >
                <span>View the collection</span>
                <NorthEastOutlined sx={{ fontSize: 16 }} />
              </Box>
            </Box>
          </Box>

          {/* Right Product Cards Track */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            {EVENING_PRODUCTS.map((prod) => {
              const isSaved = wishlist[prod.id] || false;
              const isAdded = addedToBag[prod.id] || false;

              return (
                <Box
                  key={prod.id}
                  component={Link}
                  to={`/products?item=${prod.id}`}
                  sx={{
                    flex: { xs: '0 0 250px', sm: '0 0 280px', md: '0 0 300px' },
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    p: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: 'rgba(216, 242, 90, 0.6)',
                      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)'
                    }
                  }}
                >
                  {/* Card Visual */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '125%',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      bgcolor: '#190A20',
                      mb: 2
                    }}
                  >
                    <Box
                      component="img"
                      src={prod.imageUrl}
                      alt={prod.title}
                      loading="lazy"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />

                    {/* Top Badges */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        right: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 2
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.4,
                          py: 0.4,
                          borderRadius: '999px',
                          bgcolor: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFFFFF',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          fontFamily: '"Instrument Sans", sans-serif'
                        }}
                      >
                        {prod.badge}
                      </Box>

                      <IconButton
                        onClick={(e) => toggleWishlist(prod.id, e)}
                        aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                        size="small"
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'rgba(0, 0, 0, 0.6)',
                          backdropFilter: 'blur(8px)',
                          color: isSaved ? '#d92672' : '#FFFFFF',
                          '&:hover': { bgcolor: '#FFFFFF', color: '#1a1420' }
                        }}
                      >
                        {isSaved ? <FavoriteOutlined sx={{ fontSize: 16 }} /> : <FavoriteBorderOutlined sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Card Info */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontSize: '1.12rem',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        mb: 0.4
                      }}
                    >
                      {prod.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: '0.8rem',
                        lineHeight: 1.4,
                        mb: 2,
                        flexGrow: 1
                      }}
                    >
                      {prod.subtitle}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontSize: '1.08rem'
                        }}
                      >
                        {prod.price}
                      </Typography>
                    </Box>

                    {/* Bright Yellow ADD TO BAG Button */}
                    <Button
                      onClick={(e) => handleAddToBag(prod.id, e)}
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingBagOutlined sx={{ fontSize: 16 }} />}
                      sx={{
                        bgcolor: isAdded ? 'var(--lime, #d8f25a)' : '#E7C04A',
                        color: '#1a1420',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        fontFamily: '"Instrument Sans", sans-serif',
                        letterSpacing: '0.08em',
                        borderRadius: '999px',
                        py: 1,
                        boxShadow: '0 4px 14px rgba(231, 192, 74, 0.3)',
                        '&:hover': {
                          bgcolor: '#d8b038',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {isAdded ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default EveningEditSection;

