import React, { useEffect, useState } from 'react';

interface SilkPreloaderProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export const SilkPreloader: React.FC<SilkPreloaderProps> = ({ forceShow = false, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isParting, setIsParting] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeen = typeof window !== 'undefined' ? sessionStorage.getItem('lumiere_preloader_seen') : null;

    if (!forceShow && (hasSeen || prefersReducedMotion)) {
      setIsVisible(false);
      onComplete?.();
      return;
    }

    setIsVisible(true);

    // Sequence: 900ms presentation, then start silk parting curtain
    const partingTimer = setTimeout(() => {
      setIsParting(true);
    }, 900);

    // Complete after curtain wipe finishes
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem('lumiere_preloader_seen', 'true');
      } catch {
        // Ignore session storage errors
      }
      onComplete?.();
    }, 1600);

    return () => {
      clearTimeout(partingTimer);
      clearTimeout(finishTimer);
    };
  }, [forceShow, onComplete]);

  if (!isVisible) return null;

  const handleSkip = () => {
    setIsParting(true);
    setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem('lumiere_preloader_seen', 'true');
      } catch {
        // Ignore session storage errors
      }
      onComplete?.();
    }, 300);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Lumière atelier reveal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: isParting ? 'none' : 'auto',
        transition: 'opacity 0.5s ease',
        opacity: isParting ? 0 : 1,
      }}
    >
      {/* Left Silk Drape */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '50%',
          backgroundColor: '#1a1420',
          backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(58, 60, 224, 0.25), transparent 70%), linear-gradient(135deg, #1a1420 0%, #2b1238 100%)',
          transform: isParting ? 'translateX(-102%)' : 'translateX(0)',
          transition: 'transform 0.75s cubic-bezier(0.77, 0, 0.175, 1)',
          borderRight: '1px solid rgba(216, 242, 90, 0.25)',
        }}
      />

      {/* Right Silk Drape */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: '50%',
          backgroundColor: '#1a1420',
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(216, 242, 90, 0.18), transparent 70%), linear-gradient(225deg, #1a1420 0%, #2b1238 100%)',
          transform: isParting ? 'translateX(102%)' : 'translateX(0)',
          transition: 'transform 0.75s cubic-bezier(0.77, 0, 0.175, 1)',
          borderLeft: '1px solid rgba(216, 242, 90, 0.25)',
        }}
      />

      {/* Central Monogram & Silk Reveal Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          opacity: isParting ? 0 : 1,
          transform: isParting ? 'scale(0.96)' : 'scale(1)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ color: '#d8f25a', fontSize: '13px' }}>✦</span>
          <span style={{ color: 'rgba(251, 246, 236, 0.7)', fontSize: '11px', letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: '"Instrument Sans", sans-serif' }}>
            Atelier Discovery Edition
          </span>
          <span style={{ color: '#d8f25a', fontSize: '13px' }}>✦</span>
        </div>

        <h1
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 'clamp(42px, 8vw, 76px)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#fbf6ec',
            margin: '0 0 12px 0',
            lineHeight: 1,
          }}
        >
          LUMIÈRE
        </h1>

        <p
          style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '12px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#d8f25a',
            margin: '0 0 24px 0',
            fontWeight: 600,
          }}
        >
          Direct Atelier Referrals • Certified Brand Flagships
        </p>

        {/* Shimmer progress line */}
        <div
          style={{
            width: '160px',
            height: '2px',
            backgroundColor: 'rgba(251, 246, 236, 0.15)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '60%',
              backgroundColor: '#d8f25a',
              borderRadius: '999px',
              animation: 'silkProgress 1.2s ease-in-out infinite',
            }}
          />
        </div>

        <button
          onClick={handleSkip}
          aria-label="Skip introduction animation"
          style={{
            marginTop: '28px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(251, 246, 236, 0.45)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: '6px 12px',
          }}
        >
          Skip Intro →
        </button>
      </div>

      <style>{`
        @keyframes silkProgress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default SilkPreloader;
