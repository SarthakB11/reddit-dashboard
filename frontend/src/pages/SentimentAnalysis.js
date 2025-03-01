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
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Plot from 'react-plotly.js';

import { useData } from '../context/DataContext';
import { formatNumber, formatSentiment, getSentimentColor, formatDate } from '../utils/formatters';
import SearchFilters from '../components/common/SearchFilters';

const SentimentAnalysis = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { sentiment, loading, errors, fetchSentimentData, searchParams } = useData();
  
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchSentimentData();
  }, [fetchSentimentData]);
  
  // Handle search submission
  const handleSearch = (params) => {
    fetchSentimentData(params);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    if (!sentiment || !sentiment.time_series) return null;
    
    const data = sentiment.time_series;
    
    return {
      x: data.map(item => item.period),
      y: data.map(item => item.avg_sentiment),
      mode: 'lines+markers',
      marker: {
        color: data.map(item => getSentimentColor(item.avg_sentiment)),
        size: 8
      },
      line: {
        color: theme.palette.primary.main,
        width: 2
      }
    };
  }, [sentiment, theme.palette.primary.main]);
  
  // Prepare distribution data
  const distributionData = useMemo(() => {
    if (!sentiment || !sentiment.distribution) return null;
    
    const data = sentiment.distribution;
    const categories = ["Very Negative", "Negative", "Slightly Negative", "Neutral", "Slightly Positive", "Positive", "Very Positive"];
    
    // Map scores to categories
    const scores = [
      data.very_negative || 0,
      data.negative || 0,
      data.slightly_negative || 0,
      data.neutral || 0,
      data.slightly_positive || 0,
      data.positive || 0,
      data.very_positive || 0
    ];
    
    // Calculate percentages
    const total = scores.reduce((a, b) => a + b, 0);
    const percentages = scores.map(score => (score / total) * 100);
    
    return {
      x: categories,
      y: percentages,
      type: 'bar',
      marker: {
        color: [
          '#d32f2f', // Very Negative
          '#f44336', // Negative
          '#ff9800', // Slightly Negative
          '#9e9e9e', // Neutral
          '#8bc34a', // Slightly Positive
          '#4caf50', // Positive
          '#2e7d32'  // Very Positive
        ]
      }
    };
  }, [sentiment]);
  
  // Prepare topic sentiment data
  const topicSentimentData = useMemo(() => {
    if (!sentiment || !sentiment.topics) return null;
    
    const data = sentiment.topics;
    
    return {
      x: data.map(item => item.avg_sentiment),
      y: data.map(item => item.topic),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: data.map(item => getSentimentColor(item.avg_sentiment))
      }
    };
  }, [sentiment]);
  
  // Calculate overall sentiment
  const overallSentiment = useMemo(() => {
    if (!sentiment || sentiment.overall_sentiment === undefined) return null;
    
    const score = sentiment.overall_sentiment;
    let category, icon, color, description;
    
    if (score > 0.05) {
      category = 'Positive';
      icon = <SentimentSatisfiedAltIcon fontSize="large" />;
      color = '#4caf50';
      description = 'The overall sentiment is positive, suggesting favorable views on this topic.';
    } else if (score < -0.05) {
      category = 'Negative';
      icon = <SentimentVeryDissatisfiedIcon fontSize="large" />;
      color = '#f44336';
      description = 'The overall sentiment is negative, suggesting unfavorable views on this topic.';
    } else {
      category = 'Neutral';
      icon = <SentimentNeutralIcon fontSize="large" />;
      color = '#ff9800';
      description = 'The overall sentiment is neutral, suggesting balanced views on this topic.';
    }
    
    return { score, category, icon, color, description };
  }, [sentiment]);
  
  // Prepare example posts data
  const examplePosts = useMemo(() => {
    if (!sentiment || !sentiment.example_posts) return null;
    
    return {
      positive: sentiment.example_posts.positive || [],
      neutral: sentiment.example_posts.neutral || [],
      negative: sentiment.example_posts.negative || []
    };
  }, [sentiment]);
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Sentiment Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze the emotional tone of posts to understand how topics are being discussed. See how sentiment changes over time and varies across subtopics.
      </Typography>
      
      <SearchFilters onSearch={handleSearch} initialExpanded={false} />
      
      {/* Loading state */}
      {loading.sentiment && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {!loading.sentiment && errors.sentiment && (
        <Alert severity="error" sx={{ my: 4 }}>
          Error loading sentiment data: {errors.sentiment}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading.sentiment && !errors.sentiment && (!sentiment || !sentiment.overall_sentiment) && (
        <Alert severity="info" sx={{ my: 4 }}>
          No sentiment data available for the current filters. Try adjusting your search criteria.
        </Alert>
      )}
      
      {/* Sentiment visualization */}
      {!loading.sentiment && !errors.sentiment && sentiment && sentiment.overall_sentiment !== undefined && (
        <>
          {/* Overall sentiment card */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Overall Sentiment
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mt: 2,
                        mb: 1,
                      }}
                    >
                      <Box 
                        sx={{ 
                          color: overallSentiment.color,
                          mr: 2,
                        }}
                      >
                        {overallSentiment.icon}
                      </Box>
                      <Typography variant="h4" component="div" sx={{ color: overallSentiment.color }}>
                        {overallSentiment.category}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {overallSentiment.description}
                    </Typography>
                    
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="error">Negative</Typography>
                        <Typography variant="caption">Neutral</Typography>
                        <Typography variant="caption" color="success">Positive</Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: 10, 
                          background: 'linear-gradient(to right, #f44336, #ff9800, #4caf50)',
                          borderRadius: 5,
                          position: 'relative',
                        }}
                      >
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: -5,
                            left: `${((overallSentiment.score + 1) / 2) * 100}%`,
                            transform: 'translateX(-50%)',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: 'background.paper',
                            border: '2px solid',
                            borderColor: overallSentiment.color,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                        Score: {overallSentiment.score.toFixed(2)} (Range: -1 to 1)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Sentiment Distribution
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Positive</Typography>
                          <Typography variant="h5" color="success.main">
                            {sentiment.distribution ? 
                              formatNumber(
                                sentiment.distribution.positive + 
                                sentiment.distribution.slightly_positive + 
                                sentiment.distribution.very_positive
                              ) : 0}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            {sentiment.distribution ? 
                              ((
                                (sentiment.distribution.positive + 
                                sentiment.distribution.slightly_positive + 
                                sentiment.distribution.very_positive) / 
                                sentiment.post_count
                              ) * 100).toFixed(1) : 0}%
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Neutral</Typography>
                          <Typography variant="h5" color="warning.main">
                            {sentiment.distribution ? 
                              formatNumber(sentiment.distribution.neutral) : 0}
                          </Typography>
                          <Typography variant="body2" color="warning.main">
                            {sentiment.distribution ? 
                              ((sentiment.distribution.neutral / sentiment.post_count) * 100).toFixed(1) : 0}%
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Negative</Typography>
                          <Typography variant="h5" color="error.main">
                            {sentiment.distribution ? 
                              formatNumber(
                                sentiment.distribution.negative + 
                                sentiment.distribution.slightly_negative + 
                                sentiment.distribution.very_negative
                              ) : 0}
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            {sentiment.distribution ? 
                              ((
                                (sentiment.distribution.negative + 
                                sentiment.distribution.slightly_negative + 
                                sentiment.distribution.very_negative) / 
                                sentiment.post_count
                              ) * 100).toFixed(1) : 0}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Posts Analyzed
                    </Typography>
                    <Typography variant="h4">
                      {formatNumber(sentiment.post_count || 0)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Sentiment Over Time
                  </Typography>
                  
                  {sentiment && sentiment.trend && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: sentiment.trend === 'increasing' ? 'success.main' : 
                                    sentiment.trend === 'decreasing' ? 'error.main' : 'warning.main',
                            color: 'white',
                            borderRadius: '50%',
                            p: 1,
                            mr: 2,
                          }}
                        >
                          {sentiment.trend === 'increasing' ? (
                            <TrendingUpIcon />
                          ) : sentiment.trend === 'decreasing' ? (
                            <TrendingDownIcon />
                          ) : (
                            <SentimentNeutralIcon />
                          )}
                        </Box>
                        <Typography variant="body1">
                          Sentiment is {sentiment.trend} over time
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {sentiment.trend === 'increasing' ? (
                          "The overall sentiment has been improving over the analyzed time period."
                        ) : sentiment.trend === 'decreasing' ? (
                          "The overall sentiment has been declining over the analyzed time period."
                        ) : (
                          "The overall sentiment has remained relatively stable over the analyzed time period."
                        )}
                      </Typography>
                    </>
                  )}
                  
                  {sentiment && sentiment.extremes && (
                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Most Positive Day:
                          </Typography>
                          <Typography variant="body1" color="success.main">
                            {formatDate(sentiment.extremes.most_positive_day)}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            Score: {sentiment.extremes.most_positive_score.toFixed(2)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Most Negative Day:
                          </Typography>
                          <Typography variant="body1" color="error.main">
                            {formatDate(sentiment.extremes.most_negative_day)}
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            Score: {sentiment.extremes.most_negative_score.toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Tabs and charts */}
          <Paper sx={{ mb: 4 }}>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange} 
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Over Time" />
              <Tab label="Distribution" />
              <Tab label="By Topic" />
            </Tabs>
            
            {/* Over Time tab */}
            {selectedTab === 0 && timeSeriesData && (
              <Box sx={{ height: 400, p: 2 }}>
                <Plot
                  data={[timeSeriesData]}
                  layout={{
                    autosize: true,
                    margin: { l: 50, r: 30, t: 30, b: 50 },
                    title: { text: 'Sentiment Over Time' },
                    xaxis: {
                      title: { text: 'Date' },
                      gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                    yaxis: {
                      title: { text: 'Sentiment Score (-1 to 1)' },
                      range: [-1, 1],
                      gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    font: {
                      color: isDarkMode ? '#e0e0e0' : '#333333',
                    },
                    shapes: [
                      {
                        type: 'line',
                        y0: 0,
                        y1: 0,
                        x0: 0,
                        x1: 1,
                        xref: 'paper',
                        line: {
                          color: 'rgba(128, 128, 128, 0.5)',
                          width: 1,
                          dash: 'dash',
                        }
                      }
                    ]
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            )}
            
            {/* Distribution tab */}
            {selectedTab === 1 && distributionData && (
              <Box sx={{ height: 400, p: 2 }}>
                <Plot
                  data={[distributionData]}
                  layout={{
                    autosize: true,
                    margin: { l: 50, r: 30, t: 30, b: 80 },
                    title: { text: 'Sentiment Distribution' },
                    xaxis: {
                      title: { text: 'Sentiment Category' },
                      gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                    yaxis: {
                      title: { text: 'Percentage (%)' },
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
                />
              </Box>
            )}
            
            {/* By Topic tab */}
            {selectedTab === 2 && topicSentimentData && (
              <Box sx={{ height: 400, p: 2 }}>
                <Plot
                  data={[topicSentimentData]}
                  layout={{
                    autosize: true,
                    margin: { l: 150, r: 30, t: 30, b: 50 },
                    title: { text: 'Sentiment by Topic' },
                    xaxis: {
                      title: { text: 'Sentiment Score (-1 to 1)' },
                      range: [-1, 1],
                      gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      zeroline: true,
                      zerolinecolor: 'rgba(128, 128, 128, 0.5)',
                      zerolinewidth: 1,
                    },
                    yaxis: {
                      title: { text: 'Topic' },
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
                />
              </Box>
            )}
          </Paper>
          
          {/* Example posts */}
          {examplePosts && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Example Posts by Sentiment
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Representative examples of posts with different sentiment scores.
                </Typography>
              </Grid>
              
              {/* Positive posts */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderTop: '4px solid #4caf50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SentimentSatisfiedAltIcon sx={{ color: '#4caf50', mr: 1 }} />
                      <Typography variant="h6">
                        Positive Posts
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {examplePosts.positive.length > 0 ? (
                      examplePosts.positive.slice(0, 3).map((post, index) => (
                        <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < 2 ? '1px solid' : 'none', borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {post.text.length > 180 ? post.text.substring(0, 180) + '...' : post.text}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              label={`Score: ${post.sentiment.toFixed(2)}`} 
                              size="small" 
                              sx={{ bgcolor: getSentimentColor(post.sentiment), color: 'white' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {post.subreddit ? `r/${post.subreddit}` : ''} • {formatDate(post.date, 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No positive examples available for current filters.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Neutral posts */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderTop: '4px solid #ff9800' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SentimentNeutralIcon sx={{ color: '#ff9800', mr: 1 }} />
                      <Typography variant="h6">
                        Neutral Posts
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {examplePosts.neutral.length > 0 ? (
                      examplePosts.neutral.slice(0, 3).map((post, index) => (
                        <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < 2 ? '1px solid' : 'none', borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {post.text.length > 180 ? post.text.substring(0, 180) + '...' : post.text}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              label={`Score: ${post.sentiment.toFixed(2)}`} 
                              size="small" 
                              sx={{ bgcolor: getSentimentColor(post.sentiment), color: 'white' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {post.subreddit ? `r/${post.subreddit}` : ''} • {formatDate(post.date, 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No neutral examples available for current filters.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Negative posts */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderTop: '4px solid #f44336' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SentimentVeryDissatisfiedIcon sx={{ color: '#f44336', mr: 1 }} />
                      <Typography variant="h6">
                        Negative Posts
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {examplePosts.negative.length > 0 ? (
                      examplePosts.negative.slice(0, 3).map((post, index) => (
                        <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < 2 ? '1px solid' : 'none', borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {post.text.length > 180 ? post.text.substring(0, 180) + '...' : post.text}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              label={`Score: ${post.sentiment.toFixed(2)}`} 
                              size="small" 
                              sx={{ bgcolor: getSentimentColor(post.sentiment), color: 'white' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {post.subreddit ? `r/${post.subreddit}` : ''} • {formatDate(post.date, 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No negative examples available for current filters.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default SentimentAnalysis;