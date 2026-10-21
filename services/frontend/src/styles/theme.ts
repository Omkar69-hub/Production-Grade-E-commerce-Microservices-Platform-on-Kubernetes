import { createTheme } from '@mui/material/styles';

// LUMIÈRE High-Fashion Editorial Palette (Prototype Aligned)
export const lumierePalette = {
  // Prototype Tokens
  bg: '#fbf6ec',             // Warm parchment linen
  ink: '#1a1420',            // Deep ink noir
  mute: '#6b6173',           // Muted plum slate
  line: '#e5dccb',           // Fine paper border
  lime: '#d8f25a',           // Vibrant chartreuse accent
  cobalt: '#3a3ce0',         // High-fashion electric cobalt
  tang: '#e8572b',           // Tangerine accent
  aubergine: '#2b1238',      // Midnight aubergine surface
  aubergineMute: '#cbb8d6',  // Soft lavender slate

  // Preserved Semantic Mappings
  noir: '#1a1420',
  noirSurface: '#2b1238',
  noirMuted: '#35293d',
  blanc: '#FFFFFF',
  alabaster: '#fbf6ec',
  creme: '#f5f0e6',
  border: '#e5dccb',
  borderDark: '#35293d',
  crimson: '#3a3ce0',        // Electric cobalt primary accent
  crimsonLight: '#5b5bf0',
  crimsonDark: '#1b1d6b',
  crimsonGlow: 'rgba(58, 60, 224, 0.25)',
  crimsonSubtle: 'rgba(58, 60, 224, 0.08)',
  textPrimary: '#1a1420',
  textSecondary: '#6b6173',
  goldLegacy: '#B89758',     // Preserved for backwards compatibility with existing badges
};

export const theme = createTheme({
  palette: {
    primary: {
      main: lumierePalette.ink,
      light: '#2d2436',
      dark: '#0e0b12',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: lumierePalette.cobalt,
      light: lumierePalette.crimsonLight,
      dark: lumierePalette.crimsonDark,
      contrastText: '#FFFFFF',
    },
    background: {
      default: lumierePalette.bg,
      paper: lumierePalette.blanc,
    },
    text: {
      primary: lumierePalette.textPrimary,
      secondary: lumierePalette.textSecondary,
    },
    divider: lumierePalette.line,
  },
  typography: {
    fontFamily: '"Instrument Sans", "Outfit", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
      fontSize: '3.5rem',
      fontWeight: 400,
      letterSpacing: '-0.03em',
      lineHeight: 1.05,
      color: lumierePalette.ink,
    },
    h2: {
      fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
      fontSize: '2.5rem',
      fontWeight: 400,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
      color: lumierePalette.ink,
    },
    h3: {
      fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
      fontSize: '2rem',
      fontWeight: 400,
      letterSpacing: '-0.015em',
      lineHeight: 1.2,
      color: lumierePalette.ink,
    },
    h4: {
      fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
      fontSize: '1.6rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: lumierePalette.ink,
    },
    h5: {
      fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
      color: lumierePalette.ink,
    },
    h6: {
      fontSize: '1.05rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    overline: {
      fontFamily: '"Fraunces", "Cinzel", serif',
      fontSize: '0.78rem',
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: lumierePalette.cobalt,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 99, // Pill-shaped calls to action from prototype
          padding: '11px 26px',
          boxShadow: 'none',
          fontSize: '0.9rem',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          backgroundColor: lumierePalette.ink,
          color: '#FFFFFF',
          border: '1px solid transparent',
          '&:hover': {
            backgroundColor: lumierePalette.cobalt,
            borderColor: lumierePalette.cobalt,
            boxShadow: `0 8px 24px ${lumierePalette.crimsonGlow}`,
          },
        },
        outlined: {
          borderColor: lumierePalette.ink,
          color: lumierePalette.ink,
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            borderColor: lumierePalette.cobalt,
            color: lumierePalette.cobalt,
            backgroundColor: lumierePalette.crimsonSubtle,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22, // Rounded editorial cards from prototype
          backgroundColor: lumierePalette.blanc,
          boxShadow: '0 4px 20px rgba(26, 20, 32, 0.04)',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          border: `1px solid ${lumierePalette.line}`,
          overflow: 'hidden',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(251, 246, 236, 0.96)',
          backdropFilter: 'blur(20px)',
          color: lumierePalette.ink,
          boxShadow: `0 1px 0 ${lumierePalette.line}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.25s ease',
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: lumierePalette.border,
            },
            '&:hover fieldset': {
              borderColor: lumierePalette.noir,
            },
            '&.Mui-focused fieldset': {
              borderColor: lumierePalette.crimson,
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
