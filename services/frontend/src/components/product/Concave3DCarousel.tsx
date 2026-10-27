import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ALL_CLOTHING_CATALOG } from '../../data/clothingCatalogData';

const SIGNATURE_GRADIENTS = [
  'linear-gradient(180deg, rgba(58, 60, 224, 0.85) 0%, rgba(26, 20, 32, 0.95) 100%)',
  'linear-gradient(180deg, rgba(232, 87, 43, 0.85) 0%, rgba(26, 20, 32, 0.95) 100%)',
  'linear-gradient(180deg, rgba(179, 18, 103, 0.85) 0%, rgba(26, 20, 32, 0.95) 100%)',
  'linear-gradient(180deg, rgba(43, 18, 56, 0.9) 0%, rgba(26, 20, 32, 0.98) 100%)',
  'linear-gradient(180deg, rgba(26, 120, 95, 0.85) 0%, rgba(26, 20, 32, 0.95) 100%)',
  'linear-gradient(180deg, rgba(200, 150, 40, 0.85) 0%, rgba(26, 20, 32, 0.95) 100%)',
];

export const Concave3DCarousel: React.FC = () => {
  // Diverse multi-category showcase spanning couture, activewear, streetwear, casuals, and kidswear
  const spotlightIds = [
    'prod-ind-01',    // Sabyasachi (Bridal Haute Couture)
    'prod-nike-01',   // Nike (Gymwear & Activewear)
    'prod-souled-01', // The Souled Store (Graphic Streetwear)
    'prod-uniqlo-01', // Uniqlo (Minimalist Everyday Casuals)
    'prod-snitch-01', // Snitch (Men's Streetwear & Cargos)
    'prod-fab-01',    // Fabindia (Hand-Block Ethnicwear)
    'prod-puma-01',   // Puma (Performance Activewear)
    'prod-hop-01',    // Hopscotch (Playful Kidswear)
  ];
  const resolved = spotlightIds
    .map((id) => ALL_CLOTHING_CATALOG.find((p) => p.id === id))
    .filter((p): p is typeof ALL_CLOTHING_CATALOG[number] => Boolean(p));
  const items = resolved.length >= 8 ? resolved : ALL_CLOTHING_CATALOG.slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(3); // Start centered in 8-item arc
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const currentTranslateX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Drag / Swipe handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    currentTranslateX.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX.current;
    currentTranslateX.current = diff;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentTranslateX.current < -40) {
      handleNext();
    } else if (currentTranslateX.current > 40) {
      handlePrev();
    }
    currentTranslateX.current = 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    currentTranslateX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentTranslateX.current = e.touches[0].clientX - dragStartX.current;
  };

  const handleTouchEnd = () => {
    if (currentTranslateX.current < -40) {
      handleNext();
    } else if (currentTranslateX.current > 40) {
      handlePrev();
    }
    currentTranslateX.current = 0;
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
              to="/collection"
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
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid var(--line, #e5dccb)',
                  backgroundColor: '#ffffff',
                  color: '#1a1420',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1420';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#1a1420';
                }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next signature garment"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid var(--line, #e5dccb)',
                  backgroundColor: '#ffffff',
                  color: '#1a1420',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1420';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#1a1420';
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Concave 3D Perspective Stage */}
        <div
          ref={containerRef}
          data-cursor="drag"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
            const offset = idx - activeIndex;
            // Arc curvature calculation
            const translateX = offset * 250; // horizontal separation
            const translateZ = -Math.abs(offset) * 70; // recessed curve inwards (concave)
            const rotateY = -offset * 14; // face inwards toward center
            const opacity = Math.abs(offset) > 3 ? 0 : 1 - Math.abs(offset) * 0.18;
            const isCenter = offset === 0;
            const gradient = SIGNATURE_GRADIENTS[idx % SIGNATURE_GRADIENTS.length];

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  width: '280px',
                  height: '460px',
                  borderRadius: '26px',
                  overflow: 'hidden',
                  background: gradient,
                  border: isCenter ? '2px solid rgba(216, 242, 90, 0.7)' : '1px solid rgba(229, 220, 203, 0.35)',
                  boxShadow: isCenter
                    ? '0 24px 60px -12px rgba(26, 20, 32, 0.35), 0 0 20px rgba(58, 60, 224, 0.2)'
                    : '0 12px 30px -8px rgba(26, 20, 32, 0.18)',
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${isCenter ? 1.04 : 0.94})`,
                  transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease',
                  opacity,
                  pointerEvents: Math.abs(offset) > 2 ? 'none' : 'auto',
                  zIndex: 20 - Math.abs(offset),
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
                      backgroundColor: 'rgba(26, 20, 32, 0.65)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backdropFilter: 'blur(8px)',
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
                    style={{
                      maxHeight: '260px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.35))',
                      transition: 'transform 0.3s ease',
                    }}
                    onError={(e) => {
                      // Fallback SVG if remote image fails
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Bottom Card Dossier Info */}
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: 'rgba(26, 20, 32, 0.88)',
                    backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(251, 246, 236, 0.1)',
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
                        color: 'rgba(251, 246, 236, 0.65)',
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
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d8f25a')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fbf6ec')}
                    >
                      View Creation ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Indicator Hint */}
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
            ← DRAG, SWIPE OR USE ARROW KEYS TO EXPLORE →
          </p>
        </div>
      </div>
    </section>
  );
};

export default Concave3DCarousel;
