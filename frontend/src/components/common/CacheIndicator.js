import React from 'react';
import { 
  Chip, 
  Tooltip, 
  IconButton,
  Box,
  alpha,
  Fade,
  useTheme 
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Cache Indicator Component
 * @param {Object} props - Component props
 * @param {boolean} props.isFromCache - Whether data was loaded from cache
 * @param {Function} props.onRefresh - Function to refresh data
 * @param {string} props.size - Size of the indicator (small, medium, large)
 * @param {Object} props.sx - Additional styles to apply
 * @param {string} props.position - Position of the indicator (default: top-right)
 * @param {boolean} props.showRefresh - Whether to show the refresh button
 */
const CacheIndicator = ({ 
  isFromCache = false, 
  onRefresh, 
  size = 'medium',
  sx = {},
  position = 'top-right',
  showRefresh = true
}) => {
  const theme = useTheme();

  if (!isFromCache) return null;

  // Define position styles
  const positionStyles = {
    'top-right': { top: 8, right: 8 },
    'top-left': { top: 8, left: 8 },
    'bottom-right': { bottom: 8, right: 8 },
    'bottom-left': { bottom: 8, left: 8 },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };

  // Component sizes
  const sizes = {
    small: {
      chipHeight: 24,
      iconSize: 'small',
      buttonSize: 'small'
    },
    medium: {
      chipHeight: 32,
      iconSize: 'small',
      buttonSize: 'medium'
    },
    large: {
      chipHeight: 40,
      iconSize: 'medium',
      buttonSize: 'large'
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <Fade in={true}>
      <Box 
        sx={{ 
          position: 'absolute',
          ...positionStyles[position],
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          ...sx
        }}
      >
        <Tooltip title="Data loaded from cache">
          <Chip
            icon={<CachedIcon fontSize={currentSize.iconSize} />}
            label="Cached"
            size={size === 'large' ? 'medium' : 'small'}
            color="secondary"
            variant="outlined"
            sx={{ 
              height: currentSize.chipHeight,
              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              borderColor: theme.palette.secondary.main,
              '& .MuiChip-label': {
                fontWeight: 500
              }
            }}
          />
        </Tooltip>
        
        {showRefresh && onRefresh && (
          <Tooltip title="Refresh data">
            <IconButton 
              color="primary" 
              onClick={onRefresh}
              size={currentSize.buttonSize}
              sx={{ ml: 0.5 }}
            >
              <RefreshIcon fontSize={currentSize.iconSize} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Fade>
  );
};

export default CacheIndicator;
