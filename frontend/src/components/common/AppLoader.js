import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Fade,
  CircularProgress,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import TimelineIcon from '@mui/icons-material/Timeline';

/**
 * AppLoader Component
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether the app is loading
 * @param {string} props.message - Optional message to display during loading
 * @param {string} props.variant - Variant of loader (splash, inline, overlay)
 */
const AppLoader = ({ 
  loading = true, 
  message = "Loading application...", 
  variant = "splash" 
}) => {
  const theme = useTheme();
  
  // If not loading, don't render anything
  if (!loading) return null;
  
  // Inline loader (small, for specific sections)
  if (variant === "inline") {
    return (
      <Box sx={{ m: 2, display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} sx={{ mr: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }
  
  // Overlay loader (semi-transparent overlay)
  if (variant === "overlay") {
    return (
      <Fade in={loading}>
        <Box 
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 400,
            }}
          >
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom align="center">
              {message}
            </Typography>
            <LinearProgress sx={{ width: '100%', mt: 2 }} />
          </Paper>
        </Box>
      </Fade>
    );
  }
  
  // Default: Splash screen loader
  return (
    <Fade in={loading}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            position: 'relative',
          }}
        >
          {/* Animated icons around the circular progress */}
          <Box sx={{ position: 'relative', width: 160, height: 160 }}>
            <CircularProgress 
              size={160} 
              thickness={2} 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                color: theme.palette.primary.main,
              }} 
            />
            
            <IconOrbit 
              icon={<TimelineIcon fontSize="large" />} 
              color={theme.palette.primary.main}
              size={36}
              angle={0}
              distance={80}
              duration={3}
            />
            
            <IconOrbit 
              icon={<BubbleChartIcon fontSize="large" />} 
              color={theme.palette.secondary.main}
              size={36}
              angle={90}
              distance={80}
              duration={5}
            />
            
            <IconOrbit 
              icon={<SentimentSatisfiedAltIcon fontSize="large" />} 
              color="#4caf50"
              size={36}
              angle={180}
              distance={80}
              duration={4}
            />
            
            <IconOrbit 
              icon={<TrendingUpIcon fontSize="large" />} 
              color="#ff9800"
              size={36}
              angle={270}
              distance={80}
              duration={6}
            />
            
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: theme.palette.background.paper,
                borderRadius: '50%',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                boxShadow: 2,
              }}
            >
              <Typography variant="h4" color="primary" fontWeight="bold">
                SM
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Typography variant="h4" gutterBottom>
          Social Media Dashboard
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 500 }}>
          {message}
        </Typography>
        
        <Box sx={{ width: '300px' }}>
          <LinearProgress 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              }
            }} 
          />
        </Box>
      </Box>
    </Fade>
  );
};

/**
 * IconOrbit Component - Creates an animated orbiting icon
 */
const IconOrbit = ({ icon, color, size, angle, distance, duration }) => {
  const theme = useTheme();
  
  // Calculate the initial position based on angle and distance
  const initialX = Math.sin(angle * Math.PI / 180) * distance;
  const initialY = -Math.cos(angle * Math.PI / 180) * distance;
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        borderRadius: '50%',
        bgcolor: theme.palette.background.paper,
        boxShadow: 2,
        transform: `translate(calc(-50% + ${initialX}px), calc(-50% + ${initialY}px))`,
        animation: `orbit ${duration}s infinite linear`,
        '@keyframes orbit': {
          '0%': {
            transform: `translate(calc(-50% + ${initialX}px), calc(-50% + ${initialY}px))`,
          },
          '100%': {
            transform: `translate(calc(-50% + ${initialX}px), calc(-50% + ${initialY}px)) rotate(360deg)`,
          },
        },
      }}
    >
      {icon}
    </Box>
  );
};

export default AppLoader;