import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export interface DesignerRunwayCard {
  id: string;
  brandName: string;
  brandSlug: string;
  subcategory: string;
  productName: string;
  priceFormatted: string;
  bgColor: string;
  imageUrl: string;
  link: string;
}

const DESIGNER_CARDS: DesignerRunwayCard[] = [
  {
    id: 'des-1',
    brandName: 'SABYASACHI',
    brandSlug: 'sabyasachi',
    subcategory: 'Bridal Heritage',
    productName: 'Royal Heritage Zardozi Velvet Lehenga',
    priceFormatted: 'Price upon atelier inquiry',
    bgColor: '#8F7186', // Dusty plum / mauve
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
    link: '/products?brand=sabyasachi'
  },
  {
    id: 'des-2',
    brandName: 'ANITA DONGRE',
    brandSlug: 'anita-dongre',
    subcategory: 'Sustainable Luxury',
    productName: 'Pichhwai Hand-Painted Silk Saree',
    priceFormatted: 'Price upon atelier inquiry',
    bgColor: '#7C615A', // Warm terracotta rose-brown
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=900',
    link: '/products?brand=anita-dongre'
  },
  {
    id: 'des-3',
    brandName: 'MANISH MALHOTRA',
    brandSlug: 'manish-malhotra',
    subcategory: 'Glamour & Red Carpet',
    productName: 'Kashmiri Tilla & Sequined Ombré Saree',
    priceFormatted: 'Price upon atelier inquiry',
    bgColor: '#8F2050', // Vibrant ruby fuchsia / magenta
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900',
    link: '/products?brand=manish-malhotra'
  },
  {
    id: 'des-4',
    brandName: 'TARUN TAHILIANI',
    brandSlug: 'tarun-tahiliani',
    subcategory: 'Couture Pret',
    productName: 'Sculpted Chikankari Draped Concept Saree',
    priceFormatted: 'Price upon atelier inquiry',
    bgColor: '#1E1A29', // Midnight luxury noir / dark purple
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    link: '/products?brand=tarun-tahiliani'
  },
  {
    id: 'des-5',
    brandName: 'RAW MANGO',
    brandSlug: 'raw-mango',
    subcategory: 'Heritage Festive',
    productName: 'Handloom Chanderi Brocade Kurta & Dupatta',
    priceFormatted: 'Price upon atelier inquiry',
    bgColor: '#3B6961', // Deep teal / emerald sage
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    link: '/products?brand=raw-mango'
  },
  {
    id: 'des-6',
    brandName: 'MANYAVAR',
    brandSlug: 'manyavar',
    subcategory: 'Sherwanis & Bandhgalas',
    productName: 'Royal Jacquard Sherwani with Zari Detailing',
    priceFormatted: 'Price upon atelier inquiry',
    bgColor: '#AC8C42', // Warm royal golden amber
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    link: '/products?brand=manyavar'
  },
  {
    id: 'des-7',
    brandName: 'RAYMOND',
    brandSlug: 'raymond',
    subcategory: 'Sartorial Suiting',
    productName: 'Bespoke Super 250s Fine Merino Wool Tuxedo',
    priceFormatted: 'Price upon atelier inquiry',
    bgColor: '#7E776D', // Warm sartorial slate / taupe
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
    link: '/products?brand=raymond'
  }
];

