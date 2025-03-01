'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  CircularProgress,
  Divider,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ForumIcon from '@mui/icons-material/Forum';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

// Define interfaces for network data
interface NetworkNode {
  id: string;
  name: string;
  type: 'subreddit' | 'author';
  connections: number;
  posts: number;
  size?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  metrics: {
    density: number;
    modularity: number;
    communities: number;
    avgConnections: number;
  };
}

// Function to generate mock network data
const generateMockNetworkData = (): NetworkData => {
  // Create subreddit nodes
  const subreddits: NetworkNode[] = [
    { id: 'r/technology', name: 'technology', type: 'subreddit', connections: 15, posts: 450 },
    { id: 'r/politics', name: 'politics', type: 'subreddit', connections: 12, posts: 380 },
    { id: 'r/science', name: 'science', type: 'subreddit', connections: 10, posts: 320 },
    { id: 'r/news', name: 'news', type: 'subreddit', connections: 8, posts: 280 },
    { id: 'r/worldnews', name: 'worldnews', type: 'subreddit', connections: 7, posts: 240 },
  ];
  
  // Create author nodes
  const authors: NetworkNode[] = [
    { id: 'u/user1', name: 'user1', type: 'author', connections: 5, posts: 120 },
    { id: 'u/user2', name: 'user2', type: 'author', connections: 4, posts: 95 },
    { id: 'u/user3', name: 'user3', type: 'author', connections: 6, posts: 150 },
    { id: 'u/user4', name: 'user4', type: 'author', connections: 3, posts: 80 },
    { id: 'u/user5', name: 'user5', type: 'author', connections: 7, posts: 170 },
    { id: 'u/user6', name: 'user6', type: 'author', connections: 2, posts: 60 },
    { id: 'u/user7', name: 'user7', type: 'author', connections: 4, posts: 110 },
    { id: 'u/user8', name: 'user8', type: 'author', connections: 5, posts: 130 },
  ];
  
  // Create links between nodes
  const links: NetworkLink[] = [
    // User1 connections
    { source: 'u/user1', target: 'r/technology', value: 45 },
    { source: 'u/user1', target: 'r/science', value: 30 },
    { source: 'u/user1', target: 'r/news', value: 25 },
    { source: 'u/user1', target: 'u/user3', value: 10 },
    { source: 'u/user1', target: 'u/user5', value: 8 },
    
    // User2 connections
    { source: 'u/user2', target: 'r/politics', value: 40 },
    { source: 'u/user2', target: 'r/worldnews', value: 35 },
    { source: 'u/user2', target: 'u/user4', value: 12 },
    { source: 'u/user2', target: 'u/user7', value: 7 },
    
    // User3 connections
    { source: 'u/user3', target: 'r/technology', value: 50 },
    { source: 'u/user3', target: 'r/science', value: 45 },
    { source: 'u/user3', target: 'r/news', value: 30 },
    { source: 'u/user3', target: 'u/user5', value: 15 },
    { source: 'u/user3', target: 'u/user8', value: 9 },
    
    // User4 connections
    { source: 'u/user4', target: 'r/politics', value: 35 },
    { source: 'u/user4', target: 'r/worldnews', value: 30 },
    { source: 'u/user4', target: 'u/user7', value: 14 },
    
    // User5 connections
    { source: 'u/user5', target: 'r/technology', value: 55 },
    { source: 'u/user5', target: 'r/science', value: 50 },
    { source: 'u/user5', target: 'r/news', value: 40 },
    { source: 'u/user5', target: 'u/user8', value: 20 },
    { source: 'u/user5', target: 'u/user1', value: 8 },
    { source: 'u/user5', target: 'u/user3', value: 15 },
    
    // User6 connections
    { source: 'u/user6', target: 'r/politics', value: 25 },
    { source: 'u/user6', target: 'r/worldnews', value: 20 },
    
    // User7 connections
    { source: 'u/user7', target: 'r/politics', value: 45 },
    { source: 'u/user7', target: 'r/worldnews', value: 40 },
    { source: 'u/user7', target: 'u/user2', value: 7 },
    { source: 'u/user7', target: 'u/user4', value: 14 },
    
    // User8 connections
    { source: 'u/user8', target: 'r/technology', value: 40 },
    { source: 'u/user8', target: 'r/science', value: 35 },
    { source: 'u/user8', target: 'r/news', value: 30 },
    { source: 'u/user8', target: 'u/user3', value: 9 },
    { source: 'u/user8', target: 'u/user5', value: 20 },
  ];
  
  // Calculate network metrics
  const metrics = {
    density: 0.42,
    modularity: 0.68,
    communities: 3,
    avgConnections: 4.8,
  };
  
  return {
    nodes: [...subreddits, ...authors],
    links,
    metrics,
  };
};

