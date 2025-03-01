'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Tabs,
  Tab,
  ButtonGroup,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  FormControlLabel,
  Switch,
  useTheme,
  Theme,
} from '@mui/material';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import HubIcon from '@mui/icons-material/Hub';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import SettingsIcon from '@mui/icons-material/Settings';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import SearchFilters component
import SearchFilters from '@/app/components/common/SearchFilters';
import { formatNumber } from '@/app/lib/formatters';

// Dynamic import for ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

// Interface for network data
interface NetworkNode {
  id: string;
  name: string;
  type: 'subreddit' | 'author';
  val: number; // Size/importance
  posts?: number;
  color?: string;
}

interface NetworkLink {
  source: string;
  target: string;
  value: number; // Link strength
  type?: string;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// Mock data for development
const generateMockNetworkData = (): NetworkData => {
  // Generate subreddits
  const subreddits = [
    { id: 'politics', name: 'r/politics', posts: 1245 },
    { id: 'worldnews', name: 'r/worldnews', posts: 985 },
    { id: 'news', name: 'r/news', posts: 876 },
    { id: 'science', name: 'r/science', posts: 654 },
    { id: 'technology', name: 'r/technology', posts: 543 },
    { id: 'askreddit', name: 'r/askreddit', posts: 432 },
    { id: 'programming', name: 'r/programming', posts: 321 },
    { id: 'webdev', name: 'r/webdev', posts: 234 },
    { id: 'datascience', name: 'r/datascience', posts: 198 },
    { id: 'machinelearning', name: 'r/machinelearning', posts: 176 },
  ];
  
  // Generate authors
  const authors = [
    { id: 'user1', name: 'user1', posts: 143 },
    { id: 'user2', name: 'user2', posts: 132 },
    { id: 'user3', name: 'user3', posts: 121 },
    { id: 'user4', name: 'user4', posts: 110 },
    { id: 'user5', name: 'user5', posts: 98 },
    { id: 'user6', name: 'user6', posts: 87 },
    { id: 'user7', name: 'user7', posts: 76 },
    { id: 'user8', name: 'user8', posts: 65 },
    { id: 'user9', name: 'user9', posts: 54 },
    { id: 'user10', name: 'user10', posts: 43 },
    { id: 'user11', name: 'user11', posts: 32 },
    { id: 'user12', name: 'user12', posts: 21 },
  ];
  
  // Generate nodes
  const nodes: NetworkNode[] = [
    ...subreddits.map(s => ({
      id: s.id,
      name: s.name,
      type: 'subreddit' as const,
      val: Math.sqrt(s.posts) / 2,
      posts: s.posts,
      color: '#1976d2',
    })),
    ...authors.map(a => ({
      id: a.id,
      name: a.name,
      type: 'author' as const,
      val: Math.sqrt(a.posts) / 2,
      posts: a.posts,
      color: '#e91e63',
    })),
  ];
  
  // Generate links - for simplicity, create connections with some randomness
  const links: NetworkLink[] = [];
  
  // Each author posts in 2-5 random subreddits
  authors.forEach(author => {
    const numSubreddits = Math.floor(Math.random() * 4) + 2; // 2-5 subreddits
    const shuffled = [...subreddits].sort(() => 0.5 - Math.random());
    const selectedSubreddits = shuffled.slice(0, numSubreddits);
    
    selectedSubreddits.forEach(subreddit => {
      const value = Math.floor(Math.random() * 15) + 1; // 1-15 connections
      links.push({
        source: author.id,
        target: subreddit.id,
        value,
        type: 'posts',
      });
    });
  });
  
  // Add subreddit-to-subreddit links (crossposts)
  for (let i = 0; i < 15; i++) {
    const sourceIndex = Math.floor(Math.random() * subreddits.length);
    let targetIndex = Math.floor(Math.random() * subreddits.length);
    
    // Make sure source and target are different
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * subreddits.length);
    }
    
