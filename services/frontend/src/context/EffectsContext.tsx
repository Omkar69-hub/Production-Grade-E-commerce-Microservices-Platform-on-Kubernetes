import React, { createContext, useContext, useState, useEffect } from 'react';

interface EffectsContextType {
  effectsEnabled: boolean;
  toggleEffects: () => void;
  cursorPos: { x: number; y: number };
}

const EffectsContext = createContext<EffectsContextType>({
  effectsEnabled: true,
  toggleEffects: () => {},
  cursorPos: { x: -1000, y: -1000 },
});

export const EffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('lumiere_effects');
    if (saved !== null) {
      return saved === 'true';
    }
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });

  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    localStorage.setItem('lumiere_effects', effectsEnabled.toString());
    if (!effectsEnabled) {
      document.body.classList.add('no-motion');
    } else {
      document.body.classList.remove('no-motion');
    }
  }, [effectsEnabled]);

  useEffect(() => {
    if (!effectsEnabled) return;

    // Only enable lantern cursor on devices with fine pointer (mouse/trackpad, not touch)
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      const handlePointerMove = (e: PointerEvent) => {
        setCursorPos({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('pointermove', handlePointerMove);
      return () => window.removeEventListener('pointermove', handlePointerMove);
    }
  }, [effectsEnabled]);

  const toggleEffects = () => {
    setEffectsEnabled(prev => !prev);
  };

  return (
    <EffectsContext.Provider value={{ effectsEnabled, toggleEffects, cursorPos }}>
      {children}
      {effectsEnabled && cursorPos.x > 0 && (
        <div
          className="lumiere-lantern"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
          }}
        />
      )}
    </EffectsContext.Provider>
  );
};

export const useEffects = () => useContext(EffectsContext);
