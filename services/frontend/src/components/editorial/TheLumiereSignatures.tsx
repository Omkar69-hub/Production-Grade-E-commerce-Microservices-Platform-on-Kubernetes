import React, { useState, useRef } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { ArrowForwardOutlined, ArrowBackIosNewOutlined, ArrowForwardIosOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface SignatureLook {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  price: string;
  imageUrl: string;
  colorDot: string;
}

const SIGNATURE_TABS = [
  'SUNDAY TAILORING',
  'DENIM, REWORKED',
  'SILK & SLIP',
  'KNIT CLUB',
  'AFTER DARK',
  'RESORT EDIT'
];

const SIGNATURE_LOOKS: SignatureLook[] = [
  {
    id: 'sig-1',
    category: 'SILK & SLIP',
    title: 'Fuchsia Satin Wrap Dress',
    subtitle: 'Heavy Satin • Bias drape',
    price: '₹24,500',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
    colorDot: '#d92672'
  },
  {
    id: 'sig-2',
    category: 'SUNDAY TAILORING',
    title: 'Riviera Linen Blazer',
    subtitle: 'Linen-silk • Relaxed double-breasted',
    price: '₹28,500',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    colorDot: '#e8c547'
  },
  {
    id: 'sig-3',
    category: 'SILK & SLIP',
    title: 'Cobalt Silk Slip Dress',
    subtitle: '100% Mulberry silk • Fluid cut',
    price: '₹21,800',
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    colorDot: '#3a3ce0'
  },
  {
    id: 'sig-4',
    category: 'DENIM, REWORKED',
    title: 'Ultramarine Flare Jeans',
    subtitle: 'Rigid organic denim • High-rise',
    price: '₹15,200',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=900',
    colorDot: '#264e86'
  },
  {
    id: 'sig-5',
    category: 'KNIT CLUB',
    title: 'Aqua Crochet Co-ord',
    subtitle: 'Hand-crocheted cotton • Two-piece',
    price: '₹20,200',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    colorDot: '#4ecdc4'
  },
  {
    id: 'sig-6',
    category: 'AFTER DARK',
    title: 'Emerald Sequin Column Gown',
    subtitle: 'Micro-sequin embroidery • Split hem',
    price: '₹43,500',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900',
    colorDot: '#0f4734'
  },
  {
    id: 'sig-7',
    category: 'RESORT EDIT',
    title: 'Sorbet Silk Habotai Shirt',
    subtitle: 'Washed Habotai silk • Camp collar',
    price: '₹18,500',
    imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=900',
    colorDot: '#f7b05b'
  }
];

export const TheLumiereSignatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollTrackRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredLooks = activeTab === 'ALL'
    ? SIGNATURE_LOOKS
    : SIGNATURE_LOOKS.filter((look) => look.category === activeTab);

  return (
    <Box
      component="section"
      aria-label="The Lumière Signatures Arched Looks"
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
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          textAlign: 'center',
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 'clamp(60px, 14vw, 190px)',
          fontWeight: 800,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(229, 220, 203, 0.45)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 1,
          letterSpacing: '0.04em'
        }}
      >
        SIGNATURES • SIGNATURES
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            mb: 4,
            gap: 2
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#e8572b'
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
                THE LUMIÈRE SIGNATURES
              </Typography>
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
                fontWeight: 500,
                color: 'var(--ink, #1a1420)',
                letterSpacing: '-0.025em',
                lineHeight: 1.1
              }}
            >
              Cut to Be{' '}
              <Box component="span" sx={{ fontStyle: 'italic', color: 'var(--cobalt, #3a3ce0)' }}>
                Remembered
              </Box>
            </Typography>
          </Box>

          {/* Action and Arrow Controls */}
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
              <span>EXPLORE THE EDIT</span>
              <ArrowForwardOutlined sx={{ fontSize: 16 }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => scroll('left')}
                aria-label="Previous signature look"
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
                aria-label="Next signature look"
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

        {/* Category Pills Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            mb: 5,
            overflowX: 'auto',
            pb: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => setActiveTab('ALL')}
            sx={{
              px: 2.2,
              py: 0.8,
              borderRadius: '999px',
              border: '1px solid',
              borderColor: activeTab === 'ALL' ? 'var(--ink, #1a1420)' : 'var(--line, #e5dccb)',
              bgcolor: activeTab === 'ALL' ? 'var(--ink, #1a1420)' : '#FFFFFF',
              color: activeTab === 'ALL' ? '#FFFFFF' : 'var(--ink, #1a1420)',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: '"Instrument Sans", sans-serif',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            ALL SIGNATURES
          </Box>
          {SIGNATURE_TABS.map((tab) => (
            <Box
              key={tab}
              component="button"
              type="button"
              onClick={() => setActiveTab(tab)}
              sx={{
                px: 2.2,
                py: 0.8,
                borderRadius: '999px',
                border: '1px solid',
                borderColor: activeTab === tab ? 'var(--ink, #1a1420)' : 'var(--line, #e5dccb)',
                bgcolor: activeTab === tab ? 'var(--ink, #1a1420)' : '#FFFFFF',
                color: activeTab === tab ? '#FFFFFF' : 'var(--ink, #1a1420)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: '"Instrument Sans", sans-serif',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        {/* Arched Cards Track */}
        <Box
          ref={scrollTrackRef}
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
          {filteredLooks.map((look) => (
            <Box
              key={look.id}
              component={Link}
              to="/products"
              sx={{
                flex: { xs: '0 0 280px', sm: '0 0 320px', md: '0 0 350px' },
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'translateY(-6px)'
                }
              }}
            >
              {/* Arched Top Image Container */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  pt: '142%', // Elegant statuesque proportions
                  borderRadius: '160px 160px 24px 24px',
                  overflow: 'hidden',
                  bgcolor: '#F0ECE1',
                  boxShadow: '0 16px 36px rgba(26, 20, 32, 0.08)',
                  border: '1px solid var(--line, #e5dccb)',
                  mb: 2.2
                }}
              >
                <Box
                  component="img"
                  src={look.imageUrl}
                  alt={look.title}
                  loading="lazy"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                />

                {/* Corner Color Dot Accent */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: look.colorDot,
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                />
              </Box>

              {/* Card Meta */}
              <Box sx={{ px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: '1.22rem',
                      fontWeight: 600,
                      color: 'var(--ink, #1a1420)'
                    }}
                  >
                    {look.title}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontWeight: 700,
                      color: 'var(--ink, #1a1420)',
                      fontSize: '1.05rem'
                    }}
                  >
                    {look.price}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--mute, #6b6173)',
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: '0.86rem'
                  }}
                >
                  {look.subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default TheLumiereSignatures;

