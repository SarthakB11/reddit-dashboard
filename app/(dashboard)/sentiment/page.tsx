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
  Tooltip,
  useTheme,
} from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TimelineIcon from '@mui/icons-material/Timeline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import ForumIcon from '@mui/icons-material/Forum';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import SearchFilters component
import SearchFilters from '@/app/components/common/SearchFilters';
import { formatDate, formatNumber, formatPercent, getSentimentColor } from '@/app/lib/formatters';

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Interface for sentiment data
interface SentimentPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  average: number;
}

interface SubredditSentiment {
  subreddit: string;
  positive: number;
  neutral: number;
  negative: number;
  average: number;
  total: number;
}

interface SentimentData {
  timeSeries: SentimentPoint[];
  bySubreddit: SubredditSentiment[];
  overall: {
    positive: number;
    neutral: number;
    negative: number;
    average: number;
    total: number;
  };
  topPositive: {
    title: string;
    author: string;
    subreddit: string;
    score: number;
    sentiment: number;
  }[];
  topNegative: {
    title: string;
    author: string;
    subreddit: string;
    score: number;
    sentiment: number;
  }[];
}

// Mock data for development
const generateMockSentimentData = (): SentimentData => {
  // Generate time series sentiment data
  const timeSeries: SentimentPoint[] = [];
  
  for (let i = 1; i <= 31; i++) {
    const date = `2023-01-${i.toString().padStart(2, '0')}`;
    
    // Create some realistic patterns with small variations
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Sentiment tends to be more positive on weekends in this mock data
    const positive = Math.round(isWeekend ? 40 + Math.random() * 15 : 30 + Math.random() * 10);
    const negative = Math.round(isWeekend ? 15 + Math.random() * 10 : 25 + Math.random() * 15);
    const neutral = 100 - positive - negative;
    const average = (positive * 0.5 + neutral * 0 + negative * -0.5) / 100;
    
    timeSeries.push({
      date,
      positive,
      neutral,
      negative,
      average,
    });
  }
  
  // Generate sentiment by subreddit
  const subreddits = [
    'funny', 'gaming', 'AskReddit', 'science', 'worldnews', 
    'politics', 'technology', 'movies', 'music', 'books'
  ];
  
  const bySubreddit: SubredditSentiment[] = subreddits.map(subreddit => {
    // Different subreddits have different sentiment distributions
    let positive, neutral, negative;
    const total = Math.floor(Math.random() * 900) + 100;
    
    switch (subreddit) {
      case 'funny':
      case 'gaming':
        positive = Math.round(45 + Math.random() * 15);
        negative = Math.round(10 + Math.random() * 10);
        neutral = 100 - positive - negative;
        break;
      case 'politics':
      case 'worldnews':
        positive = Math.round(15 + Math.random() * 15);
        negative = Math.round(40 + Math.random() * 15);
        neutral = 100 - positive - negative;
        break;
      default:
        positive = Math.round(25 + Math.random() * 20);
        negative = Math.round(15 + Math.random() * 20);
        neutral = 100 - positive - negative;
    }
    
    const average = (positive * 0.5 + neutral * 0 + negative * -0.5) / 100;
    
    return {
      subreddit,
      positive,
      neutral,
      negative,
      average,
      total,
    };
  });
  
  // Sort by average sentiment
  bySubreddit.sort((a, b) => b.average - a.average);
  
  // Calculate overall sentiment
  const totalPosts = bySubreddit.reduce((sum, item) => sum + item.total, 0);
  const weightedPositive = bySubreddit.reduce((sum, item) => sum + (item.positive * item.total), 0) / totalPosts;
  const weightedNegative = bySubreddit.reduce((sum, item) => sum + (item.negative * item.total), 0) / totalPosts;
  const weightedNeutral = 100 - weightedPositive - weightedNegative;
  const weightedAverage = (weightedPositive * 0.5 + weightedNeutral * 0 + weightedNegative * -0.5) / 100;
  
  // Generate top positive and negative posts
  const topPositive = [
    {
      title: "Just rescued this adorable puppy and I'm in love!",
      author: "dogLover123",
      subreddit: "aww",
      score: 5421,
      sentiment: 0.92,
    },
    {
      title: "My grandmother beat cancer today. So grateful for modern medicine!",
      author: "gratefulGrandkid",
      subreddit: "MadeMeSmile",
      score: 4872,
      sentiment: 0.89,
    },
    {
      title: "After 5 years of hard work, I finally graduated with honors!",
      author: "gradStudent2023",
      subreddit: "happy",
      score: 3721,
      sentiment: 0.85,
    },
  ];
  
  const topNegative = [
    {
      title: "Major disaster as flood devastates local community, hundreds displaced",
      author: "newsReporter",
      subreddit: "news",
      score: 3241,
      sentiment: -0.88,
    },
    {
      title: "Just lost my job after 15 years. The company is outsourcing everything.",
      author: "jobSeeker",
      subreddit: "jobs",
      score: 2145,
      sentiment: -0.84,
    },
    {
      title: "Healthcare costs are spiraling out of control. I can't afford treatment anymore.",
      author: "concernedCitizen",
      subreddit: "healthcare",
      score: 1872,
      sentiment: -0.78,
    },
  ];
  
  return {
    timeSeries,
    bySubreddit,
    overall: {
      positive: weightedPositive,
      neutral: weightedNeutral,
      negative: weightedNegative,
      average: weightedAverage,
      total: totalPosts,
    },
    topPositive,
    topNegative,
  };
};

