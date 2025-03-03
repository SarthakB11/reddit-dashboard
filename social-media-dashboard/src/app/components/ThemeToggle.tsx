'use client';

import React, { useState } from 'react';
import { 
  IconButton, 
  Tooltip, 
  useTheme,
  Snackbar,
  Alert,
  Zoom
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from './ThemeRegistry';

export default function ThemeToggle() {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const isDark = theme.palette.mode === 'dark';
  const [open, setOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  
  const handleThemeChange = () => {
    // Store current state before toggle
    const currentMode = isDark;
    // Add rotation animation
    setRotating(true);
    setTimeout(() => setRotating(false), 500);
    
    toggleColorMode();
    setOpen(true);
    
    // Use setTimeout to ensure the message uses the state after the toggle
    setTimeout(() => {
      console.log(`Switched to ${currentMode ? 'light' : 'dark'} mode`);
    }, 0);
  };
  
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  
  return (
    <>
      <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <IconButton 
          onClick={handleThemeChange} 
          color="inherit" 
          aria-label="toggle theme"
          sx={{ 
            ml: 1,
            transition: 'transform 0.5s',
            transform: rotating ? 'rotate(180deg)' : 'rotate(0deg)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <Zoom in={isDark} timeout={300} mountOnEnter unmountOnExit>
            <Brightness7Icon />
          </Zoom>
          <Zoom in={!isDark} timeout={300} mountOnEnter unmountOnExit>
            <Brightness4Icon />
          </Zoom>
        </IconButton>
      </Tooltip>
      
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Zoom}
      >
        <Alert 
          onClose={handleClose} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Switched to {!isDark ? 'light' : 'dark'} mode
        </Alert>
      </Snackbar>
    </>
  );
} 
