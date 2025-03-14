'use client';

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect, useMemo, createContext, useContext } from 'react';

// Create a context for theme state
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'light',
});

// Custom hook to use the theme context
export const useColorMode = () => useContext(ColorModeContext);

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  // Use state with a default value
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  // Use a client-only flag to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  // After hydration, we can safely use client-side features like localStorage
  useEffect(() => {
    setMounted(true);
    // Get default theme from localStorage or system preference
    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'dark' || savedMode === 'light') {
      setMode(savedMode as 'light' | 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark');
    }
  }, []);
  
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          // Save to localStorage
          localStorage.setItem('theme', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  // Create MUI theme based on the current mode
  const theme = useMemo(
    () => {
      const newTheme = createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: mode === 'dark' ? '#f48fb1' : '#dc004e',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 500,
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
          },
          h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
          },
          h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
          },
          h6: {
            fontSize: '1rem',
            fontWeight: 500,
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: mode === 'dark' ? '#6b6b6b #2b2b2b' : '#959595 #f5f5f5',
                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                  backgroundColor: mode === 'dark' ? '#2b2b2b' : '#f5f5f5',
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                  borderRadius: 8,
                  backgroundColor: mode === 'dark' ? '#6b6b6b' : '#959595',
                  minHeight: 24,
                },
                '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
                  backgroundColor: mode === 'dark' ? '#959595' : '#6b6b6b',
                },
                '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
                  backgroundColor: mode === 'dark' ? '#959595' : '#6b6b6b',
                },
                '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: mode === 'dark' ? '#959595' : '#6b6b6b',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'dark' 
                  ? '0px 3px 5px rgba(0, 0, 0, 0.4)' 
                  : '0px 3px 5px rgba(0, 0, 0, 0.1)',
              },
            },
          },
        },
      });
      
      return newTheme;
    },
    [mode],
  );

  // Render only the skeleton until client-side hydration completes to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
} 