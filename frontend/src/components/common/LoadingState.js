import React from 'react';
import { 
  Box, 
  CircularProgress, 
  LinearProgress,
  Skeleton, 
  Typography,
  Card,
  CardContent,
  Grid,
  Fade,
  useTheme 
} from '@mui/material';

/**
 * LoadingState component
 * @param {Object} props - Component props
 * @param {string} props.type - Type of loading animation (circular, linear, skeleton, card)
 * @param {string} props.message - Optional message to display during loading
 * @param {boolean} props.fromCache - Whether data is loading from cache
 * @param {number} props.height - Height of the loading container
 * @param {string} props.variant - Variant of skeleton (text, rectangular, circular)
 * @param {number} props.count - Number of skeleton items to display
 * @param {boolean} props.fullWidth - Whether the loading animation should take full width
 * @param {Object} props.sx - Additional styles to apply
 */
const LoadingState = ({ 
  type = 'circular', 
  message = 'Loading...', 
  fromCache = false,
  height = 'auto',
  variant = 'rectangular',
  count = 1,
  fullWidth = false,
  sx = {}
}) => {
  const theme = useTheme();

  // Render based on type
  switch (type) {
    case 'linear':
      return (
        <Box sx={{ width: '100%', ...sx }}>
          <LinearProgress color={fromCache ? "secondary" : "primary"} />
          {message && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ display: 'block', textAlign: 'center', mt: 1 }}
            >
              {fromCache ? 'Loading from cache...' : message}
            </Typography>
          )}
        </Box>
      );
      
    case 'skeleton':
      return (
        <Box sx={{ width: '100%', ...sx }}>
          {Array(count).fill(0).map((_, index) => (
            <Skeleton 
              key={index}
              variant={variant}
              height={height}
              width={fullWidth ? '100%' : undefined}
              animation="wave"
              sx={{ 
                mb: 1, 
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)',
                ...sx
              }}
            />
          ))}
        </Box>
      );
      
    case 'card':
      return (
        <Fade in={true}>
          <Card sx={{ height, width: '100%', ...sx }}>
            <CardContent>
              <Skeleton variant="rectangular" width="70%" height={24} sx={{ mb: 2 }} />
              
              <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={100} height={20} />
              </Box>
            </CardContent>
          </Card>
        </Fade>
      );
      
    case 'grid':
      return (
        <Grid container spacing={2} sx={sx}>
          {Array(count).fill(0).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" width="60%" height={28} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="40%" height={20} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" width="100%" height={120} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
      
    case 'stats':
      return (
        <Grid container spacing={2} sx={sx}>
          {Array(count).fill(0).map((_, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" width="70%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="90%" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="40%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
      
    case 'table':
      return (
        <Box sx={{ width: '100%', ...sx }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', mb: 1 }}>
            {Array(4).fill(0).map((_, index) => (
              <Skeleton 
                key={`header-${index}`}
                variant="rectangular"
                height={30}
                sx={{ 
                  flex: 1,
                  mr: index < 3 ? 1 : 0,
                  borderRadius: 1
                }}
              />
            ))}
          </Box>
          
          {/* Data rows */}
          {Array(count).fill(0).map((_, rowIndex) => (
            <Box key={`row-${rowIndex}`} sx={{ display: 'flex', mb: 1 }}>
              {Array(4).fill(0).map((_, colIndex) => (
                <Skeleton 
                  key={`cell-${rowIndex}-${colIndex}`}
                  variant="rectangular"
                  height={24}
                  sx={{ 
                    flex: 1,
                    mr: colIndex < 3 ? 1 : 0,
                    borderRadius: 1
                  }}
                />
              ))}
            </Box>
          ))}
        </Box>
      );
      
    case 'chart':
      return (
        <Box 
          sx={{ 
            width: '100%', 
            height: height || 300, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            borderRadius: 1,
            ...sx 
          }}
        >
          <CircularProgress size={40} color={fromCache ? "secondary" : "primary"} />
          {message && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {fromCache ? 'Loading from cache...' : message}
            </Typography>
          )}
        </Box>
      );
      
    case 'circular':
    default:
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: height || 'auto',
            width: '100%',
            ...sx 
          }}
        >
          <CircularProgress color={fromCache ? "secondary" : "primary"} />
          {message && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {fromCache ? 'Loading from cache...' : message}
            </Typography>
          )}
        </Box>
      );
  }
};

export default LoadingState;