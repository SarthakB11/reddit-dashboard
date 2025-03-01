'use client';

import React, { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  ThemeProvider, 
  createTheme,
  PaletteMode,
  useMediaQuery,
  Button,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Search as SearchIcon, 
  Timeline as TimelineIcon, 
  BubbleChart as BubbleChartIcon, 
  SentimentSatisfiedAlt as SentimentIcon, 
  AutoAwesome as AutoAwesomeIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

// Define navigation items
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { name: 'Search Results', path: '/search', icon: <SearchIcon /> },
  { name: 'Time Series Analysis', path: '/timeseries', icon: <TimelineIcon /> },
  { name: 'Network Analysis', path: '/network', icon: <BubbleChartIcon /> },
  { name: 'Sentiment Analysis', path: '/sentiment', icon: <SentimentIcon /> },
  { name: 'Topic Modeling', path: '/topics', icon: <BubbleChartIcon /> },
  { name: 'AI Summary', path: '/ai-summary', icon: <AutoAwesomeIcon /> },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<PaletteMode>('light');
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width:900px)');

  // Handles the mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Toggle theme mode
  const toggleThemeMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create theme
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563eb',
      },
      secondary: {
        main: '#9333ea',
      },
      background: {
        default: mode === 'light' ? '#f5f7fa' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
    },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light' 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  // Drawer content shared between mobile and desktop versions
  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ py: 4, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <AutoAwesomeIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 28 }} />
        <Typography variant="h6" noWrap component="div" fontWeight="600">
          Social Media Analysis
        </Typography>
      </Box>
      
      <Divider />
      
      <List component="nav" sx={{ flexGrow: 1, pt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              component={Link} 
              href={item.path}
              selected={pathname === item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<GitHubIcon />} 
            component="a" 
            href="https://github.com/yourusername/social-media-analysis" 
            target="_blank"
            sx={{ borderRadius: 20 }}
          >
            View on GitHub
          </Button>
          
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleThemeMode} sx={{ ml: 1 }}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* App Bar (visible on mobile only) */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
            display: { md: 'none' },
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesomeIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="h6" noWrap component="div">
                Social Media Analysis
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleThemeMode}>
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              boxShadow: 3,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer (permanent) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 4 },
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            mt: { xs: 7, md: 0 },
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
} 