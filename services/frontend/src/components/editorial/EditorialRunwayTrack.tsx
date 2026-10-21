import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBackIosNewOutlined, ArrowForwardIosOutlined } from '@mui/icons-material';

export interface EditorialRunwayTrackProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  itemMinWidth?: number | string;
  gap?: number;
  className?: string;
}

export const EditorialRunwayTrack: React.FC<EditorialRunwayTrackProps> = ({
  title,
  subtitle,
  eyebrow,
  ariaLabel = 'Curated editorial fashion runway',
  children,
  action,
  itemMinWidth = 'clamp(260px, 26vw, 320px)',
  gap = 20,
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasMovedRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check user preference for reduced motion
  const getScrollBehavior = useCallback((): ScrollBehavior => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'auto';
    }
    return 'smooth';
  }, []);

  const updateScrollBounds = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // In headless test environments (jsdom) clientWidth and scrollWidth are 0 by default
    if (scrollWidth === 0 && clientWidth === 0) {
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(true);
      return;
    }
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollBounds();

    const handleScroll = () => {
      updateScrollBounds();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollBounds);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollBounds);
    };
  }, [updateScrollBounds, children]);

  // Mouse drag-to-scroll handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with left mouse button; native touch handles touch devices
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = trackRef.current ? trackRef.current.scrollLeft : 0;
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current || !trackRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 6) {
        hasMovedRef.current = true;
        setIsDragging(true);
      }
      trackRef.current.scrollLeft = scrollLeftStartRef.current - deltaX;
    };

    const handleWindowPointerUp = () => {
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, []);

  // Intercept click during drag capture phase to prevent accidental link or button clicks
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      // Reset immediately after capturing so subsequent clean clicks succeed
      hasMovedRef.current = false;
    }
  };

  const handleScrollBy = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 280);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: getScrollBehavior(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleScrollBy('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleScrollBy('right');
    }
  };

  return (
    <Box
      className={`lumiere-editorial-runway ${className}`}
      sx={{
        width: '100%',
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Editorial Section Header */}
      {(eyebrow || title || subtitle || action) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
            px: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ maxWidth: 720 }}>
            {eyebrow && (
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  color: '#3a3ce0',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '0.75rem',
                  mb: 0.5,
                }}
              >
                {eyebrow}
              </Typography>
            )}
            {title && (
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
                  fontWeight: 500,
                  color: '#1a1420',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Instrument Sans", sans-serif',
                  color: '#6b6173',
                  fontSize: '0.95rem',
                  mt: 1,
                  lineHeight: 1.6,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Navigation Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {action}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={() => handleScrollBy('left')}
                disabled={!canScrollLeft}
                aria-label="Previous runway looks"
                size="small"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  bgcolor: '#ffffff',
                  border: '1px solid #e5dccb',
                  color: '#1a1420',
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    bgcolor: '#1a1420',
                    color: '#ffffff',
                    borderColor: '#1a1420',
                  },
                  '&:disabled': {
                    opacity: 0.35,
                    cursor: 'not-allowed',
                  },
                  '&:focus-visible': {
                    outline: '3px solid #3a3ce0',
                    outlineOffset: '2px',
                  },
                }}
              >
                <ArrowBackIosNewOutlined sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                onClick={() => handleScrollBy('right')}
                disabled={!canScrollRight}
                aria-label="Next runway looks"
                size="small"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  bgcolor: '#ffffff',
                  border: '1px solid #e5dccb',
                  color: '#1a1420',
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    bgcolor: '#1a1420',
                    color: '#ffffff',
                    borderColor: '#1a1420',
                  },
                  '&:disabled': {
                    opacity: 0.35,
                    cursor: 'not-allowed',
                  },
                  '&:focus-visible': {
                    outline: '3px solid #3a3ce0',
                    outlineOffset: '2px',
                  },
                }}
              >
                <ArrowForwardIosOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* The Runway Track */}
      <Box
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        className={`editorial-runway-track ${isDragging ? 'is-dragging' : ''}`}
        sx={{
          display: 'flex',
          gap: `${gap}px`,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto',
          px: { xs: 2, md: 3 },
          py: 1,
          '&:focus-visible': {
            outline: '3px solid #3a3ce0',
            outlineOffset: '3px',
            borderRadius: '12px',
          },
          '& > *': {
            flex: `0 0 ${itemMinWidth}`,
            minWidth: itemMinWidth,
            maxWidth: itemMinWidth,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default EditorialRunwayTrack;
