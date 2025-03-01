'use client';

import React, { useState } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import TagIcon from '@mui/icons-material/Tag';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { usePathname, useRouter } from 'next/navigation';
import ThemeRegistry from "@/app/components/ThemeRegistry";
import ThemeToggle from '@/app/components/ThemeToggle';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const drawerWidth = 240;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Search', icon: <SearchIcon />, path: '/search' },
    { text: 'Time Series', icon: <TimelineIcon />, path: '/timeseries' },
    { text: 'Network Analysis', icon: <BubbleChartIcon />, path: '/network' },
    { text: 'Sentiment Analysis', icon: <SentimentSatisfiedAltIcon />, path: '/sentiment' },
    { text: 'Topic Modeling', icon: <TagIcon />, path: '/topics' },
    { text: 'AI Insights', icon: <AutoAwesomeIcon />, path: '/ai-insights' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Social Media Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Add theme toggle to bottom of drawer */}
      <Box sx={{ p: 2, mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Divider sx={{ width: '100%', mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Toggle Theme
          </Typography>
          <ThemeToggle />
        </Box>
      </Box>
    </div>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeRegistry>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
              position="fixed"
              sx={{
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { md: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                  {navigationItems.find(item => item.path === pathname)?.text || 'Social Media Analysis'}
                </Typography>
                
                {/* Add theme toggle to app bar for mobile */}
                <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                  <ThemeToggle />
                </Box>
              </Toolbar>
            </AppBar>
            <Box
              component="nav"
              sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
              aria-label="navigation"
            >
              {/* Mobile drawer */}
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                  display: { xs: 'block', md: 'none' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
              >
                {drawer}
              </Drawer>
              {/* Desktop drawer */}
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
              >
                {drawer}
              </Drawer>
            </Box>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: { md: `calc(100% - ${drawerWidth}px)` },
                mt: '64px', // AppBar height
              }}
            >
              {children}
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