export default function SentimentAnalysis() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('line');
  
  // Get search parameters from URL
  const getSearchParamsObject = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  // Fetch sentiment data based on search params
  useEffect(() => {
    const fetchSentimentData = async () => {
      setLoading(true);
      setError(null);
      
      const params = getSearchParamsObject();
      
      try {
        // For demo purposes, use mock data with a delay
        setTimeout(() => {
          const data = generateMockSentimentData();
          setSentimentData(data);
          setLoading(false);
        }, 1000);
        
        // In production, fetch from API:
        // const response = await fetchSentimentAnalysis(params);
        // setSentimentData(response);
      } catch (err) {
        console.error('Error fetching sentiment data:', err);
        setError('Failed to fetch sentiment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSentimentData();
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
    router.push(`/sentiment?${urlParams.toString()}`);
  };
  
  // Handle chart type change
  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Prepare data for time series plot
  const getTimeSeriesPlotData = () => {
    if (!sentimentData || !sentimentData.timeSeries || sentimentData.timeSeries.length === 0) {
      return [];
    }
    
    if (chartType === 'line') {
      // Line chart with sentiment over time
      return [
        {
          x: sentimentData.timeSeries.map(point => point.date),
          y: sentimentData.timeSeries.map(point => point.positive),
          type: 'scatter',
          mode: 'lines',
          name: 'Positive',
          line: {
            width: 3,
            shape: 'spline',
          },
          marker: {
            color: theme.palette.success.main,
          },
        },
        {
          x: sentimentData.timeSeries.map(point => point.date),
          y: sentimentData.timeSeries.map(point => point.neutral),
          type: 'scatter',
          mode: 'lines',
          name: 'Neutral',
          line: {
            width: 3,
            shape: 'spline',
          },
          marker: {
            color: theme.palette.warning.main,
          },
        },
        {
          x: sentimentData.timeSeries.map(point => point.date),
          y: sentimentData.timeSeries.map(point => point.negative),
          type: 'scatter',
          mode: 'lines',
          name: 'Negative',
          line: {
            width: 3,
            shape: 'spline',
          },
          marker: {
            color: theme.palette.error.main,
          },
        },
      ];
    } else {
      // Stacked bar chart
      return [
        {
          x: sentimentData.timeSeries.map(point => point.date),
          y: sentimentData.timeSeries.map(point => point.positive),
          type: 'bar',
          name: 'Positive',
          marker: {
            color: theme.palette.success.main,
          },
        },
        {
          x: sentimentData.timeSeries.map(point => point.date),
          y: sentimentData.timeSeries.map(point => point.neutral),
          type: 'bar',
          name: 'Neutral',
          marker: {
            color: theme.palette.warning.main,
          },
        },
        {
          x: sentimentData.timeSeries.map(point => point.date),
          y: sentimentData.timeSeries.map(point => point.negative),
          type: 'bar',
          name: 'Negative',
          marker: {
            color: theme.palette.error.main,
          },
        },
      ];
    }
  };
  
  // Prepare data for subreddit comparison plot
  const getSubredditPlotData = () => {
    if (!sentimentData || !sentimentData.bySubreddit || sentimentData.bySubreddit.length === 0) {
      return [];
    }
    
    if (chartType === 'line') {
      // Scatter plot with average sentiment per subreddit
      return [
        {
          x: sentimentData.bySubreddit.map(item => item.subreddit),
          y: sentimentData.bySubreddit.map(item => item.average),
          type: 'scatter',
          mode: 'markers',
          name: 'Average Sentiment',
          marker: {
            size: sentimentData.bySubreddit.map(item => Math.sqrt(item.total) * 0.2),
            color: sentimentData.bySubreddit.map(item => 
              item.average > 0.05 
                ? theme.palette.success.main 
                : item.average < -0.05 
                ? theme.palette.error.main 
                : theme.palette.warning.main
            ),
          },
          text: sentimentData.bySubreddit.map(item => 
            `r/${item.subreddit}<br>Posts: ${item.total}<br>Sentiment: ${(item.average * 100).toFixed(1)}%`
          ),
          hoverinfo: 'text',
        },
      ];
    } else {
      // Grouped bar chart with sentiment breakdown per subreddit
      return [
        {
          x: sentimentData.bySubreddit.map(item => item.subreddit),
          y: sentimentData.bySubreddit.map(item => item.positive),
          type: 'bar',
          name: 'Positive',
          marker: {
            color: theme.palette.success.main,
          },
        },
        {
          x: sentimentData.bySubreddit.map(item => item.subreddit),
          y: sentimentData.bySubreddit.map(item => item.neutral),
          type: 'bar',
          name: 'Neutral',
          marker: {
            color: theme.palette.warning.main,
          },
        },
        {
          x: sentimentData.bySubreddit.map(item => item.subreddit),
          y: sentimentData.bySubreddit.map(item => item.negative),
          type: 'bar',
          name: 'Negative',
          marker: {
            color: theme.palette.error.main,
          },
        },
      ];
    }
  };
  
  // Get layout configuration for time series plot
  const getTimeSeriesLayout = () => {
    return {
      autosize: true,
      margin: { l: 50, r: 30, t: 10, b: 50 },
      height: 400,
      xaxis: {
        title: { text: 'Date' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      yaxis: {
        title: { text: 'Percentage (%)' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      barmode: 'stack',
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDarkMode ? '#e0e0e0' : '#333333',
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: -0.2,
      },
      hovermode: 'closest',
    };
  };
  
  // Get layout configuration for subreddit plot
  const getSubredditLayout = () => {
    return {
      autosize: true,
      margin: { l: 50, r: 30, t: 10, b: 100 },
      height: 400,
      xaxis: {
        title: { text: 'Subreddit' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        tickangle: -45,
      },
      yaxis: {
        title: { text: chartType === 'line' ? 'Average Sentiment' : 'Percentage (%)' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      barmode: 'group',
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDarkMode ? '#e0e0e0' : '#333333',
      },
      showlegend: chartType !== 'line',
      legend: {
        orientation: 'h',
        y: -0.2,
      },
      hovermode: 'closest',
    };
  };
  
  // Get overall sentiment text description
  const getOverallSentimentDescription = () => {
    if (!sentimentData || !sentimentData.overall) return '';
    
    const { average, positive, negative, neutral } = sentimentData.overall;
    
    if (average > 0.1) {
      return `The overall sentiment is notably positive (${(average * 100).toFixed(1)}%), with ${positive.toFixed(1)}% of posts expressing positive sentiments compared to only ${negative.toFixed(1)}% negative.`;
    } else if (average < -0.1) {
      return `The overall sentiment is predominantly negative (${(average * 100).toFixed(1)}%), with ${negative.toFixed(1)}% of posts expressing negative sentiments compared to only ${positive.toFixed(1)}% positive.`;
    } else {
      return `The overall sentiment is relatively balanced (${(average * 100).toFixed(1)}%), with ${positive.toFixed(1)}% positive, ${neutral.toFixed(1)}% neutral, and ${negative.toFixed(1)}% negative posts.`;
    }
  };
  
  // Get sentiment icon based on average value
  const getSentimentIcon = (average: number) => {
    if (average > 0.05) {
      return <SentimentSatisfiedAltIcon style={{ color: theme.palette.success.main }} />;
    } else if (average < -0.05) {
      return <SentimentVeryDissatisfiedIcon style={{ color: theme.palette.error.main }} />;
    } else {
      return <SentimentNeutralIcon style={{ color: theme.palette.warning.main }} />;
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Sentiment Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze the emotional tone of social media content to understand how topics are being discussed. 
        Identify positive, negative, and neutral sentiment patterns across time and communities.
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
        {!loading && !error && (!sentimentData || !sentimentData.timeSeries) && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ my: 4 }}>
              No sentiment data available for the current filters. Try adjusting your search criteria.
            </Alert>
          </Grid>
        )}
        
        {/* Sentiment Overview */}
        {!loading && !error && sentimentData && sentimentData.overall && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom display="flex" alignItems="center">
                Overall Sentiment
                {getSentimentIcon(sentimentData.overall.average)}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {getOverallSentimentDescription()}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Box sx={{ 
                    display: 'flex', 
                    height: 40, 
                    width: '100%', 
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 2
                  }}>
                    <Box sx={{ 
                      width: `${sentimentData.overall.positive}%`, 
                      bgcolor: theme.palette.success.main,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                    }}>
                      {sentimentData.overall.positive.toFixed(1)}%
                    </Box>
                    <Box sx={{ 
                      width: `${sentimentData.overall.neutral}%`, 
                      bgcolor: theme.palette.warning.main,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                    }}>
                      {sentimentData.overall.neutral.toFixed(1)}%
                    </Box>
                    <Box sx={{ 
                      width: `${sentimentData.overall.negative}%`, 
                      bgcolor: theme.palette.error.main,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                    }}>
                      {sentimentData.overall.negative.toFixed(1)}%
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main, mr: 1 }} />
                      <Typography variant="body2">Positive</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.warning.main, mr: 1 }} />
                      <Typography variant="body2">Neutral</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.error.main, mr: 1 }} />
                      <Typography variant="body2">Negative</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>Average Sentiment</Typography>
                      <Typography 
                        variant="h3"
                        sx={{ 
                          color: sentimentData.overall.average > 0.05 
                            ? theme.palette.success.main 
                            : sentimentData.overall.average < -0.05 
                            ? theme.palette.error.main 
                            : theme.palette.warning.main,
                          fontWeight: 'bold' 
                        }}
                      >
                        {(sentimentData.overall.average * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Based on {formatNumber(sentimentData.overall.total)} posts
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        {/* Sentiment Analysis Charts */}
        {!loading && !error && sentimentData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="sentiment analysis tabs"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab icon={<TimelineIcon />} label="Sentiment Over Time" />
                <Tab icon={<ForumIcon />} label="Sentiment By Subreddit" />
              </Tabs>
              
              {/* Chart type controls */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">
                  {tabValue === 0 ? 'Sentiment Distribution Over Time' : 'Sentiment Comparison Across Subreddits'}
                </Typography>
                
                <ButtonGroup size="small" aria-label="Chart type">
                  <Button 
                    variant={chartType === 'line' ? 'contained' : 'outlined'} 
                    onClick={() => handleChartTypeChange('line')}
                    startIcon={tabValue === 0 ? <TimelineIcon /> : <DonutLargeIcon />}
                  >
                    {tabValue === 0 ? 'Line' : 'Scatter'}
                  </Button>
                  <Button 
                    variant={chartType === 'bar' ? 'contained' : 'outlined'} 
                    onClick={() => handleChartTypeChange('bar')}
                    startIcon={<BarChartIcon />}
                  >
                    Bar
                  </Button>
                </ButtonGroup>
              </Box>
              
              {/* Render appropriate chart based on tab */}
              <Box sx={{ height: 400, width: '100%', position: 'relative' }}>
                {tabValue === 0 ? (
                  <Plot
                    data={getTimeSeriesPlotData()}
                    layout={getTimeSeriesLayout()}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Plot
                    data={getSubredditPlotData()}
                    layout={getSubredditLayout()}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Top Positive and Negative Posts */}
        {!loading && !error && sentimentData && sentimentData.topPositive && sentimentData.topNegative && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Top Positive Posts */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                    <ThumbUpIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                    Most Positive Posts
                  </Typography>
                  
                  {sentimentData.topPositive.map((post, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {post.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          by {post.author} in r/{post.subreddit}
                        </Typography>
                        
                        <Chip 
                          size="small" 
                          label={`${(post.sentiment * 100).toFixed(0)}%`} 
                          sx={{ bgcolor: theme.palette.success.main, color: 'white' }} 
                        />
                      </Box>
                      
                      {index < sentimentData.topPositive.length - 1 && <Divider sx={{ my: 2 }} />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Top Negative Posts */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                    <ThumbDownIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                    Most Negative Posts
                  </Typography>
                  
                  {sentimentData.topNegative.map((post, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {post.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          by {post.author} in r/{post.subreddit}
                        </Typography>
                        
                        <Chip 
                          size="small" 
                          label={`${(post.sentiment * 100).toFixed(0)}%`} 
                          sx={{ bgcolor: theme.palette.error.main, color: 'white' }} 
                        />
                      </Box>
                      
                      {index < sentimentData.topNegative.length - 1 && <Divider sx={{ my: 2 }} />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Analysis Links */}
        {!loading && !error && sentimentData && (
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
                    startIcon={<ForumIcon />}
                    component={Link}
                    href={searchParams ? `/topics?${searchParams.toString()}` : '/topics'}
                  >
                    Topic Modeling
                  </Button>
                </Grid>
                
                <Grid item>
                  <Button 
                    variant="outlined" 
                    startIcon={<PieChartIcon />}
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