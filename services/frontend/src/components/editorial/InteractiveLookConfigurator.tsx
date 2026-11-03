import React, { useState } from 'react';
import { Box, Container, Typography, Button, IconButton } from '@mui/material';
import {
  StarRounded,
  PlayArrowRounded,
  ArrowForwardOutlined,
  AddOutlined,
  RemoveOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface LookOption {
  id: string;
  name: string;
  price: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  imageUrl: string;
  thumbnailUrl: string;
  colors: { name: string; hex: string }[];
}

const LOOKS: LookOption[] = [
  {
    id: 'cobalt-slip',
    name: 'THE COBALT SLIP',
    price: '₹21,800',
    rating: 4.8,
    reviews: 412,
    description: 'Bias-cut from Italian deadstock silk in the bluest blue we could find. Pools like water, packs like a secret, goes everywhere.',
    features: ['100% Mulberry Silk', 'Bias-cut drape', 'Featherlight', 'Made in Italy'],
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300',
    colors: [
      { name: 'Cobalt', hex: '#3a3ce0' },
      { name: 'Tangerine', hex: '#e8572b' },
      { name: 'Champagne', hex: '#f4e8c1' },
      { name: 'Noir', hex: '#1a1420' }
    ]
  },
  {
    id: 'riviera-suit',
    name: 'THE RIVIERA SUIT',
    price: '₹46,800',
    rating: 4.9,
    reviews: 284,
    description: 'Linen-silk, double-breasted and softly structured — cut in Porto to move the way you do. Wear it together, or break it apart all summer.',
    features: ['Linen-silk blend', 'Half-canvas', 'Free alterations', 'Made in Portugal'],
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=300',
    colors: [
      { name: 'Oatmeal', hex: '#d8c292' },
      { name: 'Saffron', hex: '#e69f4b' },
      { name: 'Midnight', hex: '#120f18' }
    ]
  },
  {
    id: 'tangerine-column',
    name: 'THE TANGERINE COLUMN',
    price: '₹32,000',
    rating: 4.7,
    reviews: 176,
    description: 'High-twist silk crepe in sun-drenched citrus. Architectural neckline falling into a fluid column silhouette with hand-rolled hems.',
    features: ['Pure Silk Crepe', 'Architectural Neck', 'Hand-rolled hem', 'Made in Lyon'],
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300',
    colors: [
      { name: 'Tangerine', hex: '#e8572b' },
      { name: 'Fuchsia', hex: '#d92672' },
      { name: 'Ivory', hex: '#faf7f2' }
    ]
  }
];

export const InteractiveLookConfigurator: React.FC = () => {
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const look = LOOKS[activeLookIndex];

  const handleAdd = () => {
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <Box
      component="section"
      aria-label="Interactive Lookbook Feature and Garment Configurator"
      sx={{
        py: { xs: 8, md: 14 },
        bgcolor: 'var(--bg, #fbf6ec)',
        borderBottom: '1px solid var(--line, #e5dccb)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '140px 1.1fr 1fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center'
          }}
        >
          {/* Left: Look Switcher Column */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', lg: 'column' },
              gap: 2.5,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* "Change look" Cursive Indicator */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                mb: 1
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'cursive, "Brush Script MT", "Caveat", serif',
                  fontSize: '1.25rem',
                  color: 'var(--cobalt, #3a3ce0)',
                  transform: 'rotate(-8deg)'
                }}
              >
                Change look ↷
              </Typography>
            </Box>

            {LOOKS.map((item, idx) => {
              const isCurrent = idx === activeLookIndex;
              return (
                <Box
                  key={item.id}
                  component="button"
                  type="button"
                  onClick={() => {
                    setActiveLookIndex(idx);
                    setSelectedColorIndex(0);
                  }}
                  sx={{
                    width: { xs: 72, sm: 84, lg: 96 },
                    height: { xs: 96, sm: 110, lg: 124 },
                    borderRadius: '16px',
                    overflow: 'hidden',
                    p: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    border: '2px solid',
                    borderColor: isCurrent ? 'var(--cobalt, #3a3ce0)' : 'transparent',
                    boxShadow: isCurrent ? '0 8px 24px rgba(58, 60, 224, 0.25)' : '0 4px 12px rgba(0,0,0,0.06)',
                    transform: isCurrent ? 'scale(1.06)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    bgcolor: '#FAF7F2'
                  }}
                >
                  <Box
                    component="img"
                    src={item.thumbnailUrl}
                    alt={item.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isCurrent && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px solid var(--lime, #d8f25a)',
                        borderRadius: '14px',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Center: Circular Focus Stage with Model */}
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                width: { xs: 300, sm: 400, md: 460 },
                height: { xs: 300, sm: 400, md: 460 },
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(26, 20, 32, 0.15)',
                border: '6px solid #FFFFFF',
                bgcolor: '#FFFFFF'
              }}
            >
              <Box
                component="img"
                src={look.imageUrl}
                alt={look.name}
                loading="eager"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease'
                }}
              />

              {/* Watch Lookbook Pill Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 28,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(26, 20, 32, 0.88)',
                  backdropFilter: 'blur(16px)',
                  color: '#FFFFFF',
                  px: 2.5,
                  py: 1,
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.2,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'var(--lime, #d8f25a)',
                    color: '#1a1420'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'var(--lime, #d8f25a)',
                    color: '#1a1420',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PlayArrowRounded sx={{ fontSize: 16 }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: '"Instrument Sans", sans-serif'
                  }}
                >
                  Watch lookbook
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right: Garment Configurator Panel */}
          <Box sx={{ maxWidth: 520, mx: { xs: 'auto', lg: 0 } }}>
            {/* Rating and Shop All */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {[...Array(5)].map((_, i) => (
                  <StarRounded key={i} sx={{ color: '#E7C04A', fontSize: 18 }} />
                ))}
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', ml: 0.5, fontFamily: '"Instrument Sans", sans-serif' }}>
                  {look.rating}
                </Typography>
                <Typography sx={{ color: 'var(--mute, #6b6173)', fontSize: '0.82rem', fontFamily: '"Instrument Sans", sans-serif' }}>
                  ({look.reviews})
                </Typography>
              </Box>

              <Box
                component={Link}
                to="/products"
                sx={{
                  color: 'var(--ink, #1a1420)',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontFamily: '"Instrument Sans", sans-serif',
                  '&:hover': { color: 'var(--cobalt, #3a3ce0)' }
                }}
              >
                SHOP ALL →
              </Box>
            </Box>

            {/* Title & Price */}
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: { xs: '2rem', sm: '2.6rem' },
                fontWeight: 600,
                color: 'var(--ink, #1a1420)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                mb: 1
              }}
            >
              {look.name}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontWeight: 700,
                color: 'var(--ink, #1a1420)',
                fontSize: '1.45rem',
                mb: 2.5
              }}
            >
              {look.price}
            </Typography>

            {/* Silk / Tailoring Description */}
            <Typography
              variant="body1"
              sx={{
                color: 'var(--mute, #6b6173)',
                fontSize: '0.96rem',
                lineHeight: 1.65,
                fontFamily: '"Instrument Sans", sans-serif',
                mb: 3.5
              }}
            >
              {look.description}
            </Typography>

            {/* Feature Pills */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3.5 }}>
              {look.features.map((feat) => (
                <Box
                  key={feat}
                  sx={{
                    px: 1.8,
                    py: 0.6,
                    borderRadius: '999px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid var(--line, #e5dccb)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    fontFamily: '"Instrument Sans", sans-serif',
                    color: 'var(--ink, #1a1420)'
                  }}
                >
                  ✓ {feat}
                </Box>
              ))}
            </Box>

            {/* Size Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1, fontFamily: '"Instrument Sans", sans-serif' }}>
                SIZE: {selectedSize}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['XS', 'S', 'M', 'L', 'XL'].map((sz) => (
                  <Box
                    key={sz}
                    component="button"
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedSize === sz ? 'var(--ink, #1a1420)' : 'var(--line, #e5dccb)',
                      bgcolor: selectedSize === sz ? 'var(--ink, #1a1420)' : '#FFFFFF',
                      color: selectedSize === sz ? '#FFFFFF' : 'var(--ink, #1a1420)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: '"Instrument Sans", sans-serif',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {sz}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Color Swatch Selector */}
            <Box sx={{ mb: 3.5 }}>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1, fontFamily: '"Instrument Sans", sans-serif' }}>
                COLOR: {look.colors[selectedColorIndex]?.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.2 }}>
                {look.colors.map((c, idx) => (
                  <Box
                    key={c.name}
                    component="button"
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: c.hex,
                      p: 0,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedColorIndex === idx ? 'var(--cobalt, #3a3ce0)' : 'transparent',
                      outline: selectedColorIndex === idx ? '2px solid #FFFFFF' : 'none',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s ease',
                      '&:hover': { transform: 'scale(1.12)' }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Quantity and Angled ADD TO BAG Button */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#FFFFFF',
                  borderRadius: '999px',
                  border: '1px solid var(--line, #e5dccb)',
                  px: 1,
                  py: 0.5
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <RemoveOutlined sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography sx={{ px: 1.5, fontWeight: 700, fontSize: '0.88rem', fontFamily: '"Instrument Sans", sans-serif' }}>
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <AddOutlined sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <Button
                onClick={handleAdd}
                variant="contained"
                endIcon={<ArrowForwardOutlined sx={{ fontSize: 16 }} />}
                sx={{
                  flexGrow: 1,
                  py: 1.8,
                  px: 4,
                  bgcolor: addedSuccess ? 'var(--lime, #d8f25a)' : 'var(--ink, #1a1420)',
                  color: addedSuccess ? '#1a1420' : '#FFFFFF',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  letterSpacing: '0.08em',
                  fontFamily: '"Instrument Sans", sans-serif',
                  boxShadow: '0 8px 24px rgba(26, 20, 32, 0.2)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: 'var(--cobalt, #3a3ce0)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {addedSuccess ? 'ADDED TO BAG ✓' : 'ADD TO BAG →'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default InteractiveLookConfigurator;