export const DesignerRunwayCarousel: React.FC = () => {
  const items = DESIGNER_CARDS;
  const initialIndex = 3; // Center card: Tarun Tahiliani (Index 3)

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [dragBadge, setDragBadge] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0
  });

  // Animation physics refs
  const currentOffsetRef = useRef<number>(initialIndex);
  const targetOffsetRef = useRef<number>(initialIndex);
  const dragStartX = useRef<number>(0);
  const dragStartOffset = useRef<number>(initialIndex);
  const hasMovedRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isPointerOverRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apply 3D perspective transforms & card layering
  const applyTransforms = useCallback((offset: number) => {
    const total = items.length;
    cardRefs.current.forEach((cardEl, idx) => {
      if (!cardEl) return;
      const dist = idx - offset;
      const absDist = Math.abs(dist);

      // Horizontal spacing and concave 3D depth curvature
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const spacing = isMobile ? 180 : 215;
      const translateX = dist * spacing;
      const translateZ = -absDist * 75;
      const rotateY = -dist * 11;
      const scale = Math.max(0.78, 1.08 - absDist * 0.09);
      const opacity = absDist > 3.6 ? 0 : Math.max(0.4, 1 - absDist * 0.18);
      const isCenter = absDist < 0.45;

      cardEl.style.transform = `translateX(${translateX.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      cardEl.style.opacity = opacity.toFixed(3);
      cardEl.style.zIndex = `${Math.round(50 - absDist * 8)}`;
      cardEl.style.pointerEvents = absDist > 2.6 ? 'none' : 'auto';

      if (isCenter) {
        cardEl.style.borderColor = 'rgba(216, 242, 90, 0.95)';
        cardEl.style.boxShadow = '0 32px 75px -10px rgba(26, 20, 32, 0.55), 0 0 28px rgba(216, 242, 90, 0.25)';
      } else {
        cardEl.style.borderColor = 'rgba(255, 255, 255, 0.22)';
        cardEl.style.boxShadow = '0 16px 36px -8px rgba(26, 20, 32, 0.32)';
      }
    });

    const nearestIndex = Math.max(0, Math.min(total - 1, Math.round(offset)));
    setActiveIndex((prev) => (prev !== nearestIndex ? nearestIndex : prev));
  }, [items.length]);

  // Smooth lerp animation loop
  useEffect(() => {
    const animate = () => {
      if (prefersReducedMotion) {
        currentOffsetRef.current = targetOffsetRef.current;
        applyTransforms(currentOffsetRef.current);
        return;
      }

      const diff = targetOffsetRef.current - currentOffsetRef.current;
      if (Math.abs(diff) > 0.001) {
        currentOffsetRef.current += diff * 0.12; // Smooth cubic lerp
        applyTransforms(currentOffsetRef.current);
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [applyTransforms, prefersReducedMotion]);

  // Initial render transform pass
  useEffect(() => {
    applyTransforms(currentOffsetRef.current);
  }, [applyTransforms]);

  // Pointer move handler: Updates DRAG follower badge and gentle edge pan
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDragBadge({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    if (isDragging) return;
    isPointerOverRef.current = true;

    const normX = (e.clientX - rect.left) / rect.width;
    const centeredX = (normX - 0.5) * 2; // -1 to +1

    // Deadzone in the center (15% radius) avoids unwanted drift
    if (Math.abs(centeredX) < 0.15) return;

    const sign = centeredX > 0 ? 1 : -1;
    const rawMagnitude = (Math.abs(centeredX) - 0.15) / 0.85;
    const accelerated = Math.pow(rawMagnitude, 1.4);

    const totalSpan = items.length - 1;
    const centerPoint = totalSpan / 2;
    const target = centerPoint + sign * accelerated * centerPoint;
    targetOffsetRef.current = Math.max(0, Math.min(totalSpan, target));
  };

  const handlePointerLeave = () => {
    isPointerOverRef.current = false;
    setDragBadge((prev) => ({ ...prev, visible: false }));
    // Gently settle to nearest card index
    targetOffsetRef.current = Math.max(0, Math.min(items.length - 1, Math.round(currentOffsetRef.current)));
  };

  // Tactile drag and touch swipe handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartX.current = e.clientX;
    dragStartOffset.current = currentOffsetRef.current;
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      handlePointerMove(e);
      return;
    }
    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > 6) {
      hasMovedRef.current = true;
    }
    // Convert pixel delta into carousel offset units (~220px per card)
    const offsetDelta = -deltaX / 220;
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
        // Safe fallback
      }
    }
    // Settle to nearest card index
    targetOffsetRef.current = Math.max(0, Math.min(items.length - 1, Math.round(currentOffsetRef.current)));
  };

  // Keyboard navigation (Left / Right arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetOffsetRef.current = Math.max(0, Math.round(targetOffsetRef.current) - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetOffsetRef.current = Math.min(items.length - 1, Math.round(targetOffsetRef.current) + 1);
    }
  };

  // Clicking any side card immediately focuses and centers it
  const handleCardClick = (idx: number, e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (idx !== activeIndex) {
      e.preventDefault();
      targetOffsetRef.current = idx;
    }
  };

  return (
    <section
      role="region"
      aria-roledescription="3D fashion designer carousel"
      aria-label="Lumière Fashion Designer 3D Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--bg, #fbf6ec)', // Warm cream/light background as in Image 3
        paddingTop: '60px',
        paddingBottom: '60px',
        outline: 'none',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Cursor-Driven 3D Perspective Stage */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          style={{
            position: 'relative',
            height: '560px',
            width: '100%',
            perspective: '1300px',
            perspectiveOrigin: '50% 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'pan-y'
          }}
        >
          {/* Floating Lime DRAG Cursor Indicator */}
          {dragBadge.visible && (
            <div
              style={{
                position: 'absolute',
                top: dragBadge.y,
                left: dragBadge.x,
                transform: 'translate(-50%, -50%)',
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--lime, #d8f25a)', // Lime green as shown in Image 3
                color: '#1a1420',
                fontWeight: 800,
                fontSize: '0.74rem',
                letterSpacing: '0.1em',
                fontFamily: '"Instrument Sans", sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                pointerEvents: 'none',
                zIndex: 100,
                userSelect: 'none'
              }}
            >
              DRAG
            </div>
          )}

          {/* Layered 3D Designer Cards */}
          {items.map((card, idx) => {
            const isCenter = idx === activeIndex;

            return (
              <div
                key={card.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                onClick={(e) => handleCardClick(idx, e)}
                style={{
                  position: 'absolute',
                  width: '290px',
                  height: '475px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  backgroundColor: card.bgColor,
                  border: isCenter ? '2px solid rgba(216, 242, 90, 0.95)' : '1px solid rgba(255, 255, 255, 0.22)',
                  boxShadow: isCenter
                    ? '0 32px 75px -10px rgba(26, 20, 32, 0.55), 0 0 28px rgba(216, 242, 90, 0.25)'
                    : '0 16px 36px -8px rgba(26, 20, 32, 0.32)',
                  willChange: 'transform, opacity',
                  transition: isDragging ? 'none' : 'border-color 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: isCenter ? 'default' : 'pointer'
                }}
              >
                {/* Top Pill & Action Button */}
                <div
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: isCenter ? '#d8f25a' : '#FFFFFF',
                      backgroundColor: 'rgba(26, 20, 32, 0.75)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(216, 242, 90, 0.35)'
                    }}
                  >
                    {card.brandName}
                  </span>

                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '13px',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    ↗
                  </span>
                </div>

                {/* Garment Image Representation */}
                <div
                  style={{
                    flex: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 16px'
                  }}
                >
                  <img
                    src={card.imageUrl}
                    alt={card.productName}
                    loading="lazy"
                    style={{
                      maxHeight: '250px',
                      maxWidth: '100%',
                      objectFit: 'cover',
                      borderRadius: '14px',
                      filter: 'drop-shadow(0 14px 24px rgba(0, 0, 0, 0.45))',
                      transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Bottom Dossier Info Box */}
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: 'rgba(26, 20, 32, 0.94)',
                    backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(251, 246, 236, 0.12)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: isCenter ? '#e5a83b' : '#d8f25a'
                      }}
                    >
                      {card.brandName}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: '10px',
                        color: 'rgba(251, 246, 236, 0.7)',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {card.subcategory}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#fbf6ec',
                      margin: '0 0 8px 0',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {card.productName}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontStyle: 'italic',
                        fontSize: '13px',
                        color: isCenter ? '#e5a83b' : '#d8f25a',
                        fontWeight: 500
                      }}
                    >
                      {card.priceFormatted}
                    </span>

                    <Link
                      to={card.link}
                      aria-label={`View Creation for ${card.brandName}`}
                      style={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#1a1420',
                        backgroundColor: '#fbf6ec',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s ease, transform 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
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
                      VIEW CREATION ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Instruction Hint (Exact Match to Image 3) */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <p
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(26, 20, 32, 0.55)',
              margin: 0
            }}
          >
            ← DRAG, SWIPE OR USE ARROW KEYS TO EXPLORE →
          </p>
        </div>
      </div>
    </section>
  );
};

export default DesignerRunwayCarousel;

