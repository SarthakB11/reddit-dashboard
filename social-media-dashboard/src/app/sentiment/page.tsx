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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Alert,
} from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TimelineIcon from '@mui/icons-material/Timeline';
import ForumIcon from '@mui/icons-material/Forum';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false }) as any;

// Define interfaces for sentiment data
interface SentimentPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SubredditSentiment {
  name: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  score: number; // -1 to 1 scale
}

interface SentimentData {
  overall: {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
    score: number; // -1 to 1 scale
  };
  timeData: SentimentPoint[];
  subreddits: SubredditSentiment[];
}

// Function to generate mock sentiment data
const generateMockSentimentData = (): SentimentData => {
  // Create time series data
  const timeData: SentimentPoint[] = [];
  const dates = [
    'Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 
    'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10'
  ];
  
  // Generate realistic sentiment patterns
  let positiveTrend = 30;
  let neutralTrend = 50;
  let negativeTrend = 20;
  
  dates.forEach(date => {
    // Add some randomness but maintain a general trend
    const positiveChange = Math.random() * 10 - 3; // Slight upward bias
    const negativeChange = Math.random() * 8 - 2; // Slight downward bias
    
    positiveTrend = Math.max(10, Math.min(60, positiveTrend + positiveChange));
    negativeTrend = Math.max(5, Math.min(50, negativeTrend + negativeChange));
    neutralTrend = 100 - positiveTrend - negativeTrend;
    
    timeData.push({
      date,
      positive: Math.round(positiveTrend),
      neutral: Math.round(neutralTrend),
      negative: Math.round(negativeTrend)
    });
  });
  
  // Create subreddit sentiment data
  const subreddits: SubredditSentiment[] = [
    {
      name: 'technology',
      positive: 45,
      neutral: 40,
      negative: 15,
      total: 450,
      score: 0.3
    },
    {
      name: 'politics',
      positive: 25,
      neutral: 30,
      negative: 45,
      total: 380,
      score: -0.2
    },
    {
      name: 'science',
      positive: 55,
      neutral: 35,
      negative: 10,
      total: 320,
      score: 0.45
    },
    {
      name: 'news',
      positive: 30,
      neutral: 40,
      negative: 30,
      total: 280,
      score: 0
    },
    {
      name: 'worldnews',
      positive: 20,
      neutral: 45,
      negative: 35,
      total: 240,
      score: -0.15
    },
  ];
  
  // Calculate overall sentiment
  const totalPosts = subreddits.reduce((sum, sr) => sum + sr.total, 0);
  const weightedPositive = subreddits.reduce((sum, sr) => sum + (sr.positive * sr.total), 0) / totalPosts;
  const weightedNeutral = subreddits.reduce((sum, sr) => sum + (sr.neutral * sr.total), 0) / totalPosts;
  const weightedNegative = subreddits.reduce((sum, sr) => sum + (sr.negative * sr.total), 0) / totalPosts;
  
  return {
    overall: {
      positive: Math.round(weightedPositive),
      neutral: Math.round(weightedNeutral),
      negative: Math.round(weightedNegative),
      total: totalPosts,
      score: (weightedPositive - weightedNegative) / 100
    },
    timeData,
    subreddits
  };
};

