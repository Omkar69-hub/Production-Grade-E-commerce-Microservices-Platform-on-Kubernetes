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
  imageBg: string;
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
    imageBg: 'linear-gradient(135deg, #e8572b 0%, #1a1420 100%)',
  },
  {
    id: 'c2',
    number: '02',
    tag: 'SARTORIAL SUITING',
    badge: 'SUPER 150s MERINO',
    highlightText: 'BESPOKE',
    title: 'Heritage Bandhgalas',
    description: 'Precision cut Indian evening wear and structured double-breasted formal tailoring.',
    categorySlug: 'clothing',
    imageBg: 'linear-gradient(135deg, #3a3ce0 0%, #1a1420 100%)',
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
    imageBg: 'linear-gradient(135deg, #b31267 0%, #2b1238 100%)',
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
    imageBg: 'linear-gradient(135deg, #2b7a78 0%, #1a1420 100%)',
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
    imageBg: 'linear-gradient(135deg, #2b1238 0%, #1a1420 100%)',
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
      // If user tapped/clicked or hovered manually within last 2 seconds, do not override
      if (Date.now() - lastManualSelection.current < 2000) return;
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
        paddingTop: '60px',
        paddingBottom: '80px',
        position: 'relative',
        overflow: 'hidden',
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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' }}>
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
              Worth your <span style={{ fontStyle: 'italic', color: '#1a1420' }}>attention</span>
            </h2>
          </div>

          <Link
            to="/collection"
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

        {/* Multi-Panel Accordion Track */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            height: '480px',
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
                onClick={() => handleSelectCapsule(capsule.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectCapsule(capsule.id);
                  }
                }}
                onMouseEnter={() => handleSelectCapsule(capsule.id)}
                style={{
                  flex: isActive ? '3.8' : '1',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: capsule.imageBg,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
                  border: isActive ? '1.5px solid rgba(216, 242, 90, 0.6)' : '1px solid rgba(229, 220, 203, 0.4)',
                  boxShadow: isActive ? '0 20px 48px -12px rgba(26, 20, 32, 0.35)' : 'none',
                  minWidth: '70px',
                }}
              >
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
                      backgroundColor: 'rgba(26, 20, 32, 0.35)',
                      backdropFilter: 'blur(4px)',
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
                          color: '#ffffff',
                          backgroundColor: '#e8572b',
                          padding: '6px 14px',
                          borderRadius: '999px',
                        }}
                      >
                        {capsule.badge}
                      </span>

                      <span
                        style={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: '32px',
                          fontWeight: 700,
                          color: 'rgba(251, 246, 236, 0.5)',
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
                          fontSize: 'clamp(44px, 6vw, 76px)',
                          fontWeight: 900,
                          color: '#d8f25a',
                          lineHeight: 1,
                          letterSpacing: '-0.03em',
                          marginBottom: '8px',
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
                          color: 'rgba(251, 246, 236, 0.85)',
                          maxWidth: '440px',
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {capsule.description}
                      </p>
                    </div>

                    {/* Bottom CTA */}
                    <div>
                      <Link
                        to="/collection"
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
                      backgroundColor: 'rgba(26, 20, 32, 0.65)',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'rgba(251, 246, 236, 0.6)',
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
                        color: 'rgba(251, 246, 236, 0.7)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {capsule.tag}
                    </span>

                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(216, 242, 90, 0.7)',
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
            marginTop: '28px',
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
                  padding: '6px 16px',
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