export default function NetworkAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [filterMode, setFilterMode] = useState<'all' | 'subreddit' | 'author'>('all');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate API call with timeout
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        const data = generateMockNetworkData();
        setNetworkData(data);
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
  }, []);
  
  const handleViewModeChange = (mode: '2d' | '3d') => {
    setViewMode(mode);
  };
  
  const handleFilterModeChange = (event: SelectChangeEvent) => {
    setFilterMode(event.target.value as 'all' | 'subreddit' | 'author');
    setSelectedNode(null);
  };
  
  const handleNodeSelect = (event: SelectChangeEvent) => {
    setSelectedNode(event.target.value);
  };
  
  // Filter nodes based on selected mode and node
  const getFilteredData = () => {
    if (!networkData) return null;
    
    if (filterMode === 'all' && !selectedNode) {
      return networkData;
    }
    
    let filteredNodes = [...networkData.nodes];
    let filteredLinks = [...networkData.links];
    
    if (filterMode === 'subreddit') {
      filteredNodes = networkData.nodes.filter(node => node.type === 'subreddit');
      if (selectedNode) {
        const connectedNodeIds = networkData.links
          .filter(link => link.source === selectedNode || link.target === selectedNode)
          .map(link => link.source === selectedNode ? link.target : link.source);
        
        filteredNodes = [
          ...filteredNodes.filter(node => node.id === selectedNode),
          ...networkData.nodes.filter(node => connectedNodeIds.includes(node.id))
        ];
        
        filteredLinks = networkData.links.filter(
          link => link.source === selectedNode || link.target === selectedNode
        );
      }
    } else if (filterMode === 'author') {
      filteredNodes = networkData.nodes.filter(node => node.type === 'author');
      if (selectedNode) {
        const connectedNodeIds = networkData.links
          .filter(link => link.source === selectedNode || link.target === selectedNode)
          .map(link => link.source === selectedNode ? link.target : link.source);
        
        filteredNodes = [
          ...filteredNodes.filter(node => node.id === selectedNode),
          ...networkData.nodes.filter(node => connectedNodeIds.includes(node.id))
        ];
        
        filteredLinks = networkData.links.filter(
          link => link.source === selectedNode || link.target === selectedNode
        );
      }
    }
    
    return {
      ...networkData,
      nodes: filteredNodes,
      links: filteredLinks,
    };
  };
  
  const filteredData = getFilteredData();
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Network Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Explore the connections between subreddits and authors to understand information flow and community structures.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Network Graph
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ButtonGroup variant="outlined" size="small">
              <Button 
                onClick={() => handleViewModeChange('2d')}
                variant={viewMode === '2d' ? 'contained' : 'outlined'}
              >
                2D View
              </Button>
              <Button 
                onClick={() => handleViewModeChange('3d')}
                variant={viewMode === '3d' ? 'contained' : 'outlined'}
              >
                3D View
              </Button>
            </ButtonGroup>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="filter-mode-label">Filter By</InputLabel>
              <Select
                labelId="filter-mode-label"
                value={filterMode}
                label="Filter By"
                onChange={handleFilterModeChange}
              >
                <MenuItem value="all">All Nodes</MenuItem>
                <MenuItem value="subreddit">Subreddits</MenuItem>
                <MenuItem value="author">Authors</MenuItem>
              </Select>
            </FormControl>
            
            {filterMode !== 'all' && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="node-select-label">Select Node</InputLabel>
                <Select
                  labelId="node-select-label"
                  value={selectedNode || ''}
                  label="Select Node"
                  onChange={handleNodeSelect}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {networkData?.nodes
                    .filter(node => node.type === filterMode)
                    .map(node => (
                      <MenuItem key={node.id} value={node.id}>
                        {node.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Placeholder for network graph - in a real app, you would use a graph library */}
            <Box 
              sx={{ 
                height: 400, 
                bgcolor: 'action.hover', 
                borderRadius: 1, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                <BubbleChartIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
                Network Graph Placeholder ({viewMode} view)
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Network Metrics
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Network Density
                        </Typography>
                        <Typography variant="h5">
                          {networkData?.metrics.density.toFixed(2)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Modularity
                        </Typography>
                        <Typography variant="h5">
                          {networkData?.metrics.modularity.toFixed(2)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Communities Detected
                        </Typography>
                        <Typography variant="h5">
                          {networkData?.metrics.communities}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Connections
                        </Typography>
                        <Typography variant="h5">
                          {networkData?.metrics.avgConnections.toFixed(1)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Nodes by Connections
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {networkData?.nodes
                      .sort((a, b) => b.connections - a.connections)
                      .slice(0, 5)
                      .map((node, index) => (
                        <Box key={node.id} sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                          {node.type === 'subreddit' ? (
                            <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                          ) : (
                            <AccountCircleIcon sx={{ mr: 1, color: 'secondary.main' }} />
                          )}
                          
                          <Typography variant="body1" sx={{ minWidth: 120 }}>
                            {node.name}
                          </Typography>
                          
                          <Box sx={{ flexGrow: 1, mx: 2 }}>
                            <Box 
                              sx={{ 
                                height: 8, 
                                bgcolor: node.type === 'subreddit' ? 'primary.main' : 'secondary.main',
                                width: `${(node.connections / networkData.nodes[0].connections) * 100}%`,
                                borderRadius: 1,
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="body2">
                            {node.connections} connections
                          </Typography>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Based on the network analysis, we can observe the following patterns:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              icon={<HubIcon />} 
              label="3 distinct communities detected" 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              icon={<ForumIcon />} 
              label="r/technology is the most connected subreddit" 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              icon={<AccountCircleIcon />} 
              label="user5 is a potential influencer" 
              color="success" 
              variant="outlined" 
            />
          </Box>
          
          <Typography variant="body1">
            The network analysis reveals a moderately connected network with a density of {networkData?.metrics.density.toFixed(2)}.
            We've identified {networkData?.metrics.communities} distinct communities, with technology-focused subreddits forming
            the largest cluster. User5 appears to be a key connector between technology and science communities,
            suggesting they may be an influencer or bridge between these topics.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 