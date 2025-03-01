'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  Menu,
  MenuItem,
  Button,
  Badge,
  useMediaQuery,
  Avatar,
  Tooltip,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useColorMode } from '../ThemeRegistry';

// Styled search input
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
}));

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();
  const isDarkMode = mode === 'dark';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('keyword', searchValue.trim());
      router.push(`/search?${params.toString()}`);
    }
  };
  
  // User menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Notifications menu handlers
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          noWrap
          component={Link}
          href="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          SocialMediaViz
        </Typography>
        
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ 
            flexGrow: 1,
            display: 'flex', 
            justifyContent: 'center',
            ml: 4 
          }}
        >
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search by keyword..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchValue}
              onChange={handleSearchChange}
            />
          </Search>
          {!isMobile && (
            <Button 
              variant="contained" 
              color="secondary" 
              type="submit"
              sx={{ ml: 1 }}
            >
              Search
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsOpen}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            id="notifications-menu"
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleNotificationsClose}>
              New feature: Network Visualization added
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              Data updated: Latest Reddit posts available
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              Welcome to SocialMediaViz dashboard!
            </MenuItem>
          </Menu>
          
          <Tooltip title="Settings">
            <IconButton 
              color="inherit"
              component={Link}
              href="/settings"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Help">
            <IconButton 
              color="inherit"
              component={Link}
              href="/about"
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Account">
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>My account</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 