import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import {
  ArrowForwardOutlined,
  NorthEastOutlined,
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface CategoryCapsule {
  id: string;
  label: string;
  dotColor: string;
  imageUrl: string;
  link: string;
  hasArrow?: boolean;
}

interface SignatureLook {
  id: string;
  overline: string;
  title: string;
  price: string;
  bgColor: string;
  imageUrl: string;
  link: string;
}

const CATEGORY_CAPSULES: CategoryCapsule[] = [
  {
    id: 'cap-1',
    label: 'SUNDAY TAILORING',
    dotColor: '#E8572B', // Tangerine red
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
    link: '/products?category=tailoring',
    hasArrow: true
  },
  {
    id: 'cap-2',
    label: 'DENIM, REWORKED',
    dotColor: '#3A3CE0', // Cobalt blue
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=900',
    link: '/products?category=denim'
  },
  {
    id: 'cap-3',
    label: 'SILK & SLIP',
    dotColor: '#D92672', // Magenta fuchsia
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    link: '/products?category=silk'
  },
  {
    id: 'cap-4',
    label: 'KNIT CLUB',
    dotColor: '#B4DC45', // Chartreuse lime
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    link: '/products?category=knitwear'
  },
  {
    id: 'cap-5',
    label: 'AFTER DARK',
    dotColor: '#0F4734', // Forest emerald
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900',
    link: '/products?category=evening',
    hasArrow: true
  },
  {
    id: 'cap-6',
    label: 'RESORT EDIT',
    dotColor: '#F7B05B', // Warm amber yellow
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    link: '/products?category=resort'
  }
];

const SIGNATURE_LOOKS: SignatureLook[] = [
  {
    id: 'sig-1',
    overline: 'HEAVY SATIN · WRAP MIDI',
    title: 'Fuchsia Satin Wrap Dress',
    price: '₹24,500',
    bgColor: '#1B1D36', // Deep Navy / Midnight
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    link: '/products?item=fuchsia-satin-wrap-dress'
  },
  {
    id: 'sig-2',
    overline: 'LINEN-SILK · RELAXED DOUBLE-BREASTED',
    title: 'Riviera Linen Blazer',
    price: '₹28,500',
    bgColor: '#2A38D4', // Royal Blue
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
    link: '/products?item=riviera-linen-blazer'
  },
  {
    id: 'sig-3',
    overline: 'MULBERRY SILK · BIAS-CUT MIDI',
    title: 'Cobalt Silk Slip Dress',
    price: '₹21,800',
    bgColor: '#994226', // Terracotta / Rust
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    link: '/products?item=cobalt-silk-slip-dress'
  },
  {
    id: 'sig-4',
    overline: 'COTTON-SILK BOUCLÉ · CROPPED',
    title: 'Petal Bouclé Jacket',
    price: '₹31,500',
    bgColor: '#7A9E7E', // Sage / Pistachio
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=900',
    link: '/products?item=petal-boucle-jacket'
  },
  {
    id: 'sig-5',
    overline: 'COTTON VOILE · TIERED',
    title: 'Poppy Floral Maxi Dress',
    price: '₹25,800',
    bgColor: '#5B9EA6', // Soft Teal
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    link: '/products?item=poppy-floral-maxi-dress'
  },
  {
    id: 'sig-6',
    overline: 'IRISH LINEN · BESPOKE',
    title: 'Saffron Linen Suit',
    price: '₹46,800',
    bgColor: '#D68C45', // Warm Mustard Amber
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    link: '/products?item=saffron-linen-suit'
  }
];

export const TheLumiereSignatures: React.FC = () => {
  const runwayTrackRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Floating Drag Badge position state
  const [dragBadge, setDragBadge] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = runwayTrackRef.current ? runwayTrackRef.current.scrollLeft : 0;
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current || !runwayTrackRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 6) {
        hasMovedRef.current = true;
      }
      runwayTrackRef.current.scrollLeft = scrollLeftStartRef.current - deltaX;
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

  const handleTrackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragBadge({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleTrackMouseLeave = () => {
    setDragBadge(prev => ({ ...prev, visible: false }));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (runwayTrackRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      runwayTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Box
      component="section"
      aria-label="The Lumière Signatures & Editorial Portals"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'var(--bg, #fbf6ec)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--line, #e5dccb)'
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        {/* =========================================================================
            PART 1: SIX ARCHED CATEGORY CAPSULES (FRAME 0 REFERENCE MATCH)
        ========================================================================= */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(6, 150px)',
              sm: 'repeat(6, 175px)',
              lg: 'repeat(6, 1fr)'
            },
            gap: { xs: 2, md: 2.8 },
            overflowX: { xs: 'auto', lg: 'visible' },
            pb: { xs: 2.5, lg: 0 },
            mb: { xs: 8, md: 12 },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {CATEGORY_CAPSULES.map((capsule) => (
            <Box
              key={capsule.id}
              component={Link}
              to={capsule.link}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              {/* Arched Top Image Portal */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  pt: '150%', // Statuesque tall arched silhouette
                  borderRadius: '160px 160px 18px 18px',
                  overflow: 'hidden',
                  bgcolor: '#F0ECE1',
                  boxShadow: '0 12px 28px rgba(26, 20, 32, 0.08)',
                  border: '1px solid var(--line, #e5dccb)',
                  mb: 1.6
                }}
              >
                <Box
                  component="img"
                  src={capsule.imageUrl}
                  alt={capsule.label}
                  loading="lazy"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { transform: 'scale(1.06)' }
                  }}
                />

                {/* Optional White Circular Arrow Button inside Arch (Reference Match) */}
                {capsule.hasArrow && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--ink, #1a1420)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    <NorthEastOutlined sx={{ fontSize: 16 }} />
                  </Box>
                )}
              </Box>

              {/* Capsule Label with Dot */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: capsule.dotColor,
                    flexShrink: 0
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: { xs: '0.68rem', sm: '0.74rem' },
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: 'var(--ink, #1a1420)',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {capsule.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* =========================================================================
            PART 2: ANIMATED HORIZONTAL SIGNATURES RUNWAY (FRAME 2 REFERENCE MATCH)
        ========================================================================= */}
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
                  bgcolor: '#D92672' // Fuchsia pink dot (Reference Match)
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
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
                fontWeight: 500,
                color: 'var(--ink, #1a1420)',
                letterSpacing: '-0.025em',
                lineHeight: 1.08
              }}
            >
              Cut to Be{' '}
              <Box
                component="span"
                sx={{
                  fontStyle: 'italic',
                  color: '#D92672', // Magenta/fuchsia matching reference video
                  fontFamily: '"Fraunces", Georgia, serif'
                }}
              >
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
                '&:hover': { color: '#D92672' }
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
      </Container>

      {/* =========================================================================
          BACKGROUND WATERMARK OUTLINED TEXT (FRAME 2 REFERENCE MATCH)
      ========================================================================= */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: { xs: '65%', md: '62%' },
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          textAlign: 'center',
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 'clamp(70px, 15vw, 210px)',
          fontWeight: 800,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(229, 220, 203, 0.45)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 1,
          letterSpacing: '0.04em',
          userSelect: 'none'
        }}
      >
        SIGNATURES • SIGNATURES
      </Box>

      {/* =========================================================================
          ANIMATED HORIZONTAL DRAG RUNWAY TRACK (COLOR-BLOCKED RECTANGULAR CARDS)
      ========================================================================= */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '100%',
          overflow: 'hidden'
        }}
        onMouseMove={handleTrackMouseMove}
        onMouseLeave={handleTrackMouseLeave}
      >
        {/* Floating Lime DRAG Badge Cursor Follower (Reference Match) */}
        {dragBadge.visible && (
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'absolute',
              top: dragBadge.y,
              left: dragBadge.x,
              transform: 'translate(-50%, -50%)',
              width: 58,
              height: 58,
              borderRadius: '50%',
              bgcolor: 'var(--lime, #d8f25a)',
              color: '#1a1420',
              fontWeight: 800,
              fontSize: '0.74rem',
              letterSpacing: '0.1em',
              fontFamily: '"Instrument Sans", sans-serif',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
              pointerEvents: 'none',
              zIndex: 10,
              transition: 'opacity 0.2s ease',
              userSelect: 'none'
            }}
          >
            DRAG
          </Box>
        )}

        <Box
          ref={runwayTrackRef}
          onPointerDown={handlePointerDown}
          onClickCapture={handleClickCapture}
          sx={{
            display: 'flex',
            gap: 3.5,
            overflowX: 'auto',
            pb: 4,
            pt: 1,
            px: { xs: 2, md: 'calc((100vw - 1536px) / 2 + 24px)' },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            userSelect: 'none'
          }}
        >
          {SIGNATURE_LOOKS.map((look) => (
            <Box
              key={look.id}
              component={Link}
              to={look.link}
              sx={{
                flex: { xs: '0 0 280px', sm: '0 0 320px', md: '0 0 345px' },
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px',
                overflow: 'hidden',
                bgcolor: look.bgColor,
                boxShadow: '0 16px 36px rgba(26, 20, 32, 0.12)',
                position: 'relative',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 24px 48px rgba(26, 20, 32, 0.22)'
                }
              }}
            >
              {/* Card Image Area with Solid Vibrant Colored Backdrop */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  pt: '135%', // Statuesque rectangular proportion
                  overflow: 'hidden',
                  bgcolor: look.bgColor
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

                {/* Bottom Card Content Overlay (Internal Inside Card - Reference Match) */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2.8,
                    background: 'linear-gradient(to top, rgba(20, 15, 25, 0.92) 0%, rgba(20, 15, 25, 0.5) 60%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.6,
                    zIndex: 3
                  }}
                >
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {look.overline}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: { xs: '1.2rem', md: '1.38rem' },
                      fontWeight: 500,
                      color: '#FFFFFF',
                      lineHeight: 1.2
                    }}
                  >
                    {look.title}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      mt: 0.4
                    }}
                  >
                    {look.price}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Drag to Explore Centered Indicator (Reference Match) */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 2,
            color: 'var(--mute, #6b6173)',
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase'
          }}
        >
          ← DRAG TO EXPLORE →
        </Box>
      </Box>
    </Box>
  );
};

export default TheLumiereSignatures;
