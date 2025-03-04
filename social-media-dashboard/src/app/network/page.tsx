'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import dynamic from 'next/dynamic';
import { API_ENDPOINTS, API_TIMEOUTS, handleApiError } from '../config/api';

// Dynamically import ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <CircularProgress />
    </Box>
  )
});

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

// Add NetworkGraph component
interface NetworkNodeExtended extends NetworkNode {
  val?: number;
  color?: string;
  x?: number;
  y?: number;
}

interface ForceGraphData {
  nodes: NetworkNodeExtended[];
  links: NetworkLink[];
}

// Custom component to display API connection status
const ApiStatus = ({ status }: { status: 'connected' | 'disconnected' | 'loading' }) => {
  let icon = null;
  let text = '';
  let color = '';
  let bgColor = '';

  switch (status) {
    case 'connected':
      icon = <CheckCircleIcon fontSize="small" />;
      text = 'API Connected';
      color = 'success.main';
      bgColor = 'success.light';
      break;
    case 'disconnected':
      icon = <CloudOffIcon fontSize="small" />;
      text = 'API Disconnected';
      color = 'error.main';
      bgColor = 'error.light';
      break;
    case 'loading':
      icon = <CircularProgress size={16} />;
      text = 'Checking API...';
      color = 'info.main';
      bgColor = 'info.light';
      break;
  }

  return (
    <Chip
      icon={icon}
      label={text}
      sx={{ 
        color,
        bgcolor: bgColor,
        fontWeight: status === 'disconnected' ? 'bold' : 'normal',
        '& .MuiChip-icon': { color }
      }}
      size="small"
    />
  );
};

// Enhance NetworkGraph component to improve visualization
const NetworkGraph = ({ data, viewMode }: { data: NetworkData, viewMode: '2d' | '3d' }) => {
  const graphRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<ForceGraphData>({ nodes: [], links: [] });
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (data) {
      // Transform data for visualization with improved styling
      const transformedData: ForceGraphData = {
        nodes: data.nodes.map(node => ({
          ...node,
          // Adjust node size based on post count for better visualization
          val: Math.max(3, Math.sqrt(node.posts || 1) * 1.5), 
          // Different colors for subreddits vs authors with opacity based on connections
          color: node.type === 'subreddit' 
            ? `rgba(255, 99, 71, ${Math.min(0.7 + (node.connections / Math.max(...data.nodes.map(n => n.connections)) * 0.3), 1)})`  // Tomato red with dynamic opacity
            : `rgba(70, 130, 180, ${Math.min(0.7 + (node.connections / Math.max(...data.nodes.map(n => n.connections)) * 0.3), 1)})` // Steel blue with dynamic opacity
        })),
        links: data.links.map(link => ({
          ...link,
          // Dynamic link coloring based on value
          color: `rgba(150, 150, 150, ${Math.min(0.2 + (link.value / Math.max(...data.links.map(l => l.value)) * 0.8), 0.8)})`
        }))
      };
      setGraphData(transformedData);
      
      // Reset zoom when data changes
      if (graphRef.current) {
        setTimeout(() => {
          graphRef.current.zoomToFit(400, 50); // Add more padding
        }, 500);
      }
    }
  }, [data]);

  const handleNodeClick = (node: NetworkNodeExtended) => {
    if (graphRef.current && node.x !== undefined && node.y !== undefined) {
      // Zoom in on the clicked node
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(4, 1000);
    }
  };
  
  // Return early if not mounted (client-side only rendering)
  if (!mounted) {
    return (
      <Box sx={{ 
        height: 500, 
        width: '100%', 
        border: '1px solid #eee', 
        borderRadius: 1, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.paper'
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      height: 500, 
      width: '100%', 
      border: '1px solid #eee', 
      borderRadius: 1, 
      overflow: 'hidden',
      bgcolor: 'transparent' // Transparent to work with light/dark themes
    }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={(node) => {
          const n = node as NetworkNodeExtended;
          return `${n.name} (${n.type})\nPosts: ${n.posts}\nConnections: ${n.connections}\nConnection Rank: ${
            data.nodes.sort((a, b) => b.connections - a.connections)
              .findIndex(item => item.id === n.id) + 1
          }`;
        }}
        linkLabel={(link) => {
          const l = link as NetworkLink;
          const sourceNode = data.nodes.find(n => n.id === l.source);
          const targetNode = data.nodes.find(n => n.id === l.target);
          return `${sourceNode?.name || l.source} → ${targetNode?.name || l.target}\nWeight: ${l.value}\nStrength Rank: ${
            data.links.sort((a, b) => b.value - a.value)
              .findIndex(item => item.source === l.source && item.target === l.target) + 1
          }`;
        }}
        nodeRelSize={6}
        linkWidth={(link) => Math.sqrt(Math.max(1, (link as NetworkLink).value) * 0.2)}
        linkDirectionalParticles={5} // More particles for better visualization
        linkDirectionalParticleSpeed={(link) => Math.min(0.01, 0.001 + 0.01 * (link as NetworkLink).value / Math.max(...data.links.map(l => l.value)))} // Dynamic speed based on link value
        linkDirectionalParticleWidth={(link) => Math.sqrt(Math.max(1, (link as NetworkLink).value) * 0.2)}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Add text labels for important nodes (top 3 by connections)
          const n = node as NetworkNodeExtended;
          const rank = data.nodes.sort((a, b) => b.connections - a.connections)
              .findIndex(item => item.id === n.id) + 1;
              
          if (rank <= 3) { // Only add labels to top 3 nodes
            const label = n.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(
              n.x! - ctx.measureText(label).width/2 - 2,
              n.y! - fontSize/2 - 2,
              ctx.measureText(label).width + 4,
              fontSize + 4
            );
            ctx.fillStyle = n.type === 'subreddit' ? 'darkred' : 'darkblue';
            ctx.fillText(label, n.x!, n.y!);
          }
        }}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        d3AlphaDecay={0.015} // Improved for better stabilization
        d3VelocityDecay={0.25} // Improved for better movement
        width={800}
        height={500}
        backgroundColor="rgba(0,0,0,0)" // Transparent background to match theme
      />
    </Box>
  );
};

