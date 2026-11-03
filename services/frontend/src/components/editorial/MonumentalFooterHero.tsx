import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const MonumentalFooterHero: React.FC = () => {
  return (
    <Box
      component="section"
      aria-label="Lumière Monumental Terrace Footer"
      sx={{
        position: 'relative',
        minHeight: { xs: 440, md: 560 },
        bgcolor: '#120F18',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        py: { xs: 6, md: 8 },
        overflow: 'hidden',
        borderTop: '1px solid var(--line, #e5dccb)'
      }}
    >
      {/* Editorial Luxury Terrace Background Photo */}
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920"
        alt="Lumière Sea Terrace Editorial"
        loading="lazy"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.65) saturate(1.2)'
        }}
      />

      {/* Luxury Aubergine / Silk Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(18, 15, 24, 0.4) 0%, rgba(18, 15, 24, 0.75) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Details */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: '0.22em',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: 'var(--lime, #d8f25a)',
              fontFamily: '"Instrument Sans", sans-serif'
            }}
          >
            HAUTE ATELIER DISCOVERY • EST. 2026
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            {['INSTAGRAM', 'PINTEREST', 'SPOTIFY', 'EDITORIAL'].map((item) => (
              <Box
                key={item}
                component="a"
                href="#footer"
                sx={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  fontFamily: '"Instrument Sans", sans-serif',
                  transition: 'color 0.2s ease',
                  '&:hover': { color: 'var(--lime, #d8f25a)' }
                }}
              >
                {item}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Center / Bottom Monumental Typography: L U M I È R E */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, my: 'auto', textAlign: 'center' }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: { xs: 'clamp(48px, 14vw, 110px)', md: 'clamp(90px, 16vw, 240px)' },
            fontWeight: 400,
            letterSpacing: { xs: '0.15em', md: '0.22em' },
            textTransform: 'uppercase',
            color: '#FFFFFF',
            lineHeight: 0.9,
            textShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
            userSelect: 'none'
          }}
        >
          LUMIÈRE
        </Typography>
      </Container>

      {/* Footer Legal & Copyright */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            gap: 2
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '0.78rem',
              color: 'rgba(255, 255, 255, 0.75)'
            }}
          >
            © 2026 LUMIÈRE. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              to="/brands"
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                textDecoration: 'none',
                fontSize: '0.76rem',
                fontFamily: '"Instrument Sans", sans-serif'
              }}
            >
              55+ Maisons Directory
            </Link>
            <Link
              to="/products"
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                textDecoration: 'none',
                fontSize: '0.76rem',
                fontFamily: '"Instrument Sans", sans-serif'
              }}
            >
              All Garment Capsules
            </Link>
            <Link
              to="/wishlist"
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                textDecoration: 'none',
                fontSize: '0.76rem',
                fontFamily: '"Instrument Sans", sans-serif'
              }}
            >
              Wishlist Vault
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MonumentalFooterHero;