export default function SentimentAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState<'stacked' | 'line'>('stacked');
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [usingSampleData, setUsingSampleData] = useState(false);
  
  // Function to check API health
  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        setApiStatus('connected');
        return true;
      } else {
        setApiStatus('disconnected');
        return false;
      }
    } catch (err) {
      setApiStatus('disconnected');
      return false;
    }
  };
  
  // Function to fetch sentiment data from API
  const fetchSentimentData = async (keyword: string = '', subreddit: string = '') => {
    setLoading(true);
    setError(null);
    setUsingSampleData(false);
    
    try {
      // First check API health
      const isApiHealthy = await checkApiHealth();
      
      if (!isApiHealthy) {
        throw new Error('API server is not available');
      }
      
      // Build API URL with query parameters
      const apiUrl = new URL('http://localhost:5000/api/sentiment');
      if (keyword) {
        apiUrl.searchParams.append('keyword', keyword);
      }
      if (subreddit) {
        apiUrl.searchParams.append('subreddit', subreddit);
      }
      
      // Fetch data from API
      const response = await fetch(apiUrl.toString(), { signal: AbortSignal.timeout(10000) });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we have valid data
      if (!data.overall || !data.timeData || !data.subreddits) {
        throw new Error('Invalid data format received from API');
      }
      
      setSentimentData(data);
      setApiStatus('connected');
    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      setError(`Failed to load sentiment data from API: ${err instanceof Error ? err.message : 'Unknown error'}. Using sample data instead.`);
      setApiStatus('disconnected');
      
      // Fallback to sample data
      const sampleData = generateMockSentimentData();
      setSentimentData(sampleData);
      setUsingSampleData(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Check API status periodically
  useEffect(() => {
    const checkApiConnection = async () => {
      const isHealthy = await checkApiHealth();
      
      // If API is now available but we're using sample data, offer to refresh
      if (isHealthy && usingSampleData) {
        // Keep using sample data but update status
        setApiStatus('connected');
      }
    };
    
    // Initial check
    checkApiConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkApiConnection, 30000);
    
    return () => clearInterval(interval);
  }, [usingSampleData]);
  
  // Fetch data on initial load
  useEffect(() => {
    fetchSentimentData();
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleChartTypeChange = (type: 'stacked' | 'line') => {
    setChartType(type);
  };
  
  const handleSubredditChange = (event: SelectChangeEvent) => {
    setSelectedSubreddit(event.target.value);
  };
  
  const handleRefreshData = () => {
    fetchSentimentData();
  };
  
  const handleSearch = (keyword: string, subreddit: string) => {
    fetchSentimentData(keyword, subreddit);
  };
  
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
  
  const getSentimentIcon = (sentiment: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    const iconProps = { 
      fontSize: size,
      sx: { 
        color: sentiment === 'positive' ? 'success.main' : 
               sentiment === 'negative' ? 'error.main' : 'info.main'
      }
    };
    
    switch (sentiment) {
      case 'positive':
        return <SentimentSatisfiedAltIcon {...iconProps} />;
      case 'negative':
        return <SentimentVeryDissatisfiedIcon {...iconProps} />;
      default:
        return <SentimentNeutralIcon {...iconProps} />;
    }
  };
  
  const getSentimentColor = (score: number) => {
    if (score > 0.2) return 'success.main';
    if (score < -0.2) return 'error.main';
    return 'info.main';
  };
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sentiment Analysis
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ApiStatus status={apiStatus} />
          {usingSampleData && apiStatus === 'connected' && (
            <Button 
              size="small" 
              variant="outlined" 
              color="primary" 
              onClick={handleRefreshData}
              startIcon={<RefreshIcon />}
            >
              Refresh with real data
            </Button>
          )}
        </Box>
      </Box>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze the emotional tone of social media content to understand public perception and reactions.
        {usingSampleData && (
          <Box component="span" sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}>
            <Chip 
              icon={<WarningIcon />} 
              label="Using sample data" 
              color="warning" 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
          </Box>
        )}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3, alignItems: 'flex-end' }}>
          <TextField
            label="Search Keyword"
            variant="outlined"
            sx={{ flexGrow: 1 }}
            placeholder="Enter keyword to analyze sentiment..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch((e.target as HTMLInputElement).value, '');
              }
            }}
          />
          
          <TextField
            label="Subreddit"
            variant="outlined"
            sx={{ flexGrow: 1 }}
            placeholder="e.g. politics, technology"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch('', (e.target as HTMLInputElement).value);
              }
            }}
          />
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              const keywordInput = document.querySelector('input[placeholder="Enter keyword to analyze sentiment..."]') as HTMLInputElement;
              const subredditInput = document.querySelector('input[placeholder="e.g. politics, technology"]') as HTMLInputElement;
              handleSearch(keywordInput?.value || '', subredditInput?.value || '');
            }}
            startIcon={<SearchIcon />}
            disabled={loading}
          >
            Analyze
          </Button>
        </Box>
        
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="sentiment analysis tabs">
            <Tab label="Overview" />
            <Tab label="Time Trends" />
            <Tab label="Subreddit Comparison" />
          </Tabs>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 1: Overview */}
            {tabValue === 0 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Overall Sentiment
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 4 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            {getSentimentIcon('positive', 'large')}
                            <Typography variant="h5" color="success.main">
                              {sentimentData?.overall.positive}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Positive
                            </Typography>
                          </Box>
                          
                          <Box sx={{ textAlign: 'center' }}>
                            {getSentimentIcon('neutral', 'large')}
                            <Typography variant="h5" color="info.main">
                              {sentimentData?.overall.neutral}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Neutral
                            </Typography>
                          </Box>
                          
                          <Box sx={{ textAlign: 'center' }}>
                            {getSentimentIcon('negative', 'large')}
                            <Typography variant="h5" color="error.main">
                              {sentimentData?.overall.negative}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Negative
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Overall Sentiment Score
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ color: getSentimentColor(sentimentData?.overall.score || 0) }}
                            >
                              {sentimentData?.overall.score.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              (-1 to 1 scale)
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Sentiment Distribution
                        </Typography>
                        
                        {/* Replace placeholder with actual sentiment distribution chart */}
                        <Box sx={{ height: 200, mb: 2 }}>
                          {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <CircularProgress />
                            </Box>
                          ) : sentimentData ? (
                            <Plot
                              data={[
                                {
                                  values: [
                                    sentimentData.overall.positive,
                                    sentimentData.overall.neutral,
                                    sentimentData.overall.negative
                                  ],
                                  labels: ['Positive', 'Neutral', 'Negative'],
                                  type: 'pie',
                                  hole: 0.4,
                                  marker: {
                                    colors: ['#4caf50', '#2196f3', '#f44336']
                                  },
                                  textinfo: 'label+percent',
                                  textposition: 'outside',
                                  automargin: true,
                                  hoverinfo: 'label+percent+value',
                                }
                              ]}
                              layout={{
                                autosize: true,
                                margin: { l: 0, r: 0, t: 0, b: 0 },
                                showlegend: false,
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                              }}
                              useResizeHandler={true}
                              style={{ width: '100%', height: '100%' }}
                            />
                          ) : (
                            <Box sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center',
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                            }}>
                              <Typography variant="body1" color="text.secondary">
                                No sentiment data available
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          The sentiment analysis shows a generally {sentimentData?.overall.score && sentimentData.overall.score > 0.05 ? 'positive' : sentimentData?.overall.score && sentimentData.overall.score < -0.05 ? 'negative' : 'neutral'} tone across analyzed content, with {sentimentData?.overall.positive}% positive, {sentimentData?.overall.neutral}% neutral, and {sentimentData?.overall.negative}% negative sentiment.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top Positive and Negative Subreddits
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <SentimentSatisfiedAltIcon sx={{ mr: 1, color: 'success.main' }} />
                            Most Positive Subreddits
                          </Typography>
                          
                          <Divider sx={{ mb: 2 }} />
                          
                          {sentimentData?.subreddits
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 3)
                            .map((subreddit, index) => (
                              <Box key={subreddit.name} sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                                <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                                
                                <Typography variant="body1" sx={{ minWidth: 120 }}>
                                  r/{subreddit.name}
                                </Typography>
                                
                                <Box sx={{ flexGrow: 1, mx: 2 }}>
                                  <Box 
                                    sx={{ 
                                      height: 8, 
                                      bgcolor: 'success.main',
                                      width: `${(subreddit.score + 1) / 2 * 100}%`,
                                      borderRadius: 1,
                                    }} 
                                  />
                                </Box>
                                
                                <Typography variant="body2" sx={{ color: 'success.main' }}>
                                  {subreddit.score.toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <SentimentVeryDissatisfiedIcon sx={{ mr: 1, color: 'error.main' }} />
                            Most Negative Subreddits
                          </Typography>
                          
                          <Divider sx={{ mb: 2 }} />
                          
                          {sentimentData?.subreddits
                            .sort((a, b) => a.score - b.score)
                            .slice(0, 3)
                            .map((subreddit, index) => (
                              <Box key={subreddit.name} sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                                <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                                
                                <Typography variant="body1" sx={{ minWidth: 120 }}>
                                  r/{subreddit.name}
                                </Typography>
                                
                                <Box sx={{ flexGrow: 1, mx: 2 }}>
                                  <Box 
                                    sx={{ 
                                      height: 8, 
                                      bgcolor: 'error.main',
                                      width: `${(1 - (subreddit.score + 1) / 2) * 100}%`,
                                      borderRadius: 1,
                                    }} 
                                  />
                                </Box>
                                
                                <Typography variant="body2" sx={{ color: 'error.main' }}>
                                  {subreddit.score.toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
            
            {/* Tab 2: Time Trends */}
            {tabValue === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Sentiment Over Time
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <ButtonGroup variant="outlined" size="small">
                      <Button 
                        onClick={() => handleChartTypeChange('stacked')}
                        variant={chartType === 'stacked' ? 'contained' : 'outlined'}
                      >
                        Stacked
                      </Button>
                      <Button 
                        onClick={() => handleChartTypeChange('line')}
                        variant={chartType === 'line' ? 'contained' : 'outlined'}
                      >
                        Line
                      </Button>
                    </ButtonGroup>
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel id="subreddit-select-label">Subreddit</InputLabel>
                      <Select
                        labelId="subreddit-select-label"
                        value={selectedSubreddit}
                        label="Subreddit"
                        onChange={handleSubredditChange}
                      >
                        <MenuItem value="all">All Subreddits</MenuItem>
                        {sentimentData?.subreddits.map(subreddit => (
                          <MenuItem key={subreddit.name} value={subreddit.name}>
                            r/{subreddit.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {/* Sentiment time series chart */}
                <Box sx={{ height: 400, mb: 3 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : sentimentData && sentimentData.timeData.length > 0 ? (
                    <Plot
                      data={
                        chartType === 'stacked' 
                          ? [
                              {
                                x: sentimentData.timeData.map(d => d.date),
                                y: sentimentData.timeData.map(d => d.positive),
                                type: 'bar',
                                name: 'Positive',
                                marker: { color: '#4caf50' },
                                hoverinfo: 'y+name',
                              },
                              {
                                x: sentimentData.timeData.map(d => d.date),
                                y: sentimentData.timeData.map(d => d.neutral),
                                type: 'bar',
                                name: 'Neutral',
                                marker: { color: '#2196f3' },
                                hoverinfo: 'y+name',
                              },
                              {
                                x: sentimentData.timeData.map(d => d.date),
                                y: sentimentData.timeData.map(d => d.negative),
                                type: 'bar',
                                name: 'Negative',
                                marker: { color: '#f44336' },
                                hoverinfo: 'y+name',
                              }
                            ]
                          : [
                              {
                                x: sentimentData.timeData.map(d => d.date),
                                y: sentimentData.timeData.map(d => d.positive),
                                type: 'scatter',
                                mode: 'lines+markers',
                                name: 'Positive',
                                line: { color: '#4caf50', width: 3 },
                                marker: { color: '#4caf50', size: 8 },
                              },
                              {
                                x: sentimentData.timeData.map(d => d.date),
                                y: sentimentData.timeData.map(d => d.neutral),
                                type: 'scatter',
                                mode: 'lines+markers',
                                name: 'Neutral',
                                line: { color: '#2196f3', width: 3 },
                                marker: { color: '#2196f3', size: 8 },
                              },
                              {
                                x: sentimentData.timeData.map(d => d.date),
                                y: sentimentData.timeData.map(d => d.negative),
                                type: 'scatter',
                                mode: 'lines+markers',
                                name: 'Negative',
                                line: { color: '#f44336', width: 3 },
                                marker: { color: '#f44336', size: 8 },
                              }
                            ]
                      }
                      layout={{
                        autosize: true,
                        barmode: 'stack',
                        margin: { l: 50, r: 20, t: 20, b: 50 },
                        xaxis: {
                          title: 'Date',
                          showgrid: false,
                        },
                        yaxis: {
                          title: 'Percentage (%)',
                          showgrid: true,
                          gridcolor: '#f0f0f0',
                          range: [0, 100],
                        },
                        legend: {
                          orientation: 'h',
                          y: 1.1,
                        },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                      }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        <TimelineIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
                        No sentiment data available
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Add sentiment score over time chart */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Sentiment Score Trend
                  </Typography>
                  
                  <Box sx={{ height: 250 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : sentimentData && sentimentData.timeData.length > 0 ? (
                      <Plot
                        data={[
                          {
                            x: sentimentData.timeData.map(d => d.date),
                            y: sentimentData.timeData.map((d, i) => {
                              // Calculate sentiment score from percentages
                              return (d.positive - d.negative) / 100;
                            }),
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: 'Sentiment Score',
                            line: { 
                              color: '#9c27b0',
                              width: 3,
                              shape: 'spline'
                            },
                            marker: { 
                              color: '#9c27b0',
                              size: 8,
                              symbol: 'circle'
                            },
                          }
                        ]}
                        layout={{
                          autosize: true,
                          margin: { l: 50, r: 20, t: 10, b: 50 },
                          xaxis: {
                            title: 'Date',
                            showgrid: false,
                          },
                          yaxis: {
                            title: 'Sentiment Score (-1 to 1)',
                            showgrid: true,
                            gridcolor: '#f0f0f0',
                            range: [-1, 1],
                            zeroline: true,
                            zerolinecolor: '#888',
                            zerolinewidth: 1,
                          },
                          shapes: [
                            {
                              type: 'line',
                              x0: sentimentData.timeData[0].date,
                              y0: 0,
                              x1: sentimentData.timeData[sentimentData.timeData.length - 1].date,
                              y1: 0,
                              line: {
                                color: '#888',
                                width: 1,
                                dash: 'dot',
                              }
                            }
                          ],
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent',
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                      }}>
                        <Typography variant="body1" color="text.secondary">
                          <TimelineIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
                          No sentiment data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Observations
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Based on the sentiment trends over time, we can observe:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {sentimentData && sentimentData.timeData.length > 1 && (
                        <>
                          {sentimentData.timeData[sentimentData.timeData.length - 1].positive > 
                           sentimentData.timeData[0].positive ? (
                            <Chip 
                              icon={<SentimentSatisfiedAltIcon />} 
                              label="Increasing positive sentiment" 
                              color="success" 
                              variant="outlined" 
                            />
                          ) : (
                            <Chip 
                              icon={<SentimentSatisfiedAltIcon />} 
                              label="Decreasing positive sentiment" 
                              color="warning" 
                              variant="outlined" 
                            />
                          )}
                          
                          {sentimentData.timeData[sentimentData.timeData.length - 1].negative < 
                           sentimentData.timeData[0].negative ? (
                            <Chip 
                              icon={<SentimentVeryDissatisfiedIcon />} 
                              label="Decreasing negative sentiment" 
                              color="success" 
                              variant="outlined" 
                            />
                          ) : (
                            <Chip 
                              icon={<SentimentVeryDissatisfiedIcon />} 
                              label="Increasing negative sentiment" 
                              color="error" 
                              variant="outlined" 
                            />
                          )}
                          
                          <Chip 
                            icon={<TimelineIcon />} 
                            label={`${sentimentData.timeData.length} data points analyzed`} 
                            color="primary" 
                            variant="outlined" 
                          />
                        </>
                      )}
                    </Box>
                    
                    <Typography variant="body1">
                      {sentimentData && sentimentData.timeData.length > 1 ? (
                        <>
                          The data shows {
                            sentimentData.timeData[sentimentData.timeData.length - 1].positive > 
                            sentimentData.timeData[0].positive ? 'an improvement' : 'a decline'
                          } in sentiment over the analyzed period, with positive sentiment
                          {sentimentData.timeData[sentimentData.timeData.length - 1].positive > 
                           sentimentData.timeData[0].positive ? ' increasing' : ' decreasing'} from {sentimentData.timeData[0].positive}% to {sentimentData.timeData[sentimentData.timeData.length - 1].positive}%.
                          Negative sentiment has {
                            sentimentData.timeData[sentimentData.timeData.length - 1].negative < 
                            sentimentData.timeData[0].negative ? 'decreased' : 'increased'
                          } from {sentimentData.timeData[0].negative}% to {sentimentData.timeData[sentimentData.timeData.length - 1].negative}%.
                          {sentimentData.timeData.length > 5 && ' The trend shows fluctuations over time, which may correlate with specific events or news cycles.'}
                        </>
                      ) : (
                        'Not enough data points to identify trends. Try expanding your search criteria or time range.'
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
            
            {/* Tab 3: Subreddit Comparison */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Sentiment Comparison Across Subreddits
                </Typography>
                
                {/* Subreddit comparison chart */}
                <Box sx={{ height: 400, mb: 3 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : sentimentData && sentimentData.subreddits.length > 0 ? (
                    <Plot
                      data={[
                        {
                          x: sentimentData.subreddits.map(sr => `r/${sr.name}`),
                          y: sentimentData.subreddits.map(sr => sr.positive),
                          type: 'bar',
                          name: 'Positive',
                          marker: { color: '#4caf50' },
                        },
                        {
                          x: sentimentData.subreddits.map(sr => `r/${sr.name}`),
                          y: sentimentData.subreddits.map(sr => sr.neutral),
                          type: 'bar',
                          name: 'Neutral',
                          marker: { color: '#2196f3' },
                        },
                        {
                          x: sentimentData.subreddits.map(sr => `r/${sr.name}`),
                          y: sentimentData.subreddits.map(sr => sr.negative),
                          type: 'bar',
                          name: 'Negative',
                          marker: { color: '#f44336' },
                        }
                      ]}
                      layout={{
                        autosize: true,
                        barmode: 'stack',
                        margin: { l: 50, r: 20, t: 20, b: 100 },
                        xaxis: {
                          title: 'Subreddit',
                          showgrid: false,
                          tickangle: -45,
                        },
                        yaxis: {
                          title: 'Percentage (%)',
                          showgrid: true,
                          gridcolor: '#f0f0f0',
                          range: [0, 100],
                        },
                        legend: {
                          orientation: 'h',
                          y: 1.1,
                        },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                      }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        <ForumIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
                        No subreddit data available
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} mb={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Sentiment Heatmap
                        </Typography>
                        
                        <Box sx={{ height: 300 }}>
                          {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <CircularProgress />
                            </Box>
                          ) : sentimentData && sentimentData.subreddits.length > 0 ? (
                            <Plot
                              data={[
                                {
                                  z: [
                                    sentimentData.subreddits.map(sr => sr.positive),
                                    sentimentData.subreddits.map(sr => sr.neutral),
                                    sentimentData.subreddits.map(sr => sr.negative)
                                  ],
                                  x: sentimentData.subreddits.map(sr => `r/${sr.name}`),
                                  y: ['Positive', 'Neutral', 'Negative'],
                                  type: 'heatmap',
                                  colorscale: [
                                    [0, '#f8f9fa'],
                                    [0.5, '#90caf9'],
                                    [1, '#1976d2']
                                  ],
                                  showscale: true,
                                  hovertemplate: 
                                    '<b>%{y}</b> sentiment for <b>%{x}</b><br>' +
                                    '%{z}%<extra></extra>',
                                }
                              ]}
                              layout={{
                                autosize: true,
                                margin: { l: 100, r: 50, t: 30, b: 100 },
                                xaxis: {
                                  title: 'Subreddit',
                                  tickangle: -45,
                                },
                                yaxis: {
                                  title: 'Sentiment Category',
                                },
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                              }}
                              useResizeHandler={true}
                              style={{ width: '100%', height: '100%' }}
                            />
                          ) : (
                            <Box sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center',
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                            }}>
                              <Typography variant="body1" color="text.secondary">
                                <ForumIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
                                No subreddit data available
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {sentimentData?.subreddits.map(subreddit => (
                    <Grid item xs={12} sm={6} md={4} key={subreddit.name}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                            r/{subreddit.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                              Sentiment:
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: getSentimentColor(subreddit.score)
                              }}
                            >
                              {subreddit.score.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <SentimentSatisfiedAltIcon sx={{ fontSize: 'small', color: 'success.main', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Positive:
                              </Typography>
                              <Box sx={{ flexGrow: 1, mx: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: 6, 
                                    bgcolor: 'success.main',
                                    width: `${subreddit.positive}%`,
                                    borderRadius: 1,
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2">
                                {subreddit.positive}%
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <SentimentNeutralIcon sx={{ fontSize: 'small', color: 'info.main', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Neutral:
                              </Typography>
                              <Box sx={{ flexGrow: 1, mx: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: 6, 
                                    bgcolor: 'info.main',
                                    width: `${subreddit.neutral}%`,
                                    borderRadius: 1,
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2">
                                {subreddit.neutral}%
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SentimentVeryDissatisfiedIcon sx={{ fontSize: 'small', color: 'error.main', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Negative:
                              </Typography>
                              <Box sx={{ flexGrow: 1, mx: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: 6, 
                                    bgcolor: 'error.main',
                                    width: `${subreddit.negative}%`,
                                    borderRadius: 1,
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2">
                                {subreddit.negative}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="body2" color="text.secondary">
                            Total posts analyzed: {subreddit.total}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Based on the sentiment analysis, we can draw the following conclusions:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {sentimentData && sentimentData.subreddits.length > 0 && (
              <>
                {/* Most positive subreddit */}
                {(() => {
                  const mostPositive = [...sentimentData.subreddits].sort((a, b) => b.score - a.score)[0];
                  return (
                    <Chip 
                      icon={<SentimentSatisfiedAltIcon />} 
                      label={`r/${mostPositive.name} most positive`} 
                      color="success" 
                      variant="outlined" 
                    />
                  );
                })()}
                
                {/* Most negative subreddit */}
                {(() => {
                  const mostNegative = [...sentimentData.subreddits].sort((a, b) => a.score - b.score)[0];
                  return (
                    <Chip 
                      icon={<SentimentVeryDissatisfiedIcon />} 
                      label={`r/${mostNegative.name} most negative`} 
                      color="error" 
                      variant="outlined" 
                    />
                  );
                })()}
                
                {/* Overall trend */}
                {sentimentData.timeData.length > 1 && (
                  <Chip 
                    icon={<TimelineIcon />} 
                    label={`Overall ${
                      sentimentData.timeData[sentimentData.timeData.length - 1].positive > 
                      sentimentData.timeData[0].positive ? 'positive' : 'negative'
                    } trend`} 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
              </>
            )}
          </Box>
          
          <Typography variant="body1">
            {sentimentData ? (
              <>
                {sentimentData.subreddits.length > 0 ? (
                  <>
                    The sentiment analysis reveals that {(() => {
                      const mostPositive = [...sentimentData.subreddits].sort((a, b) => b.score - a.score)[0];
                      return `r/${mostPositive.name} has the most positive sentiment with a score of ${mostPositive.score.toFixed(2)}`;
                    })()},
                    while {(() => {
                      const mostNegative = [...sentimentData.subreddits].sort((a, b) => a.score - b.score)[0];
                      return `r/${mostNegative.name} shows the most negative sentiment at ${mostNegative.score.toFixed(2)}`;
                    })()}.
                    
                    Overall, the content analyzed shows a {
                      sentimentData.overall.score > 0.05 ? 'positive' : 
                      sentimentData.overall.score < -0.05 ? 'negative' : 'neutral'
                    } tone with a score of {sentimentData.overall.score.toFixed(2)}.
                    
                    {sentimentData.timeData.length > 1 && (
                      ` The trend over time indicates a ${
                        sentimentData.timeData[sentimentData.timeData.length - 1].positive > 
                        sentimentData.timeData[0].positive ? 'gradual improvement' : 'decline'
                      } in sentiment, with positive sentiment ${
                        sentimentData.timeData[sentimentData.timeData.length - 1].positive > 
                        sentimentData.timeData[0].positive ? 'increasing' : 'decreasing'
                      } from ${sentimentData.timeData[0].positive}% to ${sentimentData.timeData[sentimentData.timeData.length - 1].positive}% over the analyzed period.`
                    )}
                  </>
                ) : (
                  'Not enough data to provide detailed insights. Try expanding your search criteria or analyzing more subreddits.'
                )}
              </>
            ) : (
              'Loading sentiment data...'
            )}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 