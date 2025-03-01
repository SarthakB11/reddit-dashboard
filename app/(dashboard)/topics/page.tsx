'use client';

import React, { useEffect, useState } from 'react';
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
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CloudIcon from '@mui/icons-material/Cloud';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableChartIcon from '@mui/icons-material/TableChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import SearchFilters component
import SearchFilters from '@/app/components/common/SearchFilters';
import { formatNumber, formatPercent } from '@/app/lib/formatters';

// Dynamic imports to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
const ReactWordcloud = dynamic(() => import('react-wordcloud'), { ssr: false });

// Types for topic data
interface TopicWord {
  text: string;
  value: number;
}

interface Topic {
  id: number;
  label: string;
  words: string[];
  wordWeights: number[];
  prevalence: number;
  postCount: number;
  wordCloudData: TopicWord[];
  topPosts: {
    title: string;
    author: string;
    subreddit: string;
    score: number;
  }[];
}

interface TopicModelData {
  topics: Topic[];
  documentCount: number;
  topTerms: string[];
  coherenceScore: number;
  perplexityScore: number;
}

// Sample data generation for demo
const generateMockTopicData = (): TopicModelData => {
  // Create 5 topics with different themes
  const topicThemes = [
    {
      name: 'Technology & AI',
      words: ['technology', 'ai', 'intelligence', 'artificial', 'learning', 'machine', 'data', 'model', 'computer', 'algorithm', 'neural', 'system', 'network', 'digital', 'science'],
      color: '#1976d2',
    },
    {
      name: 'Politics & Governance',
      words: ['government', 'political', 'policy', 'election', 'democracy', 'president', 'vote', 'law', 'congress', 'campaign', 'candidate', 'amendment', 'senate', 'legislation', 'rights'],
      color: '#d32f2f',
    },
    {
      name: 'Climate & Environment',
      words: ['climate', 'environment', 'carbon', 'green', 'sustainability', 'renewable', 'emissions', 'energy', 'pollution', 'earth', 'global', 'warming', 'change', 'solar', 'sustainable'],
      color: '#388e3c',
    },
    {
      name: 'Health & Wellness',
      words: ['health', 'medical', 'vaccine', 'healthcare', 'hospital', 'doctor', 'patient', 'treatment', 'disease', 'mental', 'wellness', 'medicine', 'therapy', 'brain', 'research'],
      color: '#7b1fa2',
    },
    {
      name: 'Entertainment & Media',
      words: ['movie', 'show', 'film', 'actor', 'series', 'music', 'game', 'character', 'play', 'entertainment', 'director', 'streaming', 'television', 'scene', 'studio'],
      color: '#f57c00',
    },
  ];

  // Generate topics with different prevalence
  const topics: Topic[] = topicThemes.map((theme, index) => {
    // Create a distribution of word weights - first words are more important
    const wordWeights = theme.words.map((_, i) => 
      Math.max(0.05, 1 - (i * (0.8 / theme.words.length)))
    );
    
    // Normalize weights to sum to 1
    const sum = wordWeights.reduce((a, b) => a + b, 0);
    const normalizedWeights = wordWeights.map(w => w / sum);
    
    // Generate word cloud data
    const wordCloudData = theme.words.map((word, i) => ({
      text: word,
      value: Math.round(normalizedWeights[i] * 100),
    }));
    
    // Create sample posts
    const topPosts = [
      {
        title: `New study shows advancements in ${theme.words[0]} and ${theme.words[2]}`,
        author: `expert_${theme.words[0]}`,
        subreddit: theme.words[0],
        score: Math.floor(Math.random() * 2000) + 500,
      },
      {
        title: `Discussion: The future of ${theme.words[1]} and its impact on society`,
        author: `${theme.words[1]}_enthusiast`,
        subreddit: 'AskReddit',
        score: Math.floor(Math.random() * 1500) + 300,
      },
      {
        title: `${theme.words[3]} and ${theme.words[4]}: A comprehensive analysis`,
        author: `${theme.words[3]}_researcher`,
        subreddit: 'science',
        score: Math.floor(Math.random() * 1000) + 200,
      },
    ];
    
    // Create topic with decreasing prevalence
    return {
      id: index,
      label: theme.name,
      words: theme.words,
      wordWeights: normalizedWeights,
      prevalence: 0.35 - (index * 0.05), // Decreasing prevalence
      postCount: Math.floor(Math.random() * 500) + 100,
      wordCloudData,
      topPosts,
    };
  });
  
  // Extract top terms across all topics
  const allWords = topics.flatMap(topic => topic.words.slice(0, 5));
  const uniqueTopTerms = Array.from(new Set(allWords)).slice(0, 20);
  
  return {
    topics,
    documentCount: 12500,
    topTerms: uniqueTopTerms,
    coherenceScore: 0.65 + (Math.random() * 0.1),
    perplexityScore: 35 + (Math.random() * 10),
  };
};

