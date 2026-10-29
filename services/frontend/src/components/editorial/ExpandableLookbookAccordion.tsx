import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface CapsulePanel {
  id: string;
  number: string;
  tag: string;
  badge: string;
  highlightText: string;
  title: string;
  description: string;
  categorySlug: string;
  imageUrl: string;
  accentColor: string;
}

const CAPSULES: CapsulePanel[] = [
  {
    id: 'c1',
    number: '01',
    tag: 'SUMMER ARCHIVE',
    badge: 'CURATED SELECTION',
    highlightText: 'DIRECT',
    title: 'Summer Handloom Silks',
    description: 'Lightweight Chanderi & Katan weaves engineered for high-summer sartorial elegance.',
    categorySlug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#d8f25a',
  },
  {
    id: 'c2',
    number: '02',
    tag: 'SARTORIAL SUITING',
    badge: 'SUPER 250s MERINO',
    highlightText: 'BESPOKE',
    title: 'Heritage Bandhgalas',
    description: 'Precision cut Indian evening wear and structured double-breasted formal tailoring.',
    categorySlug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#8ea2ff',
  },
  {
    id: 'c3',
    number: '03',
    tag: 'BRIDAL MAISONS',
    badge: 'COUTURE ATELIER',
    highlightText: 'VERIFIED',
    title: 'Royal Zardozi Velvet',
    description: 'Hand-embroidered architectural silhouettes direct from certified couture flagships.',
    categorySlug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#f9e08a',
  },
  {
    id: 'c4',
    number: '04',
    tag: 'CONTEMPORARY RESORT',
    badge: 'PURE LINEN',
    highlightText: 'SEASONAL',
    title: 'Riviera & Cruise Silhouettes',
    description: 'Relaxed linen-silk separates crafted for trans-seasonal luxury living.',
    categorySlug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#7fe3c5',
  },
  {
    id: 'c5',
    number: '05',
    tag: 'AFTER DARK VELVET',
    badge: 'LIMITED RUN',
    highlightText: 'EXQUISITE',
    title: 'Gala & Evening Capes',
    description: 'Sequins and micro-beading that catch every light, paired with tailored columns.',
    categorySlug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#d8f25a',
  },
];

