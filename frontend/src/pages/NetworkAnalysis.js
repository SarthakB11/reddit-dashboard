import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Slider,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Chip,
  Tooltip,
  useTheme,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
// Import SpriteText for 3D labels
import SpriteText from 'three-spritetext';

import { useData } from '../context/DataContext';
import { formatNumber, formatNetworkForForceGraph } from '../utils/formatters';
import SearchFilters from '../components/common/SearchFilters';

const NetworkAnalysis = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const graphRef = useRef();
  
  const { networkData, loading, errors, fetchNetworkGraphData, searchParams } = useData();
  
  const [graphType, setGraphType] = useState('2d');
  const [networkType, setNetworkType] = useState('subreddit');
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Graph configuration
  const [linkStrength, setLinkStrength] = useState(0.3);
  const [nodeCharge, setNodeCharge] = useState(-120);
  const [showLabels, setShowLabels] = useState(true);
  const [highlightConnections, setHighlightConnections] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchNode, setSearchNode] = useState('');
  
  // Graph data
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchNetworkGraphData({}, networkType);
  }, [fetchNetworkGraphData, networkType]);
  
  // Process network data when it changes
  useEffect(() => {
    if (networkData && networkData.nodes && networkData.links) {
      const processedData = formatNetworkForForceGraph(networkData);
      setGraphData(processedData);
    }
  }, [networkData]);
  
  // Handle search submission
  const handleSearch = (params) => {
    fetchNetworkGraphData(params, networkType);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue === 0) {
      setNetworkType('subreddit');
      fetchNetworkGraphData(searchParams, 'subreddit');
    } else {
      setNetworkType('author');
      fetchNetworkGraphData(searchParams, 'author');
    }
  };
  
  // Handle graph type toggle
  const handleGraphTypeToggle = () => {
    setIs3D(!is3D);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Reset graph view
  const resetCamera = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };
  
  // Zoom in
  const zoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(1.2);
    }
  };
  
  // Zoom out
  const zoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(0.8);
    }
  };
  
  // Node click handler
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    if (highlightConnections) {
      // Find connected nodes and links
      const connectedNodes = new Set();
      const connectedLinks = new Set();
      
      // Add clicked node
      connectedNodes.add(node);
      
      // Find connected links and nodes
      graphData.links.forEach(link => {
        if (link.source.id === node.id || link.target.id === node.id) {
          connectedLinks.add(link);
          connectedNodes.add(link.source.id === node.id ? link.target : link.source);
        }
      });
      
      setHighlightNodes(connectedNodes);
      setHighlightLinks(connectedLinks);
    }
  };
  
  // Background click handler
  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  };
  
  // Search for node
  const handleNodeSearch = () => {
    if (!searchNode.trim() || !graphData.nodes) return;
    
    const query = searchNode.toLowerCase();
    // Find node by ID or name
    const foundNode = graphData.nodes.find(
      node => node.id.toLowerCase().includes(query) || node.name.toLowerCase().includes(query)
    );
    
    if (foundNode) {
      handleNodeClick(foundNode);
      
      // Center on node
      if (graphRef.current) {
        graphRef.current.centerAt(foundNode.x, foundNode.y, 1000);
        setTimeout(() => {
          graphRef.current.zoom(2, 1000);
        }, 1000);
      }
    }
  };
  
  // Link width calculation
  const getLinkWidth = (link) => {
    if (highlightLinks.size > 0 && !highlightLinks.has(link)) {
      return 0.5;
    }
    return Math.sqrt(link.value) * 0.5 + 1;
  };
  
  // Node size calculation
  const getNodeSize = (node) => {
    if (highlightNodes.size > 0 && !highlightNodes.has(node)) {
      return node.val * 0.8;
    }
    if (selectedNode && selectedNode.id === node.id) {
      return node.val * 1.5;
    }
    return node.val;
  };
  
  // Node opacity calculation
  const getNodeOpacity = (node) => {
    if (highlightNodes.size > 0 && !highlightNodes.has(node)) {
      return 0.3;
    }
    return 1;
  };
  
  // Link opacity calculation
  const getLinkOpacity = (link) => {
    if (highlightLinks.size > 0 && !highlightLinks.has(link)) {
      return 0.1;
    }
    return 0.7;
  };
  
  // Generate community stats
  const communityStats = networkData && networkData.communities
    ? networkData.communities.sort((a, b) => b.size - a.size).slice(0, 5)
    : [];
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Network Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Explore the connections between {networkType === 'subreddit' ? 'subreddits' : 'authors'} to discover community structures and information flow patterns.
      </Typography>
      
      <SearchFilters onSearch={handleSearch} initialExpanded={false} />
      
      {/* Network Type Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Subreddit Network" />
          <Tab label="Author Network" />
        </Tabs>
      </Paper>
      
      {/* Loading state */}
      {loading.network && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {!loading.network && errors.network && (
        <Alert severity="error" sx={{ my: 4 }}>
          Error loading network data: {errors.network}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading.network && !errors.network && (!networkData || !networkData.nodes || networkData.nodes.length === 0) && (
        <Alert severity="info" sx={{ my: 4 }}>
          No network data available for the current filters. Try adjusting your search criteria.
        </Alert>
      )}
      
      {/* Network visualization */}
      {!loading.network && !errors.network && networkData && networkData.nodes && networkData.nodes.length > 0 && (
        <Grid container spacing={3}>
          {/* Graph controls */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Graph Controls
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Link Strength
                  </Typography>
                  <Slider
                    value={linkStrength}
                    min={0.1}
                    max={1}
                    step={0.1}
                    onChange={(e, val) => setLinkStrength(val)}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Node Charge
                  </Typography>
                  <Slider
                    value={nodeCharge}
                    min={-300}
                    max={-30}
                    step={10}
                    onChange={(e, val) => setNodeCharge(val)}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showLabels}
                        onChange={() => setShowLabels(!showLabels)}
                      />
                    }
                    label="Show Labels"
                  />
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={highlightConnections}
                        onChange={() => setHighlightConnections(!highlightConnections)}
                      />
                    }
                    label="Highlight Connections"
                  />
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={is3D}
                        onChange={handleGraphTypeToggle}
                      />
                    }
                    label="3D View"
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label={`Search ${networkType}`}
                    value={searchNode}
                    onChange={(e) => setSearchNode(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleNodeSearch}
                            edge="end"
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleNodeSearch();
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<RestartAltIcon />}
                    onClick={resetCamera}
                    fullWidth
                  >
                    Reset
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<FullscreenIcon />}
                    onClick={toggleFullscreen}
                    fullWidth
                  >
                    {isFullscreen ? 'Exit' : 'Full'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            {/* Network statistics */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Network Statistics
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nodes:
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(networkData.total_nodes || 0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Connections:
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(networkData.total_edges || 0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Density:
                    </Typography>
                    <Typography variant="h6">
                      {(networkData.density || 0).toFixed(3)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Communities:
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(networkData.connected_components || 0)}
                    </Typography>
                  </Grid>
                </Grid>
                
                {selectedNode && (
                  <Box sx={{ mt: 3, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected: <strong>{selectedNode.name}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Connections: {graphData.links.filter(link => 
                        link.source.id === selectedNode.id || link.target.id === selectedNode.id
                      ).length}
                    </Typography>
                    {networkData.nodes.find(n => n.id === selectedNode.id)?.betweenness !== undefined && (
                      <Typography variant="body2">
                        Centrality: {(networkData.nodes.find(n => n.id === selectedNode.id)?.betweenness * 100).toFixed(2)}%
                      </Typography>
                    )}
                    {networkData.nodes.find(n => n.id === selectedNode.id)?.community !== undefined && (
                      <Typography variant="body2">
                        Community: {networkData.nodes.find(n => n.id === selectedNode.id)?.community}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Graph visualization */}
          <Grid item xs={12} md={9}>
            <Paper 
              sx={{ 
                height: isFullscreen ? 'calc(100vh - 100px)' : 600,
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? '70px' : 'auto',
                left: isFullscreen ? 0 : 'auto',
                right: isFullscreen ? 0 : 'auto',
                width: isFullscreen ? '100%' : 'auto',
                zIndex: isFullscreen ? theme.zIndex.drawer + 1 : 'auto',
                overflow: 'hidden',
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
              }}
            >
              {/* Graph controls */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  zIndex: 9, 
                  display: 'flex', 
                  gap: 1,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  p: 0.5,
                  boxShadow: 2,
                }}
              >
                <Tooltip title="Zoom In">
                  <IconButton size="small" onClick={zoomIn}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton size="small" onClick={zoomOut}>
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset View">
                  <IconButton size="small" onClick={resetCamera}>
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  <IconButton size="small" onClick={toggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Graph renderer */}
              {is3D ? (
                <ForceGraph3D
                  ref={graphRef}
                  graphData={graphData}
                  nodeLabel={node => `${node.name} (${node.val})`}
                  nodeAutoColorBy="community"
                  nodeRelSize={6}
                  linkWidth={link => getLinkWidth(link)}
                  linkOpacity={0.7}
                  linkDirectionalArrowLength={3}
                  linkDirectionalArrowRelPos={1}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleSpeed={d => d.value * 0.01}
                  linkDirectionalParticleWidth={1.5}
                  nodeThreeObject={node => {
                    const sprite = new SpriteText(showLabels ? node.name : '');
                    sprite.color = node.color;
                    sprite.textHeight = 4;
                    sprite.backgroundColor = isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
                    sprite.padding = 2;
                    sprite.borderRadius = 3;
                    return sprite;
                  }}
                  onNodeClick={handleNodeClick}
                  onBackgroundClick={handleBackgroundClick}
                  cooldownTicks={100}
                />
              ) : (
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  nodeLabel={node => `${node.name} (${node.val})`}
                  nodeAutoColorBy="community"
                  nodeVal={node => getNodeSize(node)}
                  nodeOpacity={node => getNodeOpacity(node)}
                  linkWidth={link => getLinkWidth(link)}
                  linkOpacity={link => getLinkOpacity(link)}
                  linkDirectionalArrowLength={3}
                  linkDirectionalArrowRelPos={1}
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    const size = getNodeSize(node);
                    const opacity = getNodeOpacity(node);
                    
                    // Draw node circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                    ctx.fillStyle = `${node.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
                    ctx.fill();
                    
                    // Draw node border if selected
                    if (selectedNode && selectedNode.id === node.id) {
                      ctx.beginPath();
                      ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI);
                      ctx.lineWidth = 2;
                      ctx.strokeStyle = isDarkMode ? '#ffffff' : '#000000';
                      ctx.stroke();
                    }
                    
                    // Draw node label if enabled and zoom level is sufficient
                    if (showLabels && globalScale > 0.8 && opacity > 0.5) {
                      const label = node.name;
                      const fontSize = 12 / globalScale;
                      ctx.font = `${fontSize}px Sans-Serif`;
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = isDarkMode ? 'white' : 'black';
                      
                      // Background for text
                      const textWidth = ctx.measureText(label).width;
                      const padding = 2 / globalScale;
                      
                      ctx.fillStyle = isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
                      ctx.fillRect(
                        node.x - textWidth / 2 - padding,
                        node.y + size + padding,
                        textWidth + padding * 2,
                        fontSize + padding * 2
                      );
                      
                      // Draw text
                      ctx.fillStyle = isDarkMode ? 'white' : 'black';
                      ctx.fillText(label, node.x, node.y + size + fontSize / 2 + padding * 2);
                    }
                  }}
                  onNodeClick={handleNodeClick}
                  onBackgroundClick={handleBackgroundClick}
                  cooldownTicks={100}
                  linkStrength={linkStrength}
                  d3ForceStrength={0.1}
                  d3VelocityDecay={0.2}
                />
              )}
            </Paper>
            
            {/* Community structure */}
            {communityStats.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Community Structure
                  </Typography>
                  
                  <Typography variant="body2" paragraph color="text.secondary">
                    The network has {networkData.connected_components} distinct communities. The largest communities are:
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {communityStats.map((community, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Community {community.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {community.size} members
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Density: {community.density.toFixed(3)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Avg. connections: {community.avg_degree.toFixed(1)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default NetworkAnalysis;