    const value = Math.floor(Math.random() * 10) + 1; // 1-10 connections
    links.push({
      source: subreddits[sourceIndex].id,
      target: subreddits[targetIndex].id,
      value,
      type: 'crosspost',
    });
  }
  
  return { nodes, links };
};

// Mock data for metrics
const mockNetworkMetrics = {
  density: 0.42,
  modularity: 0.67,
  communities: 3,
  averageDegree: 4.8,
  centralNodes: [
    { id: 'politics', name: 'r/politics', type: 'subreddit', degree: 15 },
    { id: 'worldnews', name: 'r/worldnews', type: 'subreddit', degree: 12 },
    { id: 'user1', name: 'user1', type: 'author', degree: 10 },
  ],
};

export default function NetworkAnalysis() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Refs for the graph instances
  const graphRef2D = useRef<any>();
  const graphRef3D = useRef<any>();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  
  // UI state
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [nodeSize, setNodeSize] = useState<number>(1);
  const [linkWidth, setLinkWidth] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'subreddit' | 'author'>('all');
  
  // Get search parameters from URL
  const getSearchParamsObject = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  // Fetch network data based on search params
  useEffect(() => {
    const fetchNetworkData = async () => {
      setLoading(true);
      setError(null);
      
      const params = getSearchParamsObject();
      
      try {
        // For demo purposes, use mock data with a delay
        setTimeout(() => {
          const data = generateMockNetworkData();
          setNetworkData(data);
          setMetrics(mockNetworkMetrics);
          setLoading(false);
        }, 1000);
        
        // In production, fetch from API:
        // const response = await fetchNetworkData(params);
        // setNetworkData(response.data);
        // setMetrics(response.metrics);
      } catch (err) {
        console.error('Error fetching network data:', err);
        setError('Failed to fetch network data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetworkData();
  }, [searchParams]);
  
  // Handle search submission
  const handleSearch = (params: any) => {
    // Create URL search params
    const urlParams = new URLSearchParams();
    
    // Add non-empty params to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, String(value));
      }
    });
    
    // Navigate with new search params
    router.push(`/network?${urlParams.toString()}`);
  };
  
  // Handle node click
  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
    
    // Focus on the node
    if (view === '2d' && graphRef2D.current) {
      graphRef2D.current.centerAt(node.x, node.y, 1000);
      graphRef2D.current.zoom(2, 1000);
    } else if (view === '3d' && graphRef3D.current) {
      graphRef3D.current.centerAt(node.x, node.y, node.z, 1000);
      graphRef3D.current.zoom(2, 1000);
    }
  };
  
  // Handle view change
  const handleViewChange = (newView: '2d' | '3d') => {
    setView(newView);
  };
  
  // Handle filter mode change
  const handleFilterModeChange = (_event: React.SyntheticEvent, newValue: number) => {
    const modes = ['all', 'subreddit', 'author'];
    setFilterMode(modes[newValue] as 'all' | 'subreddit' | 'author');
  };
  
  // Filter data based on current filter mode
  const getFilteredData = () => {
    if (!networkData) return null;
    if (filterMode === 'all') return networkData;
    
    const filteredNodes = networkData.nodes.filter(node => 
      filterMode === 'all' || node.type === filterMode
    );
    
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    
    const filteredLinks = networkData.links.filter(link => 
      filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string)
    );
    
    return { nodes: filteredNodes, links: filteredLinks };
  };
  
  // Prepare color scheme for nodes
  const getNodeColor = (node: NetworkNode) => {
    if (selectedNode && node.id === selectedNode.id) {
      return theme.palette.warning.main;
    }
    
    if (node.type === 'subreddit') {
      return theme.palette.primary.main;
    }
    
    return theme.palette.secondary.main;
  };
  
  // Handle zoom in/out
  const handleZoomIn = () => {
    if (view === '2d' && graphRef2D.current) {
      const currentZoom = graphRef2D.current.zoom();
      graphRef2D.current.zoom(currentZoom * 1.2, 400);
    } else if (view === '3d' && graphRef3D.current) {
      const currentZoom = graphRef3D.current.controls().object.zoom;
      graphRef3D.current.controls().object.zoom = currentZoom * 1.2;
      graphRef3D.current.controls().update();
    }
  };
  
  const handleZoomOut = () => {
    if (view === '2d' && graphRef2D.current) {
      const currentZoom = graphRef2D.current.zoom();
      graphRef2D.current.zoom(currentZoom / 1.2, 400);
    } else if (view === '3d' && graphRef3D.current) {
      const currentZoom = graphRef3D.current.controls().object.zoom;
      graphRef3D.current.controls().object.zoom = currentZoom / 1.2;
      graphRef3D.current.controls().update();
    }
  };
  
  const filteredData = getFilteredData();
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Network Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Visualize connections between subreddits and authors to discover community structures and influential nodes.
      </Typography>
      
      <SearchFilters 
        onSearch={handleSearch} 
        defaultValues={getSearchParamsObject()}
      />
      
      {/* Main content */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Network graph */}
        <Grid item xs={12} md={selectedNode ? 8 : 12}>
          <Paper sx={{ p: 3 }}>
            {/* Loading state */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            )}
            
            {/* Error state */}
            {!loading && error && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            )}
            
            {/* Chart view with controls */}
            {!loading && !error && filteredData && (
              <>
                {/* View switching and controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <ButtonGroup size="small" aria-label="Graph view">
                    <Button 
                      variant={view === '2d' ? 'contained' : 'outlined'} 
                      onClick={() => handleViewChange('2d')}
                      startIcon={<NetworkCheckIcon />}
                    >
                      2D View
                    </Button>
                    <Button 
                      variant={view === '3d' ? 'contained' : 'outlined'} 
                      onClick={() => handleViewChange('3d')}
                      startIcon={<DeviceHubIcon />}
                    >
                      3D View
                    </Button>
                  </ButtonGroup>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleZoomIn}
                      startIcon={<ZoomInIcon />}
                    >
                      Zoom In
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleZoomOut}
                      startIcon={<ZoomOutIcon />}
                    >
                      Zoom Out
                    </Button>
                  </Box>
                </Box>
                
                {/* Filter tabs */}
                <Tabs 
                  value={filterMode === 'all' ? 0 : filterMode === 'subreddit' ? 1 : 2} 
                  onChange={handleFilterModeChange} 
                  aria-label="network filter tabs"
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                  <Tab icon={<HubIcon />} label="All Nodes" />
                  <Tab icon={<ForumIcon />} label="Subreddits Only" />
                  <Tab icon={<PersonIcon />} label="Authors Only" />
                </Tabs>
                
                {/* Additional controls */}
                <Box sx={{ display: 'flex', mb: 2, gap: 4 }}>
                  <Box sx={{ width: 200 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Node Size
                    </Typography>
                    <Slider
                      value={nodeSize}
                      min={0.5}
                      max={3}
                      step={0.1}
                      onChange={(_e, value) => setNodeSize(value as number)}
                      aria-labelledby="node-size-slider"
                    />
                  </Box>
                  
                  <Box sx={{ width: 200 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Link Width
                    </Typography>
                    <Slider
                      value={linkWidth}
                      min={0.1}
                      max={3}
                      step={0.1}
                      onChange={(_e, value) => setLinkWidth(value as number)}
                      aria-labelledby="link-width-slider"
                    />
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showLabels}
                        onChange={e => setShowLabels(e.target.checked)}
                        name="showLabels"
                        color="primary"
                      />
                    }
                    label="Show Labels"
                  />
                </Box>
                
                {/* Graph container */}
                <Box 
                  className="force-graph-container"
                  sx={{ 
                    height: 600, 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    position: 'relative',
                    '& canvas': {
                      borderRadius: '4px',
                    },
                  }}
                >
                  {view === '2d' ? (
                    <ForceGraph2D
                      ref={graphRef2D}
                      graphData={filteredData}
                      nodeId="id"
                      nodeLabel={node => `${node.name} (${formatNumber(node.posts || 0)} posts)`}
                      nodeVal={node => (node.val || 1) * nodeSize}
                      nodeColor={getNodeColor}
                      linkWidth={link => (link.value || 1) * linkWidth / 5}
                      nodeCanvasObjectMode={() => showLabels ? 'after' : undefined}
                      nodeCanvasObject={(node, ctx, globalScale) => {
                        if (!showLabels) return;
                        
                        const label = node.name;
                        const fontSize = 12/globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
                        ctx.fillText(label, node.x || 0, (node.y || 0) + (node.val || 5) + fontSize);
                      }}
                      cooldownTicks={100}
                      onNodeClick={handleNodeClick}
                      backgroundColor={isDarkMode ? '#1a1a1a' : '#f5f5f5'}
                    />
                  ) : (
                    <ForceGraph3D
                      ref={graphRef3D}
                      graphData={filteredData}
                      nodeId="id"
                      nodeLabel={node => `${node.name} (${formatNumber(node.posts || 0)} posts)`}
                      nodeVal={node => (node.val || 1) * nodeSize}
                      nodeColor={getNodeColor}
                      linkWidth={link => (link.value || 1) * linkWidth / 10}
                      nodeOpacity={0.9}
                      linkOpacity={0.6}
                      backgroundColor={isDarkMode ? '#1a1a1a' : '#f5f5f5'}
                      showNavInfo={false}
                      onNodeClick={handleNodeClick}
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    <span style={{ color: theme.palette.primary.main }}>●</span> Subreddit
                    &nbsp;&nbsp;&nbsp;
                    <span style={{ color: theme.palette.secondary.main }}>●</span> Author
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Nodes: {filteredData.nodes.length} • Links: {filteredData.links.length}
                  </Typography>
                </Box>
              </>
            )}
            
            {/* Empty state */}
            {!loading && !error && (!filteredData || filteredData.nodes.length === 0) && (
              <Alert severity="info" sx={{ my: 4 }}>
                No network data available for the current filters. Try adjusting your search criteria.
              </Alert>
            )}
          </Paper>
        </Grid>
        
        {/* Selected node details and metrics */}
        {selectedNode && (
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedNode.name}
                </Typography>
                
                <Chip 
                  icon={selectedNode.type === 'subreddit' ? <ForumIcon /> : <PersonIcon />}
                  label={selectedNode.type === 'subreddit' ? 'Subreddit' : 'Author'}
                  size="small"
                  color={selectedNode.type === 'subreddit' ? 'primary' : 'secondary'}
                  sx={{ mb: 2 }}
                />
                
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Posts" 
                      secondary={formatNumber(selectedNode.posts || 0)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Connections" 
                      secondary={formatNumber(
                        filteredData?.links.filter(link => 
                          link.source === selectedNode.id || 
                          link.target === selectedNode.id
                        ).length || 0
                      )} 
                    />
                  </ListItem>
                </List>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  component={Link}
                  href={`/${selectedNode.type === 'subreddit' ? 'subreddit' : 'author'}?name=${selectedNode.id}`}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
            
            {/* Network metrics */}
            {metrics && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Network Metrics
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <HubIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Network Density" 
                        secondary={`${(metrics.density * 100).toFixed(1)}%`} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <DeviceHubIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Modularity" 
                        secondary={metrics.modularity.toFixed(2)} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <SettingsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Communities Detected" 
                        secondary={metrics.communities} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <NetworkCheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Average Connections" 
                        secondary={metrics.averageDegree.toFixed(1)} 
                      />
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Central Nodes
                  </Typography>
                  
                  {metrics.centralNodes.map((node: any, index: number) => (
                    <Chip
                      key={index}
                      label={`${node.name} (${node.degree})`}
                      icon={node.type === 'subreddit' ? <ForumIcon /> : <PersonIcon />}
                      size="small"
                      color={node.type === 'subreddit' ? 'primary' : 'secondary'}
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                      onClick={() => {
                        const fullNode = filteredData?.nodes.find(n => n.id === node.id);
                        if (fullNode) handleNodeClick(fullNode);
                      }}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 