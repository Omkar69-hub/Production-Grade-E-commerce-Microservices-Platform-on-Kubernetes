import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ALL_CLOTHING_CATALOG, type VerifiedClothingProduct } from '../../data/clothingCatalogData';

const SIGNATURE_GRADIENTS = [
  'linear-gradient(180deg, rgba(58, 60, 224, 0.90) 0%, rgba(26, 20, 32, 0.98) 100%)',
  'linear-gradient(180deg, rgba(232, 87, 43, 0.90) 0%, rgba(26, 20, 32, 0.98) 100%)',
  'linear-gradient(180deg, rgba(179, 18, 103, 0.90) 0%, rgba(26, 20, 32, 0.98) 100%)',
  'linear-gradient(180deg, rgba(43, 18, 56, 0.92) 0%, rgba(26, 20, 32, 0.98) 100%)',
  'linear-gradient(180deg, rgba(26, 120, 95, 0.90) 0%, rgba(26, 20, 32, 0.98) 100%)',
  'linear-gradient(180deg, rgba(200, 150, 40, 0.90) 0%, rgba(26, 20, 32, 0.98) 100%)',
  'linear-gradient(180deg, rgba(30, 40, 160, 0.90) 0%, rgba(26, 20, 32, 0.98) 100%)',
  'linear-gradient(180deg, rgba(180, 50, 80, 0.90) 0%, rgba(26, 20, 32, 0.98) 100%)',
];

