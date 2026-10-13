import { createTheme } from '@mui/material/styles';

// LUMIÈRE High-Fashion Editorial Palette: Noir, Blanc & Crimson Red Accent
export const lumierePalette = {
  noir: '#0A0A0A',
  noirSurface: '#141414',
  noirMuted: '#242424',
  blanc: '#FFFFFF',
  alabaster: '#FAFAFA',
  creme: '#F5F3EF',
  border: '#E8E4DC',
  borderDark: '#2C2C2C',
  crimson: '#E50914',
  crimsonLight: '#FF3B30',
  crimsonDark: '#990000',
  crimsonGlow: 'rgba(229, 9, 20, 0.25)',
  crimsonSubtle: 'rgba(229, 9, 20, 0.06)',
  textPrimary: '#0A0A0A',
  textSecondary: '#66625B',
  goldLegacy: '#B89758', // Preserved for backwards compatibility with existing badges
};

export const theme = createTheme({
  palette: {
    primary: {
      main: lumierePalette.noir,
      light: '#282828',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: lumierePalette.crimson,
      light: lumierePalette.crimsonLight,
      dark: lumierePalette.crimsonDark,
      contrastText: '#FFFFFF',
    },
    background: {
      default: lumierePalette.alabaster,
      paper: lumierePalette.blanc,
    },
    text: {
      primary: lumierePalette.textPrimary,
      secondary: lumierePalette.textSecondary,
    },
    divider: lumierePalette.border,
  },
  typography: {
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.08,
      color: lumierePalette.noir,
    },
    h2: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
      color: lumierePalette.noir,
    },
    h3: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      lineHeight: 1.2,
      color: lumierePalette.noir,
    },
    h4: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: '1.6rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: lumierePalette.noir,
    },
    h5: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    h6: {
      fontSize: '1.05rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    overline: {
      fontFamily: '"Cinzel", serif',
      fontSize: '0.78rem',
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: lumierePalette.crimson,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 40, // Pill-shaped calls to action
          padding: '11px 26px',
          boxShadow: 'none',
          fontSize: '0.9rem',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          backgroundColor: lumierePalette.noir,
          color: '#FFFFFF',
          border: '1px solid transparent',
          '&:hover': {
            backgroundColor: '#1E1E1E',
            borderColor: lumierePalette.crimson,
            boxShadow: `0 8px 24px ${lumierePalette.crimsonGlow}`,
          },
        },
        outlined: {
          borderColor: lumierePalette.noir,
          color: lumierePalette.noir,
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            borderColor: lumierePalette.crimson,
            color: lumierePalette.crimson,
            backgroundColor: lumierePalette.crimsonSubtle,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Rounded image cards
          backgroundColor: lumierePalette.blanc,
          boxShadow: '0 4px 20px rgba(10, 10, 10, 0.04)',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          border: `1px solid ${lumierePalette.border}`,
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: lumierePalette.noir,
          boxShadow: '0 1px 0 #E8E4DC',
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
