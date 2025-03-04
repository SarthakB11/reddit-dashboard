'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, CircularProgress,
  Card, CardContent, Chip, List, ListItem, ListItemText, ListItemIcon,
  Divider, Alert, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Tag as TagIcon,
  Lightbulb as LightbulbIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Verified as VerifiedIcon,
  SentimentSatisfied as SentimentSatisfiedIcon,
  SentimentDissatisfied as SentimentDissatisfiedIcon,
  SentimentNeutral as SentimentNeutralIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

// Define interfaces for the AI insights data
interface Topic {
  name: string;
  keywords: string[];
  post_count: number;
  sentiment: string;
}

interface TimeTrends {
  peak_period?: string;
  growth_rate?: string;
  most_active_times?: string;
  seasonal_patterns?: string;
}

interface EngagementPatterns {
  most_engaging_content?: string;
  controversial_topics?: string[];
  user_participation?: string;
}

interface ContentQuality {
  source_diversity?: string;
  factual_accuracy?: string;
  echo_chamber_index?: string;
}

interface AIInsightsData {
  summary: string;
  total_posts: number;
  date_range: {
    start: string;
    end: string;
  };
  sentiment: string;
  top_subreddits: Array<{ name: string; count: number }>;
  topics?: Topic[];
  time_trends?: TimeTrends;
  engagement_patterns?: EngagementPatterns;
  content_quality?: ContentQuality;
  recommendations?: string[];
  error?: string;
}

// API status component with no SSR
const ApiStatus = dynamic(() => Promise.resolve(({ status }: { status: 'connected' | 'disconnected' | 'loading' }) => {
  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }} suppressHydrationWarning>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          mr: 1,
          bgcolor:
            status === 'connected'
              ? 'success.main'
              : status === 'disconnected'
              ? 'error.main'
              : 'warning.main',
        }}
      />
      <Typography variant="body2" color="text.secondary">
        API Status:{' '}
        {status === 'connected'
          ? 'Connected'
          : status === 'disconnected'
          ? 'Disconnected'
          : 'Checking connection...'}
      </Typography>
    </Box>
  );
}), { ssr: false });

