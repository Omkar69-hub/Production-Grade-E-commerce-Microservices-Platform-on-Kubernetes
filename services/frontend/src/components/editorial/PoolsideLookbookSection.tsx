import React, { useState, useRef } from 'react';
import { Box, Container, Typography, Button, IconButton } from '@mui/material';
import {
  ArrowForwardOutlined,
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface PoolLook {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

const POOLSIDE_LOOKS: PoolLook[] = [
  {
    id: 'pl-1',
    num: '01',
    title: 'Terry Cloth Wrap',
    subtitle: 'High Noon Shade',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pl-2',
    num: '02',
    title: 'Crochet Halter & Short',
    subtitle: 'Hand-knitted Ecru',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pl-3',
    num: '03',
    title: 'Washed Silk Pareo',
    subtitle: 'Azure & Coral Ombré',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pl-4',
    num: '04',
    title: 'Linen Deck Overshirt',
    subtitle: 'Raw Hem French Weave',
    imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pl-5',
    num: '05',
    title: 'Ribbed Swim Column',
    subtitle: 'Sculpting Compression',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pl-6',
    num: '06',
    title: 'Sunburst Pleated Robe',
    subtitle: 'Featherweight Chiffon',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pl-7',
    num: '07',
    title: 'Bespoke Raffia Tote & Slide',
    subtitle: 'Artisanal Weave',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600'
  }
];

export const PoolsideLookbookSection: React.FC = () => {
  const [activeLook, setActiveLook] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Box
      component="section"
      aria-label="Lumière Lookbook SS 26 Poolside"
      sx={{
        position: 'relative',
        minHeight: { xs: 650, md: 800 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        py: { xs: 6, md: 8 },
        color: '#FFFFFF',
        overflow: 'hidden',
        borderBottom: '1px solid var(--line, #e5dccb)'
      }}
    >
      {/* Full-bleed Poolside Background Photo */}
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920"
        alt="Poolside Resort SS26 Lookbook"
        loading="lazy"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.72)'
        }}
      />

      {/* Atmospheric Overlays */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(26, 20, 32, 0.6) 0%, rgba(26, 20, 32, 0.15) 50%, rgba(26, 20, 32, 0.85) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Bar: Overline + DRAG Pill */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: '0.22em',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: '"Instrument Sans", sans-serif'
            }}
          >
            LUMIÈRE — LOOKBOOK SS / 26
          </Typography>

          <Box
            sx={{
              px: 2,
              py: 0.6,
              borderRadius: '999px',
              bgcolor: 'var(--lime, #d8f25a)',
              color: '#1a1420',
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              fontFamily: '"Instrument Sans", sans-serif',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
            }}
          >
            DRAG
          </Box>
        </Box>
      </Container>

      {/* Center Hero Title & Action */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, my: 'auto', py: 4 }}>
        <Box sx={{ maxWidth: 760 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: { xs: '3.6rem', sm: '5rem', md: '6.4rem' },
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
              mb: 2
            }}
          >
            Poolside
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: '"Instrument Sans", sans-serif',
              color: '#E5DCCB',
              letterSpacing: '0.12em',
              fontWeight: 700,
              fontSize: { xs: '0.82rem', md: '0.94rem' },
              textTransform: 'uppercase',
              mb: 4
            }}
          >
            THE POOL STUDY • CROCHET & TERRY • HIGH NOON • 02
          </Typography>

          <Button
            component={Link}
            to="/products?theme=poolside"
            variant="contained"
            endIcon={<ArrowForwardOutlined sx={{ fontSize: 18 }} />}
            sx={{
              px: 4,
              py: 1.8,
              borderRadius: '999px',
              bgcolor: 'var(--lime, #d8f25a)',
              color: '#1a1420',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.08em',
              fontFamily: '"Instrument Sans", sans-serif',
              boxShadow: '0 8px 24px rgba(216, 242, 90, 0.4)',
              '&:hover': {
                bgcolor: '#c6e245',
                transform: 'translateY(-2px)'
              }
            }}
          >
            SHOP THE LOOK
          </Button>
        </Box>
      </Container>

      {/* Bottom Horizontal Thumbnail Strip (01 to 07) */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.75)',
              fontFamily: '"Instrument Sans", sans-serif',
              letterSpacing: '0.12em',
              fontSize: '0.72rem',
              textTransform: 'uppercase'
            }}
          >
            07 DRAG, SCROLL, OR USE THE ARROW KEYS TO EXPLORE
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => scroll('left')}
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#FFFFFF', color: '#1a1420' }
              }}
            >
              <ArrowBackIosNewOutlined sx={{ fontSize: 13 }} />
            </IconButton>
            <IconButton
              onClick={() => scroll('right')}
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#FFFFFF', color: '#1a1420' }
              }}
            >
              <ArrowForwardIosOutlined sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
        </Box>

        <Box
          ref={trackRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {POOLSIDE_LOOKS.map((item, idx) => {
            const isSelected = idx === activeLook;
            return (
              <Box
                key={item.id}
                onClick={() => setActiveLook(idx)}
                sx={{
                  flex: '0 0 160px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  p: 1,
                  bgcolor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--lime, #d8f25a)' : 'rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'var(--lime, #d8f25a)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 90,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    mb: 1
                  }}
                >
                  <Box
                    component="img"
                    src={item.imageUrl}
                    alt={item.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--lime, #d8f25a)', fontFamily: '"Instrument Sans", sans-serif' }}>
                  {item.num}
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: '"Instrument Sans", sans-serif' }}>
                  {item.title}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default PoolsideLookbookSection;