export default function NetworkAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [filterMode, setFilterMode] = useState<'all' | 'subreddit' | 'author'>('all');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [networkType, setNetworkType] = useState<'subreddit' | 'author'>('subreddit');
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [usingSampleData, setUsingSampleData] = useState(false);
  
  const checkApiConnection = async () => {
    try {
      const healthCheck = await fetch(API_ENDPOINTS.HEALTH, { 
        signal: AbortSignal.timeout(API_TIMEOUTS.HEALTH_CHECK)
      }).then(res => res.ok).catch(() => false);

      if (!healthCheck) {
        setApiStatus('disconnected');
        throw new Error('API server is not available');
      }

      setApiStatus('connected');
      return true;
    } catch (err) {
      setApiStatus('disconnected');
      return false;
    }
  };

  const fetchNetworkData = async (type: 'subreddit' | 'author', searchKeyword: string = '') => {
    setLoading(true);
    setError(null);
    setUsingSampleData(false);

    try {
      const isHealthy = await checkApiConnection();
      if (!isHealthy) {
        throw new Error('API server is not available');
      }

      const url = new URL(API_ENDPOINTS.NETWORK);
      url.searchParams.append('type', type);
      if (searchKeyword) {
        url.searchParams.append('keyword', searchKeyword);
      }

      const response = await fetch(url.toString(), { 
        signal: AbortSignal.timeout(API_TIMEOUTS.DEFAULT)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.nodes || data.nodes.length === 0) {
        setError(`No network data found for ${type === 'subreddit' ? 'subreddits' : 'authors'}${searchKeyword ? ` matching "${searchKeyword}"` : ''}.`);
        const mockData = generateMockNetworkData();
        setNetworkData(mockData);
        setUsingSampleData(true);
      } else {
        setApiStatus('connected');
        setNetworkData(data);
      }
    } catch (err: any) {
      console.error('Error fetching network data:', err);
      setError(handleApiError(err));
      setApiStatus('disconnected');
      
      const mockData = generateMockNetworkData();
      setNetworkData(mockData);
      setUsingSampleData(true);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNetworkData(networkType, keyword);
  }, [networkType, keyword]);
  
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
  
  const handleNetworkTypeChange = (event: SelectChangeEvent) => {
    setNetworkType(event.target.value as 'subreddit' | 'author');
  };
  
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };
  
  const handleSearch = () => {
    fetchNetworkData(networkType, keyword);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Network Analysis
        </Typography>
        <ApiStatus status={apiStatus} />
      </Box>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Explore the connections between subreddits and authors to understand information flow and community structures.
        {usingSampleData && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
            <Chip 
              icon={<WarningIcon />} 
              label="Using sample data" 
              color="warning" 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
            {apiStatus === 'connected' && (
              <Button 
                size="small" 
                variant="text" 
                color="primary" 
                onClick={() => fetchNetworkData(networkType, keyword)}
                startIcon={<CheckCircleIcon fontSize="small" />}
                sx={{ ml: 1 }}
              >
                Try again with real data
              </Button>
            )}
          </Box>
        )}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="network-type-label">Network Type</InputLabel>
            <Select
              labelId="network-type-label"
              value={networkType}
              label="Network Type"
              onChange={handleNetworkTypeChange}
            >
              <MenuItem value="subreddit">Subreddit Network</MenuItem>
              <MenuItem value="author">Author Network</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Search Keyword"
            variant="outlined"
            value={keyword}
            onChange={handleKeywordChange}
            sx={{ flexGrow: 1 }}
            placeholder={`Search in ${networkType === 'subreddit' ? 'subreddit' : 'author'} network...`}
            InputProps={{
              endAdornment: keyword ? (
                <Button 
                  size="small" 
                  variant="text" 
                  onClick={() => setKeyword('')}
                  sx={{ minWidth: 'auto' }}
                >
                  Clear
                </Button>
              ) : null
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSearch}
            startIcon={<BubbleChartIcon />}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>
      </Paper>
      
      {error && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: 'error.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            <Typography color="error.dark">{error}</Typography>
          </Box>
        </Paper>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Network Graph
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ButtonGroup variant="outlined" size="small">
              <Button 
                onClick={() => handleViewModeChange('2d')}
                variant="contained"
              >
                2D View
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : filteredData ? (
          <>
            <NetworkGraph data={filteredData} viewMode={viewMode} />
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
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
                          {filteredData?.metrics.density.toFixed(2)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Modularity
                        </Typography>
                        <Typography variant="h5">
                          {filteredData?.metrics.modularity.toFixed(2)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Communities Detected
                        </Typography>
                        <Typography variant="h5">
                          {filteredData?.metrics.communities}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Connections
                        </Typography>
                        <Typography variant="h5">
                          {filteredData?.metrics.avgConnections.toFixed(1)}
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
                    
                    {filteredData?.nodes
                      .sort((a, b) => b.connections - a.connections)
                      .slice(0, 5)
                      .map((node) => (
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
                                width: `${(node.connections * 20)}%`,
                                maxWidth: '100%',
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
          </>
        ) : (
          <Box sx={{ 
            height: 400, 
            bgcolor: 'action.hover', 
            borderRadius: 1, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}>
            <Typography variant="body1" color="text.secondary">
              <BubbleChartIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
              No data available
            </Typography>
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
            {networkData && (
              <>
                <Chip 
                  icon={<HubIcon />} 
                  label={`${networkData.metrics.communities} ${networkData.metrics.communities === 1 ? 'community' : 'communities'} detected`} 
                  color="primary" 
                  variant="outlined" 
                />
                
                {networkData.nodes.length > 0 && (
                  <>
                    {/* Most connected node */}
                    {(() => {
                      const topNode = [...networkData.nodes].sort((a, b) => b.connections - a.connections)[0];
                      return (
                        <Chip 
                          icon={topNode.type === 'subreddit' ? <ForumIcon /> : <AccountCircleIcon />} 
                          label={`${topNode.name} is the most connected ${topNode.type}`} 
                          color="secondary" 
                          variant="outlined" 
                        />
                      );
                    })()}
                    
                    {/* Node with most posts */}
                    {(() => {
                      const topPostNode = [...networkData.nodes].sort((a, b) => b.posts - a.posts)[0];
                      return (
                        <Chip 
                          icon={topPostNode.type === 'subreddit' ? <ForumIcon /> : <AccountCircleIcon />} 
                          label={`${topPostNode.name} has the most posts (${topPostNode.posts})`} 
                          color="success" 
                          variant="outlined" 
                        />
                      );
                    })()}
                  </>
                )}
              </>
            )}
          </Box>
          
          <Typography variant="body1">
            {networkData ? (
              <>
                The network analysis reveals a {
                  networkData.metrics.density < 0.3 ? 'sparsely' : 
                  networkData.metrics.density < 0.6 ? 'moderately' : 'densely'
                } connected network with a density of {networkData.metrics.density.toFixed(2)}.
                
                {networkData.metrics.communities > 0 && (
                  <> We've identified {networkData.metrics.communities} distinct {networkData.metrics.communities === 1 ? 'community' : 'communities'}. </>
                )}
                
                {networkData.nodes.length > 0 && networkData.links.length > 0 && (() => {
                  // Find most connected nodes by type
                  const topSubreddits = networkData.nodes
                    .filter(node => node.type === 'subreddit')
                    .sort((a, b) => b.connections - a.connections);
                    
                  const topAuthors = networkData.nodes
                    .filter(node => node.type === 'author')
                    .sort((a, b) => b.connections - a.connections);
                  
                  // Find strongest connection
                  const strongestLink = [...networkData.links].sort((a, b) => b.value - a.value)[0];
                  const sourceNode = networkData.nodes.find(n => n.id === strongestLink?.source);
                  const targetNode = networkData.nodes.find(n => n.id === strongestLink?.target);
                  
                  return (
                    <>
                      {topSubreddits.length > 0 && (
                        <> 
                          {topSubreddits[0].name} is the most connected subreddit with {topSubreddits[0].connections} connections
                          {topSubreddits.length > 1 ? `, followed by ${topSubreddits[1].name}` : ''}.
                        </>
                      )}
                      
                      {topAuthors.length > 0 && (
                        <> 
                          {' '}{topAuthors[0].name} appears to be a key contributor with {topAuthors[0].connections} connections
                          {topAuthors[0].posts > 0 ? ` and ${topAuthors[0].posts} posts` : ''}.
                        </>
                      )}
                      
                      {sourceNode && targetNode && (
                        <>
                          {' '}The strongest connection is between {sourceNode.name} and {targetNode.name} 
                          with a connection strength of {strongestLink.value}.
                        </>
                      )}
                    </>
                  );
                })()}
              </>
            ) : 'No network data available for analysis.'}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 