import React, { useRef, useState, useEffect, useCallback } from 'react';
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
    link: '/products?category=evening'
  },
  {
    id: 'cap-6',
    label: 'RESORT EDIT',
    dotColor: '#F7B05B', // Warm amber yellow
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    link: '/products?category=resort'
  }
];

export const TheLumiereSignatures: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isRevealed, setIsRevealed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Floating DRAG cursor follower state
  const [dragBadge, setDragBadge] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0
  });

  // Drag physics tracking refs
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Check user preference for reduced motion
  const prefersReducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Staggered reveal observer on viewport entrance with safe jsdom fallback
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Update scroll bounds, progress, and parallax offsets
  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    setScrollProgress(progress);
    setScrollOffset(scrollLeft);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    updateScrollState();

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  // Page vertical scroll drives subtle horizontal translation & parallax
  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return;

    let rafId: number;
    const handleWindowScroll = () => {
      rafId = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el || !trackRef.current) return;

        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Active while section travels across viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const totalDistance = windowHeight + rect.height;
          const currentProgress = (windowHeight - rect.top) / totalDistance;
          const clamped = Math.max(0, Math.min(1, currentProgress));

          // Only apply scroll-driven nudging if user is not actively dragging
          if (!isPointerDownRef.current && trackRef.current) {
            const maxScroll = trackRef.current.scrollWidth - trackRef.current.clientWidth;
            if (maxScroll > 0) {
              const targetScroll = clamped * (maxScroll * 0.6);
              trackRef.current.scrollLeft = targetScroll;
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  // Pointer drag-to-scroll handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = trackRef.current ? trackRef.current.scrollLeft : 0;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <Box
      component="section"
      ref={sectionRef}
      aria-label="The Lumière Signatures Arched Categories"
      sx={{
        py: { xs: 7, md: 10 },
        bgcolor: '#17111b', // Dark LUMIÈRE background as requested
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(229, 220, 203, 0.12)'
      }}
    >
      {/* =========================================================================
          BACKGROUND WATERMARK: OUTLINED "SIGNATURES" WITH SUBTLE MARQUEE GLIDE
      ========================================================================= */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: '58%',
          left: 0,
          width: '200%',
          transform: 'translateY(-50%)',
          display: 'flex',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 1,
          userSelect: 'none',
          animation: prefersReducedMotion ? 'none' : 'signaturesWatermarkGlide 60s linear infinite',
          '@keyframes signaturesWatermarkGlide': {
            '0%': { transform: 'translate3d(0, -50%, 0)' },
            '100%': { transform: 'translate3d(-50%, -50%, 0)' }
          }
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 'clamp(70px, 13vw, 180px)',
            fontWeight: 800,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.07)',
            letterSpacing: '0.06em',
            pr: 6
          }}
        >
          SIGNATURES • SIGNATURES • SIGNATURES • SIGNATURES •&nbsp;
        </Typography>
        <Typography
          component="span"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 'clamp(70px, 13vw, 180px)',
            fontWeight: 800,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.07)',
            letterSpacing: '0.06em',
            pr: 6
          }}
        >
          SIGNATURES • SIGNATURES • SIGNATURES • SIGNATURES •&nbsp;
        </Typography>
      </Box>

      {/* =========================================================================
          SECTION EDITORIAL HEADER: "CHOOSE YOUR ATELIER UNIVERSE"
      ========================================================================= */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 3, mb: { xs: 4, md: 5.5 } }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ maxWidth: 760 }}>
            {/* Overline with Accent Dot */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#D92672' // Magenta fuchsia dot
                }}
              />
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255, 255, 255, 0.82)',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  fontSize: '0.76rem',
                  fontFamily: '"Instrument Sans", sans-serif'
                }}
              >
                THE LUMIÈRE SIGNATURES
              </Typography>
            </Box>

            {/* Restored Original Heading */}
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.4rem' },
                fontWeight: 400,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.12
              }}
            >
              CHOOSE YOUR ATELIER UNIVERSE
            </Typography>

            {/* Editorial Description */}
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: { xs: '0.88rem', md: '0.98rem' },
                fontFamily: '"Instrument Sans", sans-serif',
                mt: 1,
                lineHeight: 1.5,
                maxWidth: 640
              }}
            >
              Explore dedicated fashion portfolios tailored to women’s couture, men’s bespoke sartorial suiting, and exquisite young heritage wear.
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
                color: '#FFFFFF',
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
                aria-label="Previous signature category"
                size="small"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#FFFFFF', color: '#17111b' }
                }}
              >
                <ArrowBackIosNewOutlined sx={{ fontSize: 13 }} />
              </IconButton>
              <IconButton
                onClick={() => scroll('right')}
                aria-label="Next signature category"
                size="small"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#FFFFFF', color: '#17111b' }
                }}
              >
                <ArrowForwardIosOutlined sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* =========================================================================
          THE SIX ARCHED CATEGORY CARDS — REFINED SIZES & CINEMATIC SCROLLING
      ========================================================================= */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          maxWidth: '100%',
          overflow: 'hidden'
        }}
        onMouseMove={handleTrackMouseMove}
        onMouseLeave={handleTrackMouseLeave}
      >
        {/* Floating Lime DRAG Badge Cursor Follower */}
        {dragBadge.visible && (
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'absolute',
              top: dragBadge.y,
              left: dragBadge.x,
              transform: 'translate(-50%, -50%)',
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: 'var(--lime, #d8f25a)',
              color: '#1a1420',
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              fontFamily: '"Instrument Sans", sans-serif',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              pointerEvents: 'none',
              zIndex: 10,
              userSelect: 'none'
            }}
          >
            DRAG
          </Box>
        )}

        {/* Horizontal Drag-and-Scroll Runway */}
        <Box
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onClickCapture={handleClickCapture}
          sx={{
            display: 'flex',
            gap: { xs: 2.2, sm: 2.8, md: 3.2 },
            overflowX: 'auto',
            pb: 2.5,
            pt: 0.5,
            px: { xs: 2.5, md: 'calc((100vw - 1536px) / 2 + 24px)' },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            userSelect: 'none'
          }}
        >
          {CATEGORY_CAPSULES.map((capsule, index) => {
            // Subtle inner parallax offset based on horizontal scroll
            const parallaxShift = (scrollOffset * 0.06) - (index * 8);

            return (
              <Box
                key={capsule.id}
                component={Link}
                to={capsule.link}
                sx={{
                  // Refined, smaller card dimensions matching reference proportions (173px x 259px on desktop)
                  flex: {
                    xs: '0 0 148px',
                    sm: '0 0 162px',
                    md: '0 0 176px',
                    lg: '0 0 185px'
                  },
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  // Staggered entrance animation
                  opacity: isRevealed || prefersReducedMotion ? 1 : 0,
                  transform: isRevealed || prefersReducedMotion
                    ? 'translateY(0) scale(1)'
                    : 'translateY(28px) scale(0.97)',
                  transition: prefersReducedMotion
                    ? 'none'
                    : `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${index * 70}ms, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${index * 70}ms`,
                  '&:hover .arched-portal': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 42px rgba(0, 0, 0, 0.6), 0 0 0 1px ${capsule.dotColor}`
                  },
                  '&:hover .arched-image': {
                    transform: 'scale(1.09)'
                  },
                  '&:hover .arrow-button': {
                    transform: 'scale(1.12)',
                    bgcolor: '#FFFFFF',
                    color: '#17111b'
                  }
                }}
              >
                {/* Arched Top Image Container — Refined Proportions */}
                <Box
                  className="arched-portal"
                  sx={{
                    position: 'relative',
                    width: '100%',
                    pt: '148%', // Proportions matching 173px × 259px from reference video
                    borderRadius: '96px 96px 14px 14px',
                    overflow: 'hidden',
                    bgcolor: '#211a27',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    mb: 1.5,
                    transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease'
                  }}
                >
                  {/* Inner Image with Parallax Movement */}
                  <Box
                    component="img"
                    className="arched-image"
                    src={capsule.imageUrl}
                    alt={capsule.label}
                    loading="lazy"
                    sx={{
                      position: 'absolute',
                      inset: -10,
                      width: 'calc(100% + 20px)',
                      height: 'calc(100% + 20px)',
                      objectFit: 'cover',
                      transform: prefersReducedMotion
                        ? 'none'
                        : `translateX(${parallaxShift.toFixed(1)}px)`,
                      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />

                  {/* Subtle Gradient Shade at Arch Base */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(23, 17, 27, 0.65) 0%, transparent 38%)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Corner Diagonal Arrow Button inside Arch */}
                  {capsule.hasArrow && (
                    <Box
                      className="arrow-button"
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(6px)',
                        color: '#17111b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                        transition: 'transform 0.25s ease, background-color 0.25s ease',
                        zIndex: 4
                      }}
                    >
                      <NorthEastOutlined sx={{ fontSize: 16 }} />
                    </Box>
                  )}
                </Box>

                {/* Category Label with Colored Indicator Dot */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mt: 0.2 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: capsule.dotColor,
                      boxShadow: `0 0 8px ${capsule.dotColor}`,
                      flexShrink: 0
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: { xs: '0.68rem', sm: '0.74rem' },
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {capsule.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Drag to Explore Indicator & Horizontal Progress Bar */}
        <Box sx={{ textAlign: 'center', mt: 2.5, userSelect: 'none' }}>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase'
            }}
          >
            ← DRAG TO EXPLORE →
          </Typography>

          {/* Sleek Horizontal Progress Bar Indicator */}
          <Box
            sx={{
              width: 130,
              height: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              mx: 'auto',
              mt: 1.2,
              borderRadius: '99px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                bgcolor: '#D92672',
                width: `${Math.max(14, scrollProgress)}%`,
                borderRadius: '99px',
                transition: prefersReducedMotion ? 'none' : 'width 0.12s ease-out'
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TheLumiereSignatures;