// Helper function to safely stringify any value
const safeStringify = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => safeStringify(item)).join(', ');
  }
  if (typeof value === 'object') {
    // Handle objects with description field specifically
    if ('description' in value) {
      return value.description;
    }
    try {
      // For other objects, try to get a readable representation
      const entries = Object.entries(value);
      if (entries.length === 0) return '';
      return entries
        .map(([key, val]) => `${key}: ${safeStringify(val)}`)
        .join(', ');
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
};

export default function AIInsightsPage() {
  // State variables
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [aiData, setAIData] = useState<AIInsightsData | null>(null);
  const [cachedData, setCachedData] = useState<Record<string, AIInsightsData>>({});
  const [userQuestion, setUserQuestion] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionResponse, setQuestionResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search parameters
  const [keyword, setKeyword] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [domain, setDomain] = useState('');
  
  // Load cached data from localStorage on initial render
  useEffect(() => {
    const savedCache = localStorage.getItem('aiInsightsCache');
    if (savedCache) {
      try {
        const parsedCache = JSON.parse(savedCache);
        setCachedData(parsedCache);
        
        // If there's a default entry, load it
        if (parsedCache['default']) {
          setAIData(parsedCache['default']);
        }
      } catch (e) {
        console.error('Error parsing cached insights:', e);
      }
    }
    
    // Check API health
    checkApiHealth();
  }, []);
  
  // Check API health
  const checkApiHealth = async () => {
    try {
      setApiStatus('loading');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`);
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch (error) {
      setApiStatus('disconnected');
    }
  };
  
  // Fetch insights from API or cache
  const fetchInsights = async () => {
    if (!keyword && !subreddit && !domain) {
      setError('Please provide at least one search parameter (keyword, subreddit, or domain)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Create a cache key based on search parameters
    const cacheKey = `${keyword}|${subreddit}|${domain}`;
    
    // Check if we have cached data for this query
    if (cachedData[cacheKey]) {
      console.log('Using cached data for query:', cacheKey);
      setAIData(cachedData[cacheKey]);
      setLoading(false);
      return;
    }
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (subreddit) params.append('subreddit', subreddit);
      if (domain) params.append('domain', domain);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/insights?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch insights');
      }
      
      const data = await response.json();
      
      // Update state with the new data
      setAIData(data);
      
      // Cache the data
      const updatedCache = {
        ...cachedData,
        [cacheKey]: data,
        // Also save as default if there isn't one yet
        ...(!cachedData['default'] && { 'default': data })
      };
      
      setCachedData(updatedCache);
      
      // Save to localStorage
      localStorage.setItem('aiInsightsCache', JSON.stringify(updatedCache));
      
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setAIData(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear cache
  const clearCache = () => {
    setCachedData({});
    localStorage.removeItem('aiInsightsCache');
    setAIData(null);
  };
  
  // Event handlers
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };
  
  const handleSubredditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubreddit(event.target.value);
  };
  
  const handleDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(event.target.value);
  };
  
  const handleSearch = () => {
    fetchInsights();
  };
  
  const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserQuestion(event.target.value);
  };
  
  // Process user questions using the AI data
  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || !aiData) return;
    
    setIsAskingQuestion(true);
    setQuestionResponse(null);
    
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll generate a response based on the available data
      
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a response based on the available data
      let response = "Based on the available data, ";
      
      if (aiData) {
        if (userQuestion.toLowerCase().includes('trend')) {
          if (aiData.time_trends?.growth_rate) {
            response += `I can tell you that there's been a ${aiData.time_trends.growth_rate} in posts. `;
          }
          if (aiData.topics && aiData.topics.length > 0) {
            response += `The most discussed topic is "${aiData.topics[0].name}" with ${aiData.topics[0].post_count} posts. `;
          }
        } else if (userQuestion.toLowerCase().includes('sentiment')) {
          response += `the overall sentiment is ${aiData.sentiment}. `;
          if (aiData.topics) {
            const sentiments = aiData.topics.map(t => t.sentiment);
            const uniqueSentiments = Array.from(new Set(sentiments));
            if (uniqueSentiments.length > 1) {
              response += `Different topics show varying sentiments including ${uniqueSentiments.join(', ')}. `;
            }
          }
        } else if (userQuestion.toLowerCase().includes('recommend') || userQuestion.toLowerCase().includes('suggest')) {
          if (aiData.recommendations && aiData.recommendations.length > 0) {
            response += `I would recommend: ${aiData.recommendations[0]} `;
            if (aiData.recommendations.length > 1) {
              response += `and ${aiData.recommendations[1]}`;
            }
          } else {
            response += "I don't have specific recommendations based on the current data.";
          }
        } else {
          response += `I found ${aiData.total_posts} posts from ${aiData.date_range.start} to ${aiData.date_range.end}. `;
          if (aiData.top_subreddits && aiData.top_subreddits.length > 0) {
            response += `The most active subreddit is r/${aiData.top_subreddits[0].name} with ${aiData.top_subreddits[0].count} posts. `;
          }
        }
      } else {
        response = "I don't have enough data to answer your question. Please run an analysis first by entering search parameters and clicking 'Generate Insights'.";
      }
      
      setQuestionResponse(response);
    } catch (error) {
      setQuestionResponse("I'm sorry, I encountered an error while processing your question. Please try again later.");
    } finally {
      setIsAskingQuestion(false);
    }
  };

  // Utility functions for displaying icons and colors
  const getInsightIcon = (type: string | undefined) => {
    if (!type) return <InfoIcon />;
    
    switch (type) {
      case 'trend':
        return <TrendingUpIcon />;
      case 'anomaly':
        return <InfoIcon />;
      case 'prediction':
        return <LightbulbIcon />;
      case 'recommendation':
        return <VerifiedIcon />;
      default:
        return <InfoIcon />;
    }
  };
  
  const getInsightColor = (type: string | undefined) => {
    if (!type) return 'text.primary';
    
    switch (type) {
      case 'trend':
        return 'primary.main';
      case 'anomaly':
        return 'warning.main';
      case 'prediction':
        return 'info.main';
      case 'recommendation':
        return 'success.main';
      default:
        return 'text.primary';
    }
  };
  
  const getSentimentIcon = (sentiment: string | undefined) => {
    if (!sentiment) return <SentimentNeutralIcon />;
    
    const sentimentLower = sentiment.toLowerCase();
    if (sentimentLower.includes('positive')) {
      return <SentimentSatisfiedIcon />;
    } else if (sentimentLower.includes('negative')) {
      return <SentimentDissatisfiedIcon />;
    } else {
      return <SentimentNeutralIcon />;
    }
  };
  
  const getSentimentColor = (sentiment: string | undefined) => {
    if (!sentiment) return 'text.secondary';
    
    const sentimentLower = sentiment.toLowerCase();
    if (sentimentLower.includes('positive')) {
      return 'success.main';
    } else if (sentimentLower.includes('negative')) {
      return 'error.main';
    } else if (sentiment === 'polarized') {
      return 'warning.main';
    } else if (sentiment === 'concerned') {
      return 'info.main';
    } else {
      return 'text.secondary';
    }
  };
  
  const getTrendIcon = (trend: string | undefined) => {
    if (!trend || typeof trend !== 'string') return <TrendingFlatIcon color="info" />;
    
    try {
      const trendLower = trend.toLowerCase();
      if (trendLower.includes('increase') || trendLower.includes('growth') || trendLower.includes('up')) {
        return <TrendingUpIcon color="success" />;
      } else if (trendLower.includes('decrease') || trendLower.includes('decline') || trendLower.includes('down')) {
        return <TrendingDownIcon color="error" />;
      } else {
        return <TrendingFlatIcon color="info" />;
      }
    } catch (error) {
      return <TrendingFlatIcon color="info" />;
    }
  };

  // Update the render methods to use safeStringify with better error handling
  const renderListItem = (primary: string, secondary: any) => {
    let secondaryText: string;
    try {
      secondaryText = safeStringify(secondary);
    } catch (error) {
      console.error('Error stringifying secondary text:', error);
      secondaryText = 'Error displaying content';
    }

    return (
      <ListItem>
        <ListItemText
          primary={primary}
          secondary={secondaryText}
        />
      </ListItem>
    );
  };

  // Render the component
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }} suppressHydrationWarning>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Insights
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Leverage advanced AI analysis to uncover hidden patterns, trends, and opportunities in social media data.
      </Typography>
      
      <ApiStatus status={apiStatus} />
      
      {/* Search parameters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SearchIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Generate Insights
          </Typography>
          
          {/* Cache info */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {Object.keys(cachedData).length > 0 
                ? `${Object.keys(cachedData).length} cached queries` 
                : 'No cached data'}
            </Typography>
            <Button 
              size="small" 
              startIcon={<RefreshIcon />} 
              onClick={clearCache}
              disabled={Object.keys(cachedData).length === 0}
            >
              Clear Cache
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Keyword"
              variant="outlined"
              value={keyword}
              onChange={handleKeywordChange}
              placeholder="Enter a keyword"
              helperText="Search in post titles and content"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Subreddit"
              variant="outlined"
              value={subreddit}
              onChange={handleSubredditChange}
              placeholder="Enter a subreddit"
              helperText="Filter by specific subreddit"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Domain"
              variant="outlined"
              value={domain}
              onChange={handleDomainChange}
              placeholder="Enter a domain"
              helperText="Filter by link domain"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading || (!keyword && !subreddit && !domain)}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      
      {/* Ask questions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ask Questions About the Data
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Your Question"
            variant="outlined"
            value={userQuestion}
            onChange={handleQuestionChange}
            placeholder="e.g., What are the trends in this data?"
            disabled={!aiData}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAskQuestion}
            disabled={isAskingQuestion || !userQuestion.trim() || !aiData}
            startIcon={isAskingQuestion ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            {isAskingQuestion ? 'Processing...' : 'Ask Question'}
          </Button>
        </Box>
        
        {questionResponse && (
          <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
            <Typography variant="body1">{questionResponse}</Typography>
          </Paper>
        )}
      </Paper>
      
      {/* Loading state */}
      {loading ? (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Analyzing data and generating insights...
          </Typography>
        </Box>
      ) : aiData ? (
        <>
          {/* Summary */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {aiData.summary}
            </Typography>
          </Paper>
          
          {/* Data overview */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Data Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Posts
                    </Typography>
                    <Typography variant="h4">
                      {aiData.total_posts.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Date Range
                    </Typography>
                    <Typography variant="body1">
                      {aiData.date_range.start} to {aiData.date_range.end}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Overall Sentiment
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1, color: getSentimentColor(aiData.sentiment) }}>
                        {getSentimentIcon(aiData.sentiment)}
                      </Box>
                      <Typography variant="body1" sx={{ color: getSentimentColor(aiData.sentiment) }}>
                        {aiData.sentiment.charAt(0).toUpperCase() + aiData.sentiment.slice(1)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Top Subreddit
                    </Typography>
                    {aiData.top_subreddits && aiData.top_subreddits.length > 0 ? (
                      <Typography variant="body1">
                        r/{aiData.top_subreddits[0].name} ({aiData.top_subreddits[0].count} posts)
                      </Typography>
                    ) : (
                      <Typography variant="body1">No data available</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Top Subreddits */}
          {aiData.top_subreddits && aiData.top_subreddits.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Top Subreddits
              </Typography>
              <Grid container spacing={2}>
                {aiData.top_subreddits.map((subreddit, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          r/{subreddit.name}
                        </Typography>
                        <Typography variant="body1">
                          {subreddit.count} posts
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {((subreddit.count / aiData.total_posts) * 100).toFixed(1)}% of total
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Topics */}
          {aiData.topics && aiData.topics.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Key Topics
              </Typography>
              <Grid container spacing={2}>
                {aiData.topics.map((topic, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {topic.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Sentiment:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 0.5, color: getSentimentColor(topic.sentiment) }}>
                              {getSentimentIcon(topic.sentiment)}
                            </Box>
                            <Typography variant="body2" sx={{ color: getSentimentColor(topic.sentiment) }}>
                              {topic.sentiment.charAt(0).toUpperCase() + topic.sentiment.slice(1)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {topic.post_count} posts
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {topic.keywords.map((keyword, i) => (
                            <Chip
                              key={i}
                              label={keyword}
                              size="small"
                              icon={<TagIcon />}
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Time Trends and Engagement Patterns */}
          <Grid container spacing={3}>
            {/* Time Trends */}
            {aiData.time_trends && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Time Trends</Typography>
                  </Box>
                  <List>
                    {aiData.time_trends.peak_period && renderListItem(
                      "Peak Period",
                      aiData.time_trends.peak_period
                    )}
                    {aiData.time_trends.growth_rate && renderListItem(
                      "Growth Rate",
                      aiData.time_trends.growth_rate
                    )}
                    {aiData.time_trends.most_active_times && renderListItem(
                      "Most Active Times",
                      aiData.time_trends.most_active_times
                    )}
                    {aiData.time_trends.seasonal_patterns && renderListItem(
                      "Seasonal Patterns",
                      aiData.time_trends.seasonal_patterns
                    )}
                  </List>
                </Paper>
              </Grid>
            )}
            
            {/* Engagement Patterns */}
            {aiData.engagement_patterns && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GroupIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h6">Engagement Patterns</Typography>
                  </Box>
                  <List>
                    {aiData.engagement_patterns.most_engaging_content && renderListItem(
                      "Most Engaging Content",
                      aiData.engagement_patterns.most_engaging_content
                    )}
                    {aiData.engagement_patterns.controversial_topics && 
                     Array.isArray(aiData.engagement_patterns.controversial_topics) && 
                     aiData.engagement_patterns.controversial_topics.length > 0 && renderListItem(
                      "Controversial Topics",
                      aiData.engagement_patterns.controversial_topics
                    )}
                    {aiData.engagement_patterns.user_participation && renderListItem(
                      "User Participation",
                      aiData.engagement_patterns.user_participation
                    )}
                  </List>
                </Paper>
              </Grid>
            )}
          </Grid>
          
          {/* Content Quality and Recommendations */}
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            {/* Content Quality */}
            {aiData.content_quality && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">Content Quality</Typography>
                  </Box>
                  <List>
                    {aiData.content_quality.source_diversity && renderListItem(
                      "Source Diversity",
                      aiData.content_quality.source_diversity
                    )}
                    {aiData.content_quality.factual_accuracy && renderListItem(
                      "Factual Accuracy",
                      aiData.content_quality.factual_accuracy
                    )}
                    {aiData.content_quality.echo_chamber_index && renderListItem(
                      "Echo Chamber Index",
                      aiData.content_quality.echo_chamber_index
                    )}
                  </List>
                </Paper>
              </Grid>
            )}
            
            {/* Recommendations */}
            {aiData.recommendations && aiData.recommendations.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LightbulbIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Recommendations</Typography>
                  </Box>
                  <List>
                    {aiData.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <VerifiedIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}
          </Grid>
          
          {/* Raw Data Accordion */}
          <Accordion sx={{ mt: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>View Raw JSON Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ p: 2, bgcolor: 'background.default', maxHeight: 400, overflow: 'auto' }}>
                <pre>{JSON.stringify(aiData, null, 2)}</pre>
              </Paper>
            </AccordionDetails>
          </Accordion>
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Insights Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter search parameters above and click "Generate Insights" to analyze the data.
          </Typography>
        </Paper>
      )}
    </Box>
  );
} 