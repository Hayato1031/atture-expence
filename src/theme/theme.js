import { createTheme } from '@mui/material/styles';

// Beautiful color palette with gradients
const colors = {
  primary: {
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  secondary: {
    main: '#ec4899',
    light: '#f472b6',
    dark: '#db2777',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  },
  background: {
    light: {
      default: '#f8fafc',
      paper: 'rgba(255, 255, 255, 0.8)',
      gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    },
    dark: {
      default: '#0f172a',
      paper: 'rgba(30, 41, 59, 0.8)',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    },
  },
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.25)',
      border: 'rgba(255, 255, 255, 0.18)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    dark: {
      background: 'rgba(17, 25, 40, 0.25)',
      border: 'rgba(255, 255, 255, 0.125)',
      shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
  },
};

// Create light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    background: {
      default: colors.background.light.default,
      paper: colors.background.light.paper,
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.6,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.7,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.7,
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
  shadows: [
    'none',
    '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    '0 4px 8px 0 rgba(0, 0, 0, 0.05)',
    '0 8px 16px 0 rgba(0, 0, 0, 0.05)',
    '0 12px 24px 0 rgba(0, 0, 0, 0.05)',
    '0 16px 32px 0 rgba(0, 0, 0, 0.05)',
    '0 20px 40px 0 rgba(0, 0, 0, 0.05)',
    '0 24px 48px 0 rgba(0, 0, 0, 0.05)',
    '0 28px 56px 0 rgba(0, 0, 0, 0.05)',
    '0 32px 64px 0 rgba(0, 0, 0, 0.05)',
    '0 36px 72px 0 rgba(0, 0, 0, 0.05)',
    '0 40px 80px 0 rgba(0, 0, 0, 0.05)',
    '0 44px 88px 0 rgba(0, 0, 0, 0.05)',
    '0 48px 96px 0 rgba(0, 0, 0, 0.05)',
    '0 52px 104px 0 rgba(0, 0, 0, 0.05)',
    '0 56px 112px 0 rgba(0, 0, 0, 0.05)',
    '0 60px 120px 0 rgba(0, 0, 0, 0.05)',
    '0 64px 128px 0 rgba(0, 0, 0, 0.05)',
    '0 68px 136px 0 rgba(0, 0, 0, 0.05)',
    '0 72px 144px 0 rgba(0, 0, 0, 0.05)',
    '0 76px 152px 0 rgba(0, 0, 0, 0.05)',
    '0 80px 160px 0 rgba(0, 0, 0, 0.05)',
    '0 84px 168px 0 rgba(0, 0, 0, 0.05)',
    '0 88px 176px 0 rgba(0, 0, 0, 0.05)',
    '0 92px 184px 0 rgba(0, 0, 0, 0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: colors.primary.gradient,
          '&:hover': {
            background: colors.primary.gradient,
            opacity: 0.9,
          },
        },
        containedSecondary: {
          background: colors.secondary.gradient,
          '&:hover': {
            background: colors.secondary.gradient,
            opacity: 0.9,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.glass.light.background,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.glass.light.border}`,
          boxShadow: colors.glass.light.shadow,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: colors.glass.light.background,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.glass.light.border}`,
          boxShadow: colors.glass.light.shadow,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.glass.light.background,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.glass.light.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.glass.light.background,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: `1px solid ${colors.glass.light.border}`,
          boxShadow: colors.glass.light.shadow,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px 0 rgba(99, 102, 241, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

// Create dark theme
export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.light,
      light: colors.primary.main,
      dark: colors.primary.dark,
    },
    secondary: {
      main: colors.secondary.light,
      light: colors.secondary.main,
      dark: colors.secondary.dark,
    },
    success: {
      main: colors.success.light,
      light: colors.success.main,
      dark: colors.success.dark,
    },
    warning: {
      main: colors.warning.light,
      light: colors.warning.main,
      dark: colors.warning.dark,
    },
    error: {
      main: colors.error.light,
      light: colors.error.main,
      dark: colors.error.dark,
    },
    background: {
      default: colors.background.dark.default,
      paper: colors.background.dark.paper,
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  components: {
    ...lightTheme.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.glass.dark.background,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.glass.dark.border}`,
          boxShadow: colors.glass.dark.shadow,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: colors.glass.dark.background,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.glass.dark.border}`,
          boxShadow: colors.glass.dark.shadow,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 48px 0 rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.glass.dark.background,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.glass.dark.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.glass.dark.background,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: `1px solid ${colors.glass.dark.border}`,
          boxShadow: colors.glass.dark.shadow,
        },
      },
    },
  },
});

// Export theme utilities
export const getGradient = (color) => colors[color]?.gradient || colors.primary.gradient;
export const getGlassStyle = (mode) => colors.glass[mode] || colors.glass.light;