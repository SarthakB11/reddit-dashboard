'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BubbleChart as BubbleChartIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  Search as SearchIcon,
  QuestionAnswer as QuestionAnswerIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Types for dashboard stats
interface DashboardStats {
  postCount: number;
  subredditCount: number;
  authorCount: number;
  timespan: string;
  topSubreddits: Array<{ name: string; count: number }>;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topKeywords: Array<{ text: string; value: number }>;
  recentActivity: Array<{
    date: string;
    postCount: number;
  }>;
}

// Sample data generation
const generateMockDashboardData = (): DashboardStats => {
  // Generate recent activity (last 14 days)
  const recentActivity = [];
  const endDate = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    recentActivity.push({
      date: date.toISOString().split('T')[0],
      postCount: Math.floor(Math.random() * 1000) + 500,
    });
  }

  return {
    postCount: 54289,
    subredditCount: 327,
    authorCount: 18542,
    timespan: '30 days',
    topSubreddits: [
      { name: 'technology', count: 4821 },
      { name: 'politics', count: 3752 },
      { name: 'science', count: 2912 },
      { name: 'askreddit', count: 2631 },
      { name: 'worldnews', count: 2187 },
    ],
    sentimentDistribution: {
      positive: 42,
      neutral: 31,
      negative: 27,
    },
    topKeywords: [
      { text: 'technology', value: 100 },
      { text: 'politics', value: 85 },
      { text: 'economy', value: 72 },
      { text: 'climate', value: 68 },
      { text: 'healthcare', value: 65 },
      { text: 'education', value: 58 },
      { text: 'innovation', value: 52 },
      { text: 'research', value: 48 },
    ],
    recentActivity,
  };
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      // For demo purposes, use mock data with a delay
      setTimeout(() => {
        const data = generateMockDashboardData();
        setDashboardData(data);
        setLoading(false);
      }, 1000);
      
      // In production, fetch from API:
      // const response = await fetchStats();
      // setDashboardData(response);
    };

    fetchDashboardData();
  }, []);

  // Analysis card data
  const analysisCards = [
    {
      title: 'Search Results',
      description: 'Find and explore specific social media posts matching your criteria.',
      icon: <SearchIcon fontSize="large" />,
      color: theme.palette.primary.main,
      link: '/search',
    },
    {
      title: 'Time Series Analysis',
      description: 'Track volume and engagement patterns over time to identify trends and anomalies.',
      icon: <TimelineIcon fontSize="large" />,
      color: '#2e7d32',
      link: '/timeseries',
    },
    {
      title: 'Network Analysis',
      description: 'Visualize connections between subreddits, authors, and content to map influence networks.',
      icon: <BubbleChartIcon fontSize="large" />,
      color: '#1976d2',
      link: '/network',
    },
    {
      title: 'Sentiment Analysis',
      description: 'Analyze emotional tone and opinion trends across social media conversations.',
      icon: <SentimentIcon fontSize="large" />,
      color: '#ed6c02',
      link: '/sentiment',
    },
    {
      title: 'Topic Modeling',
      description: 'Discover key themes and topics within content using advanced text analysis.',
      icon: <QuestionAnswerIcon fontSize="large" />,
      color: '#9c27b0',
      link: '/topics',
    },
    {
      title: 'AI-Generated Insights',
      description: 'Get AI-powered summaries, trend analysis, and anomaly detection.',
      icon: <AutoAwesomeIcon fontSize="large" />,
      color: '#0288d1',
      link: '/ai-summary',
    },
  ];

  // Prepare trend chart data
  const getTrendChartData = () => {
    if (!dashboardData || !dashboardData.recentActivity) return [];
    
    return [{
      type: 'scatter',
      mode: 'lines+markers',
      x: dashboardData.recentActivity.map(day => day.date),
      y: dashboardData.recentActivity.map(day => day.postCount),
      line: {
        color: theme.palette.primary.main,
        width: 3,
      },
      marker: {
        color: theme.palette.primary.main,
        size: 6,
      },
    }];
  };

  // Get trend chart layout
  const getTrendChartLayout = () => {
    return {
      autosize: true,
      margin: { l: 40, r: 20, t: 30, b: 40 },
      height: 250,
      xaxis: {
        title: { text: 'Date' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      yaxis: {
        title: { text: 'Posts' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDarkMode ? '#e0e0e0' : '#333333',
      },
    };
  };

  // Get sentiment chart data
  const getSentimentChartData = () => {
    if (!dashboardData || !dashboardData.sentimentDistribution) return [];
    
    return [{
      type: 'pie',
      labels: ['Positive', 'Neutral', 'Negative'],
      values: [
        dashboardData.sentimentDistribution.positive,
        dashboardData.sentimentDistribution.neutral,
        dashboardData.sentimentDistribution.negative
      ],
      marker: {
        colors: ['#4caf50', '#90caf9', '#f44336'],
      },
      hole: 0.4,
      textinfo: 'percent',
      textposition: 'inside',
    }];
  };

  // Get sentiment chart layout
  const getSentimentChartLayout = () => {
    return {
      autosize: true,
      margin: { l: 10, r: 10, t: 30, b: 10 },
      height: 250,
      showlegend: true,
      legend: {
        orientation: 'h',
        y: 0,
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDarkMode ? '#e0e0e0' : '#333333',
      },
    };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="500">
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<SearchIcon />}
          component={Link} 
          href="/search"
        >
          Search Content
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : dashboardData ? (
        <>
          {/* Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <BarChartIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h4" component="div" fontWeight="bold">
                  {dashboardData.postCount.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Posts Analyzed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                <Typography variant="h4" component="div" fontWeight="bold">
                  {dashboardData.subredditCount.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Subreddits
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <QuestionAnswerIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                <Typography variant="h4" component="div" fontWeight="bold">
                  {dashboardData.authorCount.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Unique Authors
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <SentimentIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                <Typography variant="h4" component="div" fontWeight="bold">
                  {`${dashboardData.sentimentDistribution.positive}%`}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Positive Sentiment
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Activity & Sentiment Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Post volume over the last {dashboardData.timespan}
                </Typography>
                <Box sx={{ height: 250 }}>
                  <Plot
                    data={getTrendChartData()}
                    layout={getTrendChartLayout()}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sentiment Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Emotional tone across all content
                </Typography>
                <Box sx={{ height: 250 }}>
                  <Plot
                    data={getSentimentChartData()}
                    layout={getSentimentChartLayout()}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Subreddits & Keywords */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Subreddits
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Most active communities in the dataset
                </Typography>
                {dashboardData.topSubreddits.map((subreddit, index) => (
                  <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: `hsl(${index * 37}, 70%, 50%)`, mr: 2, width: 32, height: 32 }}>
                      r/
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" component="div">
                          r/{subreddit.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subreddit.count.toLocaleString()} posts
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          mt: 1, 
                          width: '100%', 
                          height: 6, 
                          bgcolor: 'action.hover',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: `${(subreddit.count / dashboardData.topSubreddits[0].count) * 100}%`, 
                            height: '100%', 
                            bgcolor: `hsl(${index * 37}, 70%, 50%)`,
                            borderRadius: 3,
                          }} 
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Keywords
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Most frequently mentioned terms
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {dashboardData.topKeywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword.text}
                      sx={{
                        fontSize: `${Math.max(0.75, keyword.value / 50)}rem`,
                        bgcolor: `hsl(${index * 45}, ${60 + (keyword.value / 10)}%, ${isDarkMode ? 40 : 85}%)`,
                        color: isDarkMode ? 'white' : 'rgba(0,0,0,0.7)',
                        py: 2,
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Analysis Tools Section */}
          <Typography variant="h5" sx={{ mt: 6, mb: 3 }}>
            Analysis Tools
          </Typography>
          <Grid container spacing={3}>
            {analysisCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea 
                    component={Link} 
                    href={card.link} 
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          pb: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: `${card.color}20`,
                            color: card.color,
                            mr: 2,
                          }}
                        >
                          {card.icon}
                        </Box>
                        <Typography variant="h6" component="div">
                          {card.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {card.description}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                          Explore →
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Getting Started Alert */}
          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Getting Started
            </Typography>
            <Typography variant="body2" paragraph>
              This dashboard provides an overview of social media data analytics. To begin exploring:
            </Typography>
            <Typography component="div" variant="body2">
              1. Use the <strong>Search</strong> feature to find specific content
            </Typography>
            <Typography component="div" variant="body2">
              2. Explore <strong>Time Series Analysis</strong> to identify trends over time
            </Typography>
            <Typography component="div" variant="body2">
              3. Check <strong>AI-Generated Insights</strong> for automatic analysis of key patterns
            </Typography>
          </Alert>
        </>
      ) : (
        <Alert severity="error">Failed to load dashboard data</Alert>
      )}
    </Box>
  );
} 