export const Concave3DCarousel: React.FC = () => {
  // Diverse multi-category showcase spanning couture, activewear, streetwear, casuals, and kidswear
  const spotlightIds = [
    'prod-ind-01',   // Sabyasachi (Bridal Haute Couture)
    'prod-life-01',  // Nike (Dri-FIT ADV Performance Compression Top)
    'prod-life-07',  // The Souled Store (Graphic Streetwear Oversized Tee)
    'prod-life-10',  // Uniqlo (AIRism Minimalist Everyday Casuals)
    'prod-life-09',  // Snitch (Cuban Collar Streetwear & Cargos)
    'prod-life-14',  // Fabindia (Artisanal Hand-Block Ethnicwear)
    'prod-life-03',  // Puma (dryCELL Seamless Activewear Tights)
    'prod-life-16',  // Hopscotch (Playful Tailored Kidswear)
  ];

  const resolved = spotlightIds
    .map((id) => ALL_CLOTHING_CATALOG.find((p) => p.id === id))
    .filter((p): p is VerifiedClothingProduct => Boolean(p));
  const items = resolved.length >= 8 ? resolved : ALL_CLOTHING_CATALOG.slice(0, 8);

  const [activeIndex, setActiveIndex] = useState(3); // Start centered in 8-item arc
  const [isDragging, setIsDragging] = useState(false);

  // Animation physics refs
  const currentOffsetRef = useRef<number>(3);
  const targetOffsetRef = useRef<number>(3);
  const dragStartX = useRef<number>(0);
  const dragStartOffset = useRef<number>(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isPointerOverRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  // Directly update card transforms with high-efficiency 3D perspective
  const applyTransforms = useCallback((offset: number) => {
    const total = items.length;
    cardRefs.current.forEach((cardEl, idx) => {
      if (!cardEl) return;
      const dist = idx - offset;
      const absDist = Math.abs(dist);

      // Arc curvature mathematics
      const translateX = dist * 255;
      const translateZ = -absDist * 72; // recessed concave curve
      const rotateY = -dist * 13.5; // facing inward toward viewer
      const scale = Math.max(0.86, 1.06 - absDist * 0.12);
      const opacity = absDist > 3.2 ? 0 : Math.max(0, 1 - absDist * 0.22);
      const isCenter = absDist < 0.5;

      cardEl.style.transform = `translateX(${translateX.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      cardEl.style.opacity = opacity.toFixed(3);
      cardEl.style.zIndex = `${Math.round(30 - absDist * 5)}`;
      cardEl.style.pointerEvents = absDist > 2.2 ? 'none' : 'auto';

      if (isCenter) {
        cardEl.style.borderColor = 'rgba(216, 242, 90, 0.85)';
        cardEl.style.boxShadow = '0 28px 65px -12px rgba(26, 20, 32, 0.4), 0 0 24px rgba(58, 60, 224, 0.28)';
      } else {
        cardEl.style.borderColor = 'rgba(229, 220, 203, 0.35)';
        cardEl.style.boxShadow = '0 12px 30px -8px rgba(26, 20, 32, 0.2)';
      }
    });

    const nearestIndex = Math.max(0, Math.min(total - 1, Math.round(offset)));
    setActiveIndex((prev) => (prev !== nearestIndex ? nearestIndex : prev));
  }, [items.length]);

  // Main animation frame loop with smooth lerp interpolation
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const animate = () => {
      if (mediaQuery.matches) {
        // Reduced motion: immediate snap
        currentOffsetRef.current = targetOffsetRef.current;
        applyTransforms(currentOffsetRef.current);
        return;
      }

      const diff = targetOffsetRef.current - currentOffsetRef.current;
      if (Math.abs(diff) > 0.001) {
        currentOffsetRef.current += diff * 0.12; // Eased interpolation factor
        applyTransforms(currentOffsetRef.current);
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [applyTransforms]);

  // Initial layout pass
  useEffect(() => {
    applyTransforms(currentOffsetRef.current);
  }, [applyTransforms]);

  // Pointer move handler: Cursor moving left moves track left; moving right moves track right
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDragging) return;
    isPointerOverRef.current = true;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const normX = (clientX - rect.left) / rect.width; // 0 (left) to 1 (right)
    const centeredX = (normX - 0.5) * 2; // -1 to +1

    // Deadzone in the center (10% radius) settles without jitter
    if (Math.abs(centeredX) < 0.10) {
      return;
    }

    const sign = centeredX > 0 ? 1 : -1;
    const rawMagnitude = (Math.abs(centeredX) - 0.10) / 0.90; // 0 to 1
    // Gentle non-linear acceleration near edges
    const accelerated = Math.pow(rawMagnitude, 1.35);

    // Bounded target offset: 0 to items.length - 1
    const totalSpan = items.length - 1;
    const centerPoint = totalSpan / 2;
    const target = centerPoint + sign * accelerated * centerPoint;
    targetOffsetRef.current = Math.max(0, Math.min(totalSpan, target));
  };

  // Pointer leave handler: Smoothly settles to nearest card and retains predictable state
  const handlePointerLeave = () => {
    isPointerOverRef.current = false;
    // Settle to nearest integer position without snapping violently
    targetOffsetRef.current = Math.max(0, Math.min(items.length - 1, Math.round(currentOffsetRef.current)));
  };

  // Drag and Swipe handlers for direct tactile control
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartOffset.current = currentOffsetRef.current;
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      handlePointerMove(e);
      return;
    }
    const deltaX = e.clientX - dragStartX.current;
    // Convert pixel delta into continuous carousel offset (approx 260px per card)
    const offsetDelta = -deltaX / 260;
    const boundedTarget = Math.max(-0.2, Math.min(items.length - 0.8, dragStartOffset.current + offsetDelta));
    targetOffsetRef.current = boundedTarget;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore safely
      }
    }
    // Settle to nearest card index
    targetOffsetRef.current = Math.max(0, Math.min(items.length - 1, Math.round(currentOffsetRef.current)));
  };

  // Discrete navigation: Prev / Next buttons
  const handlePrev = useCallback(() => {
    targetOffsetRef.current = Math.max(0, Math.round(targetOffsetRef.current) - 1);
  }, []);

  const handleNext = useCallback(() => {
    targetOffsetRef.current = Math.min(items.length - 1, Math.round(targetOffsetRef.current) + 1);
  }, [items.length]);

  // Accessible keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <section
      role="region"
      aria-roledescription="3D concave carousel"
      aria-label="Lumière Signatures Concave Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full overflow-hidden select-none"
      style={{
        backgroundColor: 'var(--bg, #fbf6ec)',
        paddingTop: '80px',
        paddingBottom: '90px',
        outline: 'none',
      }}
    >
      {/* Background Watermark Outlined Text */}
      <div
        aria-hidden="true"
        style={{
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
          letterSpacing: '0.04em',
        }}
      >
        SIGNATURES • SIGNATURES
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e8572b' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1420', fontFamily: '"Instrument Sans", sans-serif' }}>
                THE LUMIÈRE SIGNATURES
              </span>
            </div>
            <h2
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 'clamp(32px, 4.5vw, 54px)',
                fontWeight: 600,
                color: '#1a1420',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Cut to Be <span style={{ fontStyle: 'italic', color: '#3a3ce0' }}>Remembered</span>
            </h2>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              to="/products"
              style={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1a1420',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#3a3ce0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#1a1420')}
            >
              EXPLORE THE EDIT →
            </Link>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous signature garment"
                disabled={activeIndex <= 0}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid var(--line, #e5dccb)',
                  backgroundColor: '#ffffff',
                  color: activeIndex <= 0 ? 'rgba(26, 20, 32, 0.3)' : '#1a1420',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: activeIndex <= 0 ? 'default' : 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (activeIndex > 0) {
                    e.currentTarget.style.backgroundColor = '#1a1420';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = activeIndex <= 0 ? 'rgba(26, 20, 32, 0.3)' : '#1a1420';
                }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next signature garment"
                disabled={activeIndex >= items.length - 1}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid var(--line, #e5dccb)',
                  backgroundColor: '#ffffff',
                  color: activeIndex >= items.length - 1 ? 'rgba(26, 20, 32, 0.3)' : '#1a1420',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: activeIndex >= items.length - 1 ? 'default' : 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (activeIndex < items.length - 1) {
                    e.currentTarget.style.backgroundColor = '#1a1420';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = activeIndex >= items.length - 1 ? 'rgba(26, 20, 32, 0.3)' : '#1a1420';
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Cursor-Driven Concave 3D Perspective Stage */}
        <div
          ref={containerRef}
          data-cursor="drag"
          onPointerDown={handlePointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          style={{
            position: 'relative',
            height: '520px',
            width: '100%',
            perspective: '1300px',
            perspectiveOrigin: '50% 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'pan-y',
          }}
        >
          {items.map((item, idx) => {
            const gradient = SIGNATURE_GRADIENTS[idx % SIGNATURE_GRADIENTS.length];
            const isCenter = idx === activeIndex;

            return (
              <div
                key={item.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                style={{
                  position: 'absolute',
                  width: '280px',
                  height: '460px',
                  borderRadius: '26px',
                  overflow: 'hidden',
                  background: gradient,
                  border: isCenter ? '2px solid rgba(216, 242, 90, 0.85)' : '1px solid rgba(229, 220, 203, 0.35)',
                  boxShadow: isCenter
                    ? '0 28px 65px -12px rgba(26, 20, 32, 0.4), 0 0 24px rgba(58, 60, 224, 0.28)'
                    : '0 12px 30px -8px rgba(26, 20, 32, 0.2)',
                  willChange: 'transform, opacity',
                  transition: isDragging ? 'none' : 'border-color 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Top Badge & Brand Header */}
                <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                  <span
                    style={{
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#d8f25a',
                      backgroundColor: 'rgba(26, 20, 32, 0.75)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(216, 242, 90, 0.3)',
                    }}
                  >
                    {item.brandName}
                  </span>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(251, 246, 236, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '13px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    ↗
                  </span>
                </div>

                {/* Garment Image Representation */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    style={{
                      maxHeight: '260px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.45))',
                      transition: 'transform 0.3s ease',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Bottom Card Dossier Info */}
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: 'rgba(26, 20, 32, 0.92)',
                    backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(251, 246, 236, 0.12)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#d8f25a',
                      }}
                    >
                      {item.brandName}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: '10px',
                        color: 'rgba(251, 246, 236, 0.7)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.subcategory}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#fbf6ec',
                      margin: '0 0 8px 0',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontStyle: 'italic',
                        fontSize: '15px',
                        color: '#d8f25a',
                        fontWeight: 600,
                      }}
                    >
                      {item.priceFormatted}
                    </span>

                    <Link
                      to={`/products/${item.id}`}
                      aria-label={`View Dossier for ${item.brandName}`}
                      style={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#1a1420',
                        backgroundColor: '#fbf6ec',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s ease, transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d8f25a';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fbf6ec';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      View Creation ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cursor & Navigation Indicator Hint */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(26, 20, 32, 0.55)',
              margin: 0,
            }}
          >
            ← MOVE CURSOR LEFT / RIGHT TO PAN • DRAG, SWIPE OR USE ARROW KEYS →
          </p>
        </div>
      </div>
    </section>
  );
};

export default Concave3DCarousel;