export const ExpandableLookbookAccordion: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('c1');
  const sectionRef = useRef<HTMLElement>(null);
  const lastManualSelection = useRef<number>(0);

  const handleSelectCapsule = useCallback((id: string) => {
    lastManualSelection.current = Date.now();
    setActiveId(id);
  }, []);

  // Scroll progression: automatically transition through capsules as user scrolls through the section
  useEffect(() => {
    let animationFrameId: number;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleScroll = () => {
      if (mediaQuery.matches) return;
      // If user tapped/clicked or hovered manually within last 2.5 seconds, do not override
      if (Date.now() - lastManualSelection.current < 2500) return;
      if (window.innerWidth < 768) return; // Natural layout on mobile

      animationFrameId = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const vh = window.innerHeight;

        // When the section is in the central scroll viewport
        if (rect.top < vh * 0.7 && rect.bottom > vh * 0.3) {
          const totalDistance = rect.height + vh * 0.4;
          const currentProgress = (vh * 0.7 - rect.top) / totalDistance;
          const clamped = Math.min(Math.max(currentProgress, 0), 1);
          const targetIndex = Math.min(Math.floor(clamped * CAPSULES.length), CAPSULES.length - 1);
          const targetCapsule = CAPSULES[targetIndex];
          if (targetCapsule && targetCapsule.id !== activeId) {
            setActiveId(targetCapsule.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [activeId]);

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-label="Lumière Curated Atelier Capsules"
      style={{
        backgroundColor: 'var(--bg, #fbf6ec)',
        paddingTop: '70px',
        paddingBottom: '90px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--line, #e5dccb)',
        borderBottom: '1px solid var(--line, #e5dccb)',
      }}
    >
      {/* Background Watermark Outlined Text */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          textAlign: 'center',
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 'clamp(50px, 12vw, 170px)',
          fontWeight: 800,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(229, 220, 203, 0.45)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          letterSpacing: '0.04em',
        }}
      >
        WORTH IT • WORTH IT
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3a3ce0' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1420', fontFamily: '"Instrument Sans", sans-serif' }}>
                CURRENT OFFERS & ATELIER CAPSULES
              </span>
            </div>
            <h2
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 'clamp(32px, 4.5vw, 52px)',
                fontWeight: 600,
                color: '#1a1420',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Worth your <span style={{ fontStyle: 'italic', color: '#3a3ce0' }}>attention</span>
            </h2>
          </div>

          <Link
            to="/products"
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1a1420',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#3a3ce0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#1a1420')}
          >
            SHOP ALL OFFERS →
          </Link>
        </div>

        {/* Multi-Panel Accordion Track with High-Fashion Photography */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            height: '520px',
            width: '100%',
          }}
        >
          {CAPSULES.map((capsule) => {
            const isActive = capsule.id === activeId;

            return (
              <div
                key={capsule.id}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                className={`ly ${isActive ? 'on' : ''}`}
                onClick={() => handleSelectCapsule(capsule.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectCapsule(capsule.id);
                  }
                }}
                onMouseEnter={() => handleSelectCapsule(capsule.id)}
                style={{
                  flex: isActive ? '4' : '1',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'flex 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
                  border: isActive ? `1.5px solid ${capsule.accentColor}` : '1px solid rgba(229, 220, 203, 0.45)',
                  boxShadow: isActive ? '0 24px 54px -12px rgba(26, 20, 32, 0.45)' : 'none',
                  minWidth: '70px',
                }}
              >
                {/* Full-Bleed Fashion Photography Background */}
                <img
                  src={capsule.imageUrl}
                  alt={capsule.title}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: isActive ? 'brightness(0.85) contrast(1.05)' : 'brightness(0.4) saturate(0.8)',
                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease',
                  }}
                />

                {/* Dark Vignette Overlay for Crisp Contrast */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isActive
                      ? 'linear-gradient(to top, rgba(26, 20, 32, 0.95) 0%, rgba(26, 20, 32, 0.45) 50%, rgba(26, 20, 32, 0.7) 100%)'
                      : 'rgba(26, 20, 32, 0.65)',
                    backdropFilter: isActive ? 'blur(1px)' : 'none',
                    transition: 'background 0.4s ease',
                  }}
                />

                {/* Active Expanded View */}
                {isActive ? (
                  <div
                    style={{
                      height: '100%',
                      padding: '36px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {/* Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span
                        style={{
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: '#1a1420',
                          backgroundColor: capsule.accentColor,
                          padding: '6px 14px',
                          borderRadius: '999px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {capsule.badge}
                      </span>

                      <span
                        style={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: '36px',
                          fontWeight: 700,
                          color: 'rgba(251, 246, 236, 0.7)',
                        }}
                      >
                        {capsule.number}
                      </span>
                    </div>

                    {/* Middle Graphic Feature Callout */}
                    <div style={{ margin: 'auto 0' }}>
                      <div
                        style={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: 'clamp(44px, 5.5vw, 76px)',
                          fontWeight: 900,
                          color: capsule.accentColor,
                          lineHeight: 1,
                          letterSpacing: '-0.03em',
                          marginBottom: '8px',
                          textShadow: '0 4px 18px rgba(0,0,0,0.5)',
                        }}
                      >
                        {capsule.highlightText}
                      </div>
                      <h3
                        style={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: 'clamp(24px, 3vw, 36px)',
                          fontWeight: 600,
                          color: '#fbf6ec',
                          margin: '0 0 10px 0',
                        }}
                      >
                        {capsule.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontSize: '14px',
                          color: 'rgba(251, 246, 236, 0.9)',
                          maxWidth: '460px',
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {capsule.description}
                      </p>
                    </div>

                    {/* Bottom CTA */}
                    <div>
                      <Link
                        to="/products"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#1a1420',
                          backgroundColor: '#d8f25a',
                          padding: '12px 24px',
                          borderRadius: '999px',
                          textDecoration: 'none',
                          boxShadow: '0 6px 20px rgba(216, 242, 90, 0.35)',
                          transition: 'transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                      >
                        Explore Capsule →
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Inactive Collapsed View */
                  <div
                    style={{
                      height: '100%',
                      padding: '24px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'rgba(251, 246, 236, 0.75)',
                      }}
                    >
                      {capsule.number}
                    </span>

                    <span
                      style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'rgba(251, 246, 236, 0.85)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {capsule.tag}
                    </span>

                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: capsule.accentColor,
                        boxShadow: `0 0 10px ${capsule.accentColor}`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Editorial Scroll & Selection Timeline Progress Bar */}
        <div
          role="tablist"
          aria-label="Capsule timeline progression"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '32px',
            flexWrap: 'wrap',
          }}
        >
          {CAPSULES.map((capsule) => {
            const isActive = capsule.id === activeId;
            return (
              <button
                key={capsule.id}
                role="tab"
                aria-selected={isActive}
                aria-label={`Capsule ${capsule.number}: ${capsule.title}`}
                onClick={() => handleSelectCapsule(capsule.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isActive ? '#1a1420' : 'rgba(26, 20, 32, 0.05)',
                  color: isActive ? '#d8f25a' : '#1a1420',
                  border: isActive ? '1px solid #1a1420' : '1px solid rgba(229, 220, 203, 0.8)',
                  borderRadius: '999px',
                  padding: '7px 18px',
                  cursor: 'pointer',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 4px 14px rgba(26, 20, 32, 0.2)' : 'none',
                }}
              >
                <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 }}>{capsule.number}</span>
                <span>{capsule.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExpandableLookbookAccordion;