export default function TopicModeling() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicData, setTopicData] = useState<TopicModelData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // UI state
  const [numTopics, setNumTopics] = useState(5);
  const [viewMode, setViewMode] = useState<string>('cards');
  const [tabValue, setTabValue] = useState(0);
  
  // Get search parameters from URL
  const getSearchParamsObject = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  // Fetch topic data based on search params
  useEffect(() => {
    const fetchTopicData = async () => {
      setLoading(true);
      setError(null);
      
      const params = getSearchParamsObject();
      
      try {
        // For demo purposes, use mock data with a delay
        setTimeout(() => {
          const data = generateMockTopicData();
          setTopicData(data);
          setSelectedTopic(data.topics[0]); // Select first topic by default
          setLoading(false);
        }, 1000);
        
        // In production, fetch from API:
        // const response = await fetchTopicModeling({ ...params, num_topics: numTopics });
        // setTopicData(response);
      } catch (err) {
        console.error('Error fetching topic data:', err);
        setError('Failed to fetch topic modeling data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopicData();
  }, [searchParams, numTopics]);
  
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
    router.push(`/topics?${urlParams.toString()}`);
  };
  
  // Handle topics count change
  const handleNumTopicsChange = (_event: Event, value: number | number[]) => {
    setNumTopics(value as number);
  };
  
  // Handle view mode change
  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Handle topic selection
  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic === selectedTopic ? null : topic);
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Prepare data for topic distribution chart
  const getTopicDistributionData = () => {
    if (!topicData || !topicData.topics) return null;
    
    return {
      x: topicData.topics.map(topic => topic.label),
      y: topicData.topics.map(topic => topic.prevalence * 100), // Convert to percentage
      type: 'bar',
      marker: {
        color: topicData.topics.map((topic, index) => 
          selectedTopic && topic.id === selectedTopic.id
            ? theme.palette.primary.main
            : `hsl(${(index * 137) % 360}, 70%, ${isDarkMode ? '60%' : '45%'})`
        ),
      },
    };
  };
  
  // Prepare data for topic similarity/relation chart
  const getTopicRelationData = () => {
    if (!topicData || !topicData.topics || topicData.topics.length < 2) return null;
    
    // Create a simple 2D projection for topics based on word overlaps
    const nodes = topicData.topics.map(topic => ({
      x: Math.cos(topic.id * (2 * Math.PI / topicData.topics.length)) * (topic.prevalence * 10 + 1),
      y: Math.sin(topic.id * (2 * Math.PI / topicData.topics.length)) * (topic.prevalence * 10 + 1),
      size: topic.prevalence * 50 + 10,
      color: selectedTopic && topic.id === selectedTopic.id
        ? theme.palette.primary.main
        : `hsl(${(topic.id * 137) % 360}, 70%, ${isDarkMode ? '60%' : '45%'})`,
      name: topic.label,
      topic: topic,
    }));
    
    // Calculate edges based on shared words
    const edges = [];
    for (let i = 0; i < topicData.topics.length; i++) {
      for (let j = i + 1; j < topicData.topics.length; j++) {
        const topic1 = topicData.topics[i];
        const topic2 = topicData.topics[j];
        
        // Count shared words
        const sharedWords = topic1.words.filter(word => topic2.words.includes(word));
        
        if (sharedWords.length > 0) {
          edges.push({
            x0: nodes[i].x,
            y0: nodes[i].y,
            x1: nodes[j].x,
            y1: nodes[j].y,
            width: sharedWords.length,
            color: `rgba(150, 150, 150, ${sharedWords.length / 10})`,
          });
        }
      }
    }
    
    return {
      nodes,
      edges,
    };
  };
  
  // Wordcloud options
  const wordCloudOptions = {
    colors: [
      '#1976d2', // primary
      '#9c27b0', // purple
      '#2196f3', // blue
      '#00bcd4', // cyan
      '#009688', // teal
      '#4caf50', // green
      '#8bc34a', // light green
      '#ffeb3b', // yellow
      '#ff9800', // orange
      '#f44336', // red
    ],
    enableTooltip: true,
    deterministic: true,
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontSizes: [12, 50],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90],
    scale: 'sqrt',
    spiral: 'rectangular',
    transitionDuration: 500,
  };
  
  // Get layout configuration for topic distribution plot
  const getTopicDistributionLayout = () => {
    return {
      autosize: true,
      margin: { l: 50, r: 30, t: 30, b: 100 },
      height: 400,
      xaxis: {
        title: { text: 'Topic' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        tickangle: -45,
      },
      yaxis: {
        title: { text: 'Prevalence (%)' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDarkMode ? '#e0e0e0' : '#333333',
      },
      hovermode: 'closest',
    };
  };
  
  // Get layout configuration for topic relation plot
  const getTopicRelationLayout = () => {
    return {
      autosize: true,
      margin: { l: 30, r: 30, t: 30, b: 30 },
      height: 450,
      showlegend: false,
      xaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      hovermode: 'closest',
    };
  };
  
  // Render topic relation plot
  const renderTopicRelationPlot = () => {
    const relationData = getTopicRelationData();
    if (!relationData) return null;
    
    const { nodes, edges } = relationData;
    
    // Create edges as lines
    const edgeTraces = edges.map((edge, i) => ({
      type: 'scatter',
      mode: 'lines',
      x: [edge.x0, edge.x1],
      y: [edge.y0, edge.y1],
      line: {
        width: edge.width,
        color: edge.color,
      },
      hoverinfo: 'none',
      showlegend: false,
    }));
    
    // Create nodes as scatter points
    const nodeTrace = {
      type: 'scatter',
      mode: 'markers+text',
      x: nodes.map(node => node.x),
      y: nodes.map(node => node.y),
      text: nodes.map(node => node.name),
      textposition: 'bottom center',
      textfont: {
        family: 'Inter, sans-serif',
        size: 12,
        color: isDarkMode ? '#e0e0e0' : '#333333',
      },
      marker: {
        size: nodes.map(node => node.size),
        color: nodes.map(node => node.color),
        line: {
          width: 2,
          color: isDarkMode ? '#333333' : '#ffffff',
        },
      },
      hoverinfo: 'text',
      hovertext: nodes.map(node => 
        `${node.name}<br>Prevalence: ${(node.topic.prevalence * 100).toFixed(1)}%<br>Posts: ${node.topic.postCount}`
      ),
    };
    
    // Combine edge and node traces
    const data = [...edgeTraces, nodeTrace];
    
    return (
      <Plot
        data={data}
        layout={getTopicRelationLayout()}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
        onClick={(data) => {
          if (data.points && data.points.length > 0 && data.points[0].curveNumber === edgeTraces.length) {
            const pointIndex = data.points[0].pointIndex;
            const clickedTopic = topicData?.topics[pointIndex];
            if (clickedTopic) {
              handleTopicClick(clickedTopic);
            }
          }
        }}
      />
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Topic Modeling
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Discover key themes and topics within the content using advanced text analysis. Topics are automatically extracted using Latent Dirichlet Allocation (LDA).
      </Typography>
      
      <SearchFilters 
        onSearch={handleSearch} 
        defaultValues={getSearchParamsObject()}
      />
      
      {/* Main content */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Loading state */}
        {loading && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          </Grid>
        )}
        
        {/* Error state */}
        {!loading && error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          </Grid>
        )}
        
        {/* Empty state */}
        {!loading && !error && (!topicData || !topicData.topics) && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ my: 4 }}>
              No topic modeling data available for the current filters. Try adjusting your search criteria.
            </Alert>
          </Grid>
        )}
        
        {/* Topic controls */}
        {!loading && !error && topicData && topicData.topics && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Number of Topics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Adjust the slider to change the number of topics to extract from the data.
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={numTopics}
                      onChange={handleNumTopicsChange}
                      min={3}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      View Mode
                    </Typography>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={handleViewModeChange}
                      size="small"
                    >
                      <ToggleButton value="cards" aria-label="cards view">
                        <ViewModuleIcon />
                      </ToggleButton>
                      <ToggleButton value="cloud" aria-label="word cloud view">
                        <CloudIcon />
                      </ToggleButton>
                      <ToggleButton value="matrix" aria-label="matrix view">
                        <TableChartIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total documents analyzed: <strong>{formatNumber(topicData.documentCount)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Model quality: <strong>Coherence score: {topicData.coherenceScore.toFixed(2)}</strong>, Perplexity: <strong>{topicData.perplexityScore.toFixed(1)}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        {/* Topic Distribution Chart */}
        {!loading && !error && topicData && topicData.topics && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="topic visualization tabs"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab icon={<BubbleChartIcon />} label="Topic Distribution" />
                <Tab icon={<TrendingUpIcon />} label="Topic Relations" />
              </Tabs>
              
              <Box sx={{ height: 450 }}>
                {tabValue === 0 ? (
                  <Plot
                    data={[getTopicDistributionData()]}
                    layout={getTopicDistributionLayout()}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                    onClick={(data) => {
                      if (data.points && data.points.length > 0) {
                        const pointIndex = data.points[0].pointIndex;
                        const clickedTopic = topicData.topics[pointIndex];
                        handleTopicClick(clickedTopic);
                      }
                    }}
                  />
                ) : (
                  renderTopicRelationPlot()
                )}
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Click on a topic to see details. Topics are ranked by prevalence in the corpus.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Topic Details Section */}
        {!loading && !error && topicData && topicData.topics && (
          <Grid item xs={12}>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <Grid container spacing={3}>
                {topicData.topics.map((topic) => (
                  <Grid item xs={12} sm={6} md={4} key={topic.id}>
                    <Card 
                      className={selectedTopic && selectedTopic.id === topic.id ? 'card-hover' : ''}
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        borderLeft: '4px solid',
                        borderColor: `hsl(${(topic.id * 137) % 360}, 70%, 60%)`,
                        bgcolor: selectedTopic && selectedTopic.id === topic.id 
                          ? (isDarkMode ? 'action.selected' : 'action.hover')
                          : 'background.paper',
                      }}
                      onClick={() => handleTopicClick(topic)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {topic.label}
                          </Typography>
                          <Chip 
                            label={`${formatPercent(topic.prevalence)}`} 
                            size="small"
                            color={selectedTopic && selectedTopic.id === topic.id ? "primary" : "default"}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {topic.words.slice(0, 10).map((word, i) => (
                            <Chip 
                              key={word} 
                              label={word}
                              size="small"
                              sx={{ 
                                bgcolor: `hsla(${(topic.id * 137) % 360}, 70%, 60%, ${topic.wordWeights[i]})`,
                                color: isDarkMode ? 'white' : 'black',
                              }}
                            />
                          ))}
                        </Box>
                        
                        {selectedTopic && selectedTopic.id === topic.id && (
                          <Box sx={{ mt: 2 }}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                              Key Terms with Weights
                            </Typography>
                            {topic.words.slice(0, 10).map((word, i) => (
                              <Box key={word} sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
                                <Typography variant="body2" sx={{ minWidth: 100 }}>
                                  {word}
                                </Typography>
                                <Box sx={{ flexGrow: 1, ml: 1 }}>
                                  <Box 
                                    sx={{ 
                                      height: 6,
                                      bgcolor: `hsla(${(topic.id * 137) % 360}, 70%, 60%, 1)`,
                                      width: `${topic.wordWeights[i] * 100}%`,
                                      borderRadius: 3,
                                    }}
                                  />
                                </Box>
                                <Typography variant="caption" sx={{ ml: 1, width: 40, textAlign: 'right' }}>
                                  {(topic.wordWeights[i] * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Word Cloud View */}
            {viewMode === 'cloud' && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedTopic 
                    ? `Word Cloud for ${selectedTopic.label}` 
                    : 'Select a topic from the chart above to view its word cloud'}
                </Typography>
                
                {selectedTopic ? (
                  <Box sx={{ height: 500, width: '100%' }} className="word-cloud-container">
                    <ReactWordcloud 
                      words={selectedTopic.wordCloudData}
                      options={{
                        ...wordCloudOptions,
                        colors: [
                          `hsl(${(selectedTopic.id * 137) % 360}, 80%, 65%)`,
                          `hsl(${(selectedTopic.id * 137) % 360}, 70%, 55%)`,
                          `hsl(${(selectedTopic.id * 137) % 360}, 60%, 45%)`,
                        ],
                      }}
                    />
                  </Box>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {topicData.topics.map(topic => (
                      <Grid item key={topic.id}>
                        <Button 
                          variant="outlined" 
                          onClick={() => handleTopicClick(topic)}
                          startIcon={<FormatQuoteIcon />}
                          sx={{ 
                            borderColor: `hsl(${(topic.id * 137) % 360}, 70%, 60%)`,
                            color: `hsl(${(topic.id * 137) % 360}, 70%, 60%)`,
                          }}
                        >
                          {topic.label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                )}
                
                {selectedTopic && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Top Posts for {selectedTopic.label}
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedTopic.topPosts.map((post, index) => (
                        <Grid item xs={12} key={index}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {post.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Posted by u/{post.author} in r/{post.subreddit} • Score: {post.score}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            )}
            
            {/* Topic-Term Matrix */}
            {viewMode === 'matrix' && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Topic-Term Heatmap
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  This heatmap shows how important each term is across different topics.
                </Typography>
                
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ minWidth: 800, p: 2 }}>
                    <Grid container>
                      {/* Header row */}
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Topic / Term</Typography>
                      </Grid>
                      {topicData.topTerms.slice(0, 10).map((term, i) => (
                        <Grid item xs={0.9} key={i} sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" sx={{ 
                            transform: 'rotate(-45deg)',
                            transformOrigin: 'bottom left',
                            whiteSpace: 'nowrap',
                            mt: 4,
                          }}>
                            {term}
                          </Typography>
                        </Grid>
                      ))}
                      
                      {/* Topic rows */}
                      {topicData.topics.map((topic) => (
                        <React.Fragment key={topic.id}>
                          <Grid item xs={3} sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            bgcolor: selectedTopic && selectedTopic.id === topic.id 
                              ? (isDarkMode ? 'action.selected' : 'action.hover')
                              : 'background.paper',
                            py: 1,
                          }} onClick={() => handleTopicClick(topic)}>
                            <Typography variant="body2">{topic.label}</Typography>
                          </Grid>
                          
                          {topicData.topTerms.slice(0, 10).map((term, i) => {
                            const wordIndex = topic.words.indexOf(term);
                            const weight = wordIndex !== -1 ? topic.wordWeights[wordIndex] : 0;
                            
                            return (
                              <Grid item xs={0.9} key={i} sx={{ textAlign: 'center' }}>
                                <Box sx={{ 
                                  width: '100%', 
                                  height: 40, 
                                  bgcolor: `hsla(${(topic.id * 137) % 360}, 70%, 60%, ${weight})`,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                  {weight > 0.1 && (
                                    <Typography variant="caption" sx={{ 
                                      color: weight > 0.5 ? 'white' : 'black' 
                                    }}>
                                      {(weight * 100).toFixed(0)}%
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Paper>
            )}
          </Grid>
        )}
        
        {/* Related Analysis Links */}
        {!loading && !error && topicData && (
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Further Analysis
              </Typography>
              
              <Typography variant="body2" paragraph color="text.secondary">
                Explore these related analytics to gain deeper insights:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item>
                  <Button 
                    variant="outlined" 
                    startIcon={<TimelineIcon />}
                    component={Link}
                    href={searchParams ? `/timeseries?${searchParams.toString()}` : '/timeseries'}
                  >
                    Time Series Analysis
                  </Button>
                </Grid>
                
                <Grid item>
                  <Button 
                    variant="outlined" 
                    startIcon={<SentimentSatisfiedAltIcon />}
                    component={Link}
                    href={searchParams ? `/sentiment?${searchParams.toString()}` : '/sentiment'}
                  >
                    Sentiment Analysis
                  </Button>
                </Grid>
                
                <Grid item>
                  <Button 
                    variant="outlined" 
                    startIcon={<AutoAwesomeIcon />}
                    component={Link}
                    href={searchParams ? `/ai-summary?${searchParams.toString()}` : '/ai-summary'}
                  >
                    AI-Generated Insights
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 