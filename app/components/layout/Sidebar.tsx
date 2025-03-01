'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import InsightsIcon from '@mui/icons-material/Insights';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const theme = useTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [openAnalysis, setOpenAnalysis] = useState(true);
  
  const handleAnalysisClick = () => {
    setOpenAnalysis(!openAnalysis);
  };
  
  const isActive = (path: string) => pathname === path;

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: isMobile ? 0 : '64px', // AppBar height
          pt: isMobile ? 0 : 2,
        },
      }}
    >
      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            SocialMediaViz
          </Typography>
          <IconButton onClick={onClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}
      
      <Box sx={{ overflow: 'auto', pt: isMobile ? 0 : 2 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/dashboard"
              selected={isActive('/dashboard')}
            >
              <ListItemIcon>
                <DashboardIcon color={isActive('/dashboard') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{
                  fontWeight: isActive('/dashboard') ? 700 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/search"
              selected={isActive('/search')}
            >
              <ListItemIcon>
                <SearchIcon color={isActive('/search') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Search & Filter" 
                primaryTypographyProps={{
                  fontWeight: isActive('/search') ? 700 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider />
        
        <List>
          <ListItem>
            <ListItemButton onClick={handleAnalysisClick}>
              <ListItemIcon>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Analysis Tools" 
                primaryTypographyProps={{
                  fontWeight: 500,
                }}
              />
              {openAnalysis ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={openAnalysis} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                component={Link} 
                href="/timeseries"
                selected={isActive('/timeseries')}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <TimelineIcon color={isActive('/timeseries') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Time Series" 
                  primaryTypographyProps={{
                    fontWeight: isActive('/timeseries') ? 700 : 400,
                  }}
                />
              </ListItemButton>
              
              <ListItemButton 
                component={Link} 
                href="/network"
                selected={isActive('/network')}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <NetworkCheckIcon color={isActive('/network') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Network Analysis" 
                  primaryTypographyProps={{
                    fontWeight: isActive('/network') ? 700 : 400,
                  }}
                />
              </ListItemButton>
              
              <ListItemButton 
                component={Link} 
                href="/sentiment"
                selected={isActive('/sentiment')}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <SentimentSatisfiedAltIcon color={isActive('/sentiment') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Sentiment Analysis" 
                  primaryTypographyProps={{
                    fontWeight: isActive('/sentiment') ? 700 : 400,
                  }}
                />
              </ListItemButton>
              
              <ListItemButton 
                component={Link} 
                href="/topics"
                selected={isActive('/topics')}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <FormatQuoteIcon color={isActive('/topics') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Topic Modeling" 
                  primaryTypographyProps={{
                    fontWeight: isActive('/topics') ? 700 : 400,
                  }}
                />
              </ListItemButton>
              
              <ListItemButton 
                component={Link} 
                href="/ai-summary"
                selected={isActive('/ai-summary')}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <AutoAwesomeIcon color={isActive('/ai-summary') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary="AI Summary" 
                  primaryTypographyProps={{
                    fontWeight: isActive('/ai-summary') ? 700 : 400,
                  }}
                />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
        
        <Divider />
        
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/about"
              selected={isActive('/about')}
            >
              <ListItemIcon>
                <InfoIcon color={isActive('/about') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="About" 
                primaryTypographyProps={{
                  fontWeight: isActive('/about') ? 700 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Box sx={{ mx: 2, mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TipsAndUpdatesIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" fontWeight={600}>
              Pro Tip
            </Typography>
          </Box>
          <Typography variant="caption">
            Use the Network Analysis tool to discover hidden connections between subreddits and authors!
          </Typography>
        </Box>
        
        <Box sx={{ position: 'absolute', bottom: 0, width: '100%', py: 2, px: 2 }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            display="block"
            align="center"
          >
            SocialMediaViz v1.0.0
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            display="block"
            align="center"
          >
            © 2023 SimPPL Research
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 