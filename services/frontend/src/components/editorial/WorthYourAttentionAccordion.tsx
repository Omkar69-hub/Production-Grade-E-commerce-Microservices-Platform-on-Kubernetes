import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { ArrowForwardOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface OfferCard {
  id: string;
  number: string;
  title: string;
  discount: string;
  tag: string;
  description: string;
  imageUrl: string;
  bgColor: string;
}

const OFFERS: OfferCard[] = [
  {
    id: 'off-1',
    number: '01',
    title: 'Summer Silks',
    discount: '-40%',
    tag: 'ENDS SUNDAY',
    description: 'Up to 40% off silk dresses & separates. Hand-finished hems and bespoke dyes.',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
    bgColor: '#1E1228'
  },
  {
    id: 'off-2',
    number: '02',
    title: 'Out of Office',
    discount: '-25%',
    tag: 'LIMITED RUN',
    description: 'Linen separates & cruise resort wear engineered for effortless warm-weather travel.',
    imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=1200',
    bgColor: '#1A1820'
  },
  {
    id: 'off-3',
    number: '03',
    title: 'The Shirt Deal',
    discount: 'BONUS',
    tag: 'ATELIER SPECIAL',
    description: 'Complimentary hand-rolled silk pocket square with every bespoke tailored shirt.',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200',
    bgColor: '#201824'
  },
  {
    id: 'off-4',
    number: '04',
    title: 'Evening Capsule',
    discount: '-30%',
    tag: 'EXCLUSIVE',
    description: 'Private preview pricing on handcrafted micro-sequin gowns and satin wrap dresses.',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1200',
    bgColor: '#181220'
  },
  {
    id: 'off-5',
    number: '05',
    title: 'Monochrome Edit',
    discount: '-20%',
    tag: 'TIMELESS',
    description: 'Architectural noir & ivory tailoring built for sharp trans-seasonal longevity.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
    bgColor: '#1F1A28'
  },
  {
    id: 'off-6',
    number: '06',
    title: 'Weekend Tailoring',
    discount: '-35%',
    tag: 'CURATED',
    description: 'Unlined hopsack blazers and fluid double-pleat trousers crafted from Italian mills.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
    bgColor: '#241B2E'
  }
];

export const WorthYourAttentionAccordion: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string>('off-1');

  return (
    <Box
      component="section"
      aria-label="Worth Your Attention Current Offers"
      sx={{
        py: { xs: 8, md: 14 },
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
          fontSize: 'clamp(55px, 14vw, 190px)',
          fontWeight: 800,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(229, 220, 203, 0.45)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 1,
          letterSpacing: '0.04em'
        }}
      >
        WORTH IT • WORTH IT
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
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
                CURRENT OFFERS
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
              Worth your attention
            </Typography>
          </Box>

          <Box
            component={Link}
            to="/products?filter=offers"
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
            <span>SHOP ALL OFFERS</span>
            <ArrowForwardOutlined sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* 6-Card Interactive Horizontal Accordion */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2.5,
            height: { xs: 'auto', md: 520 },
            alignItems: 'stretch'
          }}
        >
          {OFFERS.map((card) => {
            const isExpanded = expandedId === card.id;

            return (
              <Box
                key={card.id}
                onClick={() => setExpandedId(card.id)}
                sx={{
                  flex: isExpanded ? { xs: 'none', md: 3.5 } : { xs: 'none', md: 0.8 },
                  height: { xs: isExpanded ? 400 : 90, md: '100%' },
                  borderRadius: '24px',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isExpanded ? 'var(--cobalt, #3a3ce0)' : 'var(--line, #e5dccb)',
                  boxShadow: isExpanded ? '0 20px 45px rgba(26, 20, 32, 0.18)' : '0 4px 12px rgba(0,0,0,0.04)',
                  transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                  bgcolor: card.bgColor,
                  color: '#FFFFFF'
                }}
              >
                {/* Background Image */}
                <Box
                  component="img"
                  src={card.imageUrl}
                  alt={card.title}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: isExpanded ? 'brightness(0.85)' : 'grayscale(80%) brightness(0.4)',
                    transition: 'all 0.5s ease'
                  }}
                />

                {/* Dark Gradient Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: isExpanded
                      ? 'linear-gradient(to top, rgba(26, 20, 32, 0.95) 0%, rgba(26, 20, 32, 0.3) 60%, transparent 100%)'
                      : 'rgba(26, 20, 32, 0.65)',
                    transition: 'background 0.4s ease'
                  }}
                />

                {/* Collapsed State View (Vertical text on desktop) */}
                {!isExpanded && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: { xs: 'row', md: 'column' },
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 3,
                      zIndex: 2
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        color: 'var(--lime, #d8f25a)'
                      }}
                    >
                      {card.number}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        writingMode: { xs: 'horizontal-tb', md: 'vertical-rl' },
                        transform: { xs: 'none', md: 'rotate(180deg)' },
                        color: '#FFFFFF'
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        color: '#E7C04A'
                      }}
                    >
                      {card.discount}
                    </Typography>
                  </Box>
                )}

                {/* Expanded State View */}
                {isExpanded && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: { xs: 3, md: 5 },
                      zIndex: 2
                    }}
                  >
                    {/* Top Row: Number and Tag */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          color: 'var(--lime, #d8f25a)'
                        }}
                      >
                        {card.number}
                      </Typography>

                      <Box
                        sx={{
                          px: 2,
                          py: 0.6,
                          borderRadius: '999px',
                          bgcolor: '#E8572B',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          fontFamily: '"Instrument Sans", sans-serif'
                        }}
                      >
                        {card.tag}
                      </Box>
                    </Box>

                    {/* Bottom Area: Massive Discount, Title, Description, and CTA */}
                    <Box>
                      <Typography
                        variant="h1"
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: { xs: '3.5rem', sm: '4.8rem', md: '5.6rem' },
                          fontWeight: 700,
                          color: '#FFFFFF',
                          lineHeight: 0.9,
                          letterSpacing: '-0.04em',
                          mb: 1
                        }}
                      >
                        {card.discount}
                      </Typography>

                      <Typography
                        variant="h3"
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: { xs: '1.6rem', md: '2.2rem' },
                          fontWeight: 600,
                          color: '#FFFFFF',
                          mb: 1.5
                        }}
                      >
                        {card.title}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: { xs: '0.88rem', md: '0.98rem' },
                          lineHeight: 1.5,
                          maxWidth: 420,
                          mb: 3,
                          fontFamily: '"Instrument Sans", sans-serif'
                        }}
                      >
                        {card.description}
                      </Typography>

                      <Box
                        component={Link}
                        to="/products?filter=offers"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1.2,
                          px: 3,
                          py: 1.4,
                          borderRadius: '999px',
                          bgcolor: 'var(--lime, #d8f25a)',
                          color: '#1a1420',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          letterSpacing: '0.08em',
                          fontFamily: '"Instrument Sans", sans-serif',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: '#c6e245',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <span>EXPLORE NOW</span>
                        <ArrowForwardOutlined sx={{ fontSize: 16 }} />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default WorthYourAttentionAccordion;

