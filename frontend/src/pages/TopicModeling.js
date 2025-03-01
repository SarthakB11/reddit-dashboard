import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Slider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  useTheme,
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CloudIcon from '@mui/icons-material/Cloud';
import TableChartIcon from '@mui/icons-material/TableChart';
import ReactWordcloud from 'react-wordcloud';
import Plot from 'react-plotly.js';

import { useData } from '../context/DataContext';
import { formatNumber, formatPercent } from '../utils/formatters';
import SearchFilters from '../components/common/SearchFilters';

const TopicModeling = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { topics, loading, errors, fetchTopicData, searchParams } = useData();
  
  const [numTopics, setNumTopics] = useState(5);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchTopicData({}, numTopics);
  }, [fetchTopicData, numTopics]);
  
  // Handle search submission
  const handleSearch = (params) => {
    fetchTopicData(params, numTopics);
  };
  
  // Handle slider change
  const handleNumTopicsChange = (event, newValue) => {
    setNumTopics(newValue);
  };
  
  // Handle slider change commit
  const handleNumTopicsChangeCommitted = () => {
    fetchTopicData(searchParams, numTopics);
  };
  
  // Handle view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Handle topic selection
  const handleTopicClick = (topic) => {
    setSelectedTopic(topic === selectedTopic ? null : topic);
  };
  
  // Prepare word cloud data for selected topic
  const wordCloudData = useMemo(() => {
    if (!selectedTopic) return null;
    
    // Format data for react-wordcloud
    return selectedTopic.words.map((word, i) => ({
      text: word,
      value: Math.round(selectedTopic.weights[i] * 100)
    }));
  }, [selectedTopic]);
  
  // Prepare topic distribution data
  const topicDistributionData = useMemo(() => {
    if (!topics || !topics.topics) return null;
    
    const topicData = topics.topics;
    
    return {
      x: topicData.map(topic => `Topic ${topic.id + 1}`),
      y: topicData.map(topic => topic.prevalence * 100),
      type: 'bar',
      marker: {
        color: topicData.map((topic, i) => 
          selectedTopic && selectedTopic.id === topic.id 
            ? theme.palette.primary.main 
            : `hsl(${(i * 137) % 360}, 70%, 60%)`
        )
      }
    };
  }, [topics, selectedTopic, theme.palette.primary.main]);
  
  // Prepare heatmap data for topic-term matrix
  const topicTermHeatmapData = useMemo(() => {
    if (!topics || !topics.topics) return null;
    
    const topicData = topics.topics;
    
    // Get top N words across all topics
    const allWords = new Set();
    topicData.forEach(topic => {
      topic.words.slice(0, 10).forEach(word => allWords.add(word));
    });
    
    const uniqueWords = Array.from(allWords);
    
    // Create matrix
    const z = [];
    const topicNames = [];
    
    topicData.forEach(topic => {
      topicNames.push(`Topic ${topic.id + 1}`);
      
      const wordScores = {};
      topic.words.forEach((word, i) => {
        wordScores[word] = topic.weights[i];
      });
      
      const row = uniqueWords.map(word => wordScores[word] || 0);
      z.push(row);
    });
    
    return {
      z,
      x: uniqueWords,
      y: topicNames,
      type: 'heatmap',
      colorscale: isDarkMode ? 'Viridis' : 'YlGnBu',
    };
  }, [topics, isDarkMode]);
  
  // Prepare word cloud options
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
    fontSizes: [12, 60],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 1,
    rotations: 0,
    rotationAngles: [0, 0],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 500,
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Topic Modeling
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Discover key themes and topics in the content using advanced text analysis. Topics are automatically extracted using Latent Dirichlet Allocation (LDA).
      </Typography>
      
      <SearchFilters onSearch={handleSearch} initialExpanded={false} />
      
      {/* Loading state */}
      {loading.topics && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {!loading.topics && errors.topics && (
        <Alert severity="error" sx={{ my: 4 }}>
          Error loading topic data: {errors.topics}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading.topics && !errors.topics && (!topics || !topics.topics || topics.topics.length === 0) && (
        <Alert severity="info" sx={{ my: 4 }}>
          No topic data available for the current filters. Try adjusting your search criteria or including more posts.
        </Alert>
      )}
      
      {/* Topic controls */}
      {!loading.topics && !errors.topics && topics && topics.topics && topics.topics.length > 0 && (
        <>
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
                    onChangeCommitted={handleNumTopicsChangeCommitted}
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
                    Total documents analyzed: <strong>{formatNumber(topics.document_count)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchParams && searchParams.keyword ? 
                      `Showing topics for posts containing "${searchParams.keyword}"` : 
                      'Showing topics for all posts in the dataset'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Topic Distribution */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Topic Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The prevalence of each topic in the analyzed documents. Click on a bar to see details for that topic.
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <Plot
                  data={[topicDistributionData]}
                  layout={{
                    autosize: true,
                    margin: { l: 50, r: 30, t: 30, b: 50 },
                    xaxis: {
                      title: { text: 'Topic' },
                      gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
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
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                  onClick={(data) => {
                    if (data.points && data.points.length > 0) {
                      const pointIndex = data.points[0].pointIndex;
                      handleTopicClick(topics.topics[pointIndex]);
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
          
          {/* Topic Details */}
          {viewMode === 'cards' && (
            <Grid container spacing={3}>
              {topics.topics.map((topic) => (
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
                          Topic {topic.id + 1}
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
                              bgcolor: `hsla(${(topic.id * 137) % 360}, 70%, 60%, ${topic.weights[i]})`,
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
                                    width: `${topic.weights[i] * 100}%`,
                                    borderRadius: 3,
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ ml: 1, width: 40, textAlign: 'right' }}>
                                {(topic.weights[i] * 100).toFixed(1)}%
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
                  ? `Word Cloud for Topic ${selectedTopic.id + 1}` 
                  : 'Select a topic from the chart above to view its word cloud'}
              </Typography>
              
              {selectedTopic ? (
                <Box sx={{ height: 500, width: '100%' }} className="word-cloud-container">
                  <ReactWordcloud words={wordCloudData} options={wordCloudOptions} />
                </Box>
              ) : (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {topics.topics.map(topic => (
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
                        Topic {topic.id + 1}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          )}
          
          {/* Matrix View */}
          {viewMode === 'matrix' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Topic-Term Heatmap
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This heatmap shows the relationship between topics and terms. Darker colors indicate stronger associations.
              </Typography>
              
              <Box sx={{ height: 600, width: '100%' }}>
                <Plot
                  data={[topicTermHeatmapData]}
                  layout={{
                    autosize: true,
                    margin: { l: 100, r: 30, t: 30, b: 150 },
                    xaxis: {
                      title: { text: 'Terms' },
                      tickangle: -45,
                    },
                    yaxis: {
                      title: { text: 'Topics' },
                    },
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    font: {
                      color: isDarkMode ? '#e0e0e0' : '#333333',
                    },
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default TopicModeling;