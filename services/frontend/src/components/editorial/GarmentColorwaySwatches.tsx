import React, { useRef } from 'react';
import { Box, Typography, Chip } from '@mui/material';

export interface ColorwayItem {
  name: string;
  hex?: string;
  imageUrl?: string;
  imageAttribution?: string;
}

export interface GarmentColorwaySwatchesProps {
  colorways?: ColorwayItem[];
  colorNames?: string[];
  selectedColor?: string;
  onSelectColorway?: (colorway: ColorwayItem) => void;
  productName?: string;
  className?: string;
}

// Curated luxury fabric swatch color map for visual swatch indicators
const LUXURY_COLOR_MAP: Record<string, string> = {
  'crimson red': '#8B1424',
  'antique gold': '#C5A059',
  'deep emerald': '#0F4734',
  'ivory blanc': '#F7F5EE',
  'sage green': '#8A9A86',
  'rose quartz': '#B58D97',
  'silver lilac ombré': '#A89FBA',
  'midnight noir': '#18181A',
  'champagne gold': '#E3D3B5',
  'dusty rose': '#C08081',
  'platinum gray': '#A5A9B4',
  'classic noir': '#1A1420',
  'noir': '#1A1420',
  'rani pink': '#D82672',
  'turquoise': '#30A5BF',
  'antique mustard': '#C8963E',
  'off-white & gold': '#EFECE1',
  'regal navy': '#1E2D4A',
  'wine red': '#6B1D2F',
  'midnight blue': '#1A233A',
  'deep charcoal': '#2E3238',
  'formal noir': '#121214',
  'matte black': '#1F1E24',
  'olive drab': '#555D42',
  'imperial cream': '#EFEBDC',
  'gulabi rose': '#E06D85',
  'haldi yellow': '#E5B138',
  'champa white': '#F4EFE6',
  'marigold orange': '#E26D28',
  'teal green': '#0C6E6D',
  'oatmeal melange': '#D2C6B4',
  'deep black': '#141416',
  'camel': '#A87A51',
  'medium gray melange': '#8C8E94',
  'navy': '#1D2A44',
  'tobacco brown': '#5D3B26',
  'ecru & black tweed': '#DCD4C5',
  'navy tweed': '#23324C',
  'pastel pink': '#E8BFCD',
  'tangerine': '#E8572B',
  'cobalt': '#3A3CE0',
  'rose': '#D6578F',
};

const resolveColorHex = (name: string, explicitHex?: string): string => {
  if (explicitHex) return explicitHex;
  const key = name.toLowerCase().trim();
  if (LUXURY_COLOR_MAP[key]) return LUXURY_COLOR_MAP[key];
  for (const [k, hex] of Object.entries(LUXURY_COLOR_MAP)) {
    if (key.includes(k) || k.includes(key)) return hex;
  }
  return '#B89758'; // Warm atelier gold neutral fallback
};

export const GarmentColorwaySwatches: React.FC<GarmentColorwaySwatchesProps> = ({
  colorways = [],
  colorNames = [],
  selectedColor,
  onSelectColorway,
  productName = 'Creation',
  className = '',
}) => {
  const swatchButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Only colorways that have verified preview images qualify for interactive swatches
  const verifiedImageColorways = colorways.filter((c) => Boolean(c.imageUrl));
  const hasInteractiveColorways = verifiedImageColorways.length > 1;

  // Active colorway label
  const activeColor = selectedColor || (hasInteractiveColorways ? verifiedImageColorways[0]?.name : colorNames[0] || '');

  // Handle keyboard navigation between swatches (roving tabindex)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!hasInteractiveColorways || !onSelectColorway) return;

    let targetIndex: number | null = null;
    const total = verifiedImageColorways.length;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (index + 1) % total;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (index - 1 + total) % total;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = total - 1;
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelectColorway(verifiedImageColorways[index]);
      return;
    }

    if (targetIndex !== null) {
      const nextColorway = verifiedImageColorways[targetIndex];
      onSelectColorway(nextColorway);
      swatchButtonsRef.current[targetIndex]?.focus();
    }
  };

  // Case 1: Verified multi-image colorway data exists -> Interactive accessible swatches
  if (hasInteractiveColorways) {
    return (
      <Box className={`garment-colorway-swatches ${className}`} sx={{ my: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#1a1420',
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '0.75rem',
            }}
          >
            Verified Atelier Colorways
          </Typography>
          <Typography
            variant="caption"
            aria-live="polite"
            sx={{
              color: '#3a3ce0',
              fontWeight: 600,
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '0.78rem',
            }}
          >
            Selected: <strong>{activeColor}</strong>
          </Typography>
        </Box>

        <Box
          role="radiogroup"
          aria-label={`Colorways for ${productName}`}
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {verifiedImageColorways.map((item, index) => {
            const isSelected = item.name.toLowerCase() === activeColor.toLowerCase();
            const hex = resolveColorHex(item.name, item.hex);

            return (
              <Box
                key={item.name}
                component="button"
                ref={(el: HTMLButtonElement | null) => {
                  swatchButtonsRef.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${item.name} colorway`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => onSelectColorway?.(item)}
                onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => handleKeyDown(e, index)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  p: 0,
                  bgcolor: hex,
                  border: isSelected ? '2px solid #ffffff' : '1px solid #e5dccb',
                  outline: isSelected ? '2.5px solid #1a1420' : 'none',
                  outlineOffset: '2px',
                  boxShadow: isSelected ? '0 0 0 2px #ffffff, 0 4px 10px rgba(26, 20, 32, 0.25)' : 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s ease, outline 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.12)',
                  },
                  '&:focus-visible': {
                    outline: '3px solid #3a3ce0 !important',
                    outlineOffset: '3px',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>
    );
  }

  // Case 2: No verified multi-image data exists -> Honest static color chips (Zero misleading interactive swatches)
  const displayNames = colorNames.length > 0 ? colorNames : colorways.map((c) => c.name);

  if (displayNames.length === 0) {
    return null;
  }

  return (
    <Box className={`garment-colorway-static-reference ${className}`} sx={{ my: 2.5 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#1a1420',
          fontFamily: '"Instrument Sans", sans-serif',
          fontSize: '0.75rem',
          display: 'block',
          mb: 1,
        }}
      >
        Atelier Palette Reference
      </Typography>

      <Box
        role="region"
        aria-label="Atelier palette reference"
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {displayNames.map((name) => {
          const hex = resolveColorHex(name);
          return (
            <Chip
              key={name}
              label={name}
              size="small"
              icon={
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: hex,
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    ml: 0.8,
                  }}
                />
              }
              sx={{
                bgcolor: '#fbf6ec',
                color: '#1a1420',
                border: '1px solid #e5dccb',
                fontFamily: '"Instrument Sans", sans-serif',
                fontWeight: 500,
                fontSize: '0.78rem',
                height: 28,
              }}
            />
          );
        })}
      </Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 0.8,
          color: '#6b6173',
          fontFamily: '"Instrument Sans", sans-serif',
          fontSize: '0.72rem',
        }}
      >
        Single verified silhouette preview shown. Inquire with the maison atelier for swatch samples and custom dye lots.
      </Typography>
    </Box>
  );
};

export default GarmentColorwaySwatches;
