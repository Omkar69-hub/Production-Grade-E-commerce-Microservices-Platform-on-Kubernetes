import React, { useEffect, useState } from 'react';

export const CustomAtmosphereCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [cursorMode, setCursorMode] = useState<'default' | 'drag' | 'view'>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const dragElem = target.closest('[data-cursor="drag"]');
        const viewElem = target.closest('[data-cursor="view"]');
        if (dragElem) {
          setCursorMode('drag');
        } else if (viewElem) {
          setCursorMode('view');
        } else {
          setCursorMode('default');
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isExpanded = cursorMode !== 'default';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 99990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease',
        width: isExpanded ? '64px' : '34px',
        height: isExpanded ? '64px' : '34px',
        borderRadius: '50%',
        backgroundColor: isExpanded ? '#d8f25a' : 'transparent',
        border: isExpanded ? 'none' : '1.5px solid rgba(58, 60, 224, 0.45)',
        boxShadow: isExpanded ? '0 8px 24px rgba(216, 242, 90, 0.45)' : 'none',
      }}
    >
      {isExpanded ? (
        <span
          style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            color: '#1a1420',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            userSelect: 'none',
          }}
        >
          {cursorMode === 'drag' ? 'DRAG' : 'VIEW'}
        </span>
      ) : (
        <div
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: '#3a3ce0',
          }}
        />
      )}
    </div>
  );
};

export default CustomAtmosphereCursor;
