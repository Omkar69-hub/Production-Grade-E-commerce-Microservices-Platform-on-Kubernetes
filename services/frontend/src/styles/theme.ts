import { createTheme, alpha } from '@mui/material/styles';

const primaryColor = '#4F46E5'; // Modern Indigo
const secondaryColor = '#10B981'; // Vibrant Emerald

export const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#fff',
    },
    secondary: {
      main: secondaryColor,
      light: '#34D399',
      dark: '#059669',
      contrastText: '#fff',
    },
    background: {
      default: '#F8FAFC', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0F172A', // Slate 900
      secondary: '#64748B', // Slate 500
    },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(primaryColor, 0.2)}`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          transition: 'all 0.3s ease-in-out',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.1)',
            borderColor: alpha(primaryColor, 0.3),
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          color: '#0F172A',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease-in-out',
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.1)}`,
            },
          },
        },
      },
    },
  },
});
