'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import TagIcon from '@mui/icons-material/Tag';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useColorMode } from '@/app/components/ThemeRegistry';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Define type for search parameters
interface SearchParams {
  keyword?: string;
  subreddit?: string;
  domain?: string;
  author?: string;
}

// Simple SearchFilters component (inlined since we don't have the imported component)
const SearchFilters: React.FC<{
  onSearch?: (params: SearchParams) => void;
  showAdvanced?: boolean;
}> = ({ onSearch, showAdvanced = true }) => {
  const [keyword, setKeyword] = useState('');
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSearch) {
      onSearch({ keyword });
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Search & Filter
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Search query"
            variant="outlined"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keywords, topics, or phrases..."
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

// Handle the TextField import
import TextField from '@mui/material/TextField';

// Define interface for dashboard stats
interface DashboardStats {
  totalPosts: number;
  totalSubreddits: number;
  totalAuthors: number;
  postsToday: number;
  postsTrend: 'up' | 'down' | 'flat';
  postsTrendPercentage: number;
  topSubreddits: {
    name: string;
    posts: number;
    trend: 'up' | 'down' | 'flat';
  }[];
  topTopics: {
    name: string;
    percentage: number;
    trend: 'up' | 'down' | 'flat';
  }[];
  sentimentOverview: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Function to generate mock dashboard data
const generateMockDashboardData = (): DashboardStats => {
  return {
    totalPosts: 24750,
    totalSubreddits: 128,
    totalAuthors: 8432,
    postsToday: 1250,
    postsTrend: 'up',
    postsTrendPercentage: 12,
    topSubreddits: [
      { name: 'technology', posts: 3450, trend: 'up' },
      { name: 'politics', posts: 2980, trend: 'up' },
      { name: 'science', posts: 2540, trend: 'up' },
      { name: 'news', posts: 2120, trend: 'down' },
      { name: 'worldnews', posts: 1890, trend: 'flat' },
    ],
    topTopics: [
      { name: 'Technology', percentage: 23, trend: 'up' },
      { name: 'Politics', percentage: 19, trend: 'up' },
      { name: 'Science', percentage: 17, trend: 'up' },
      { name: 'Entertainment', percentage: 12, trend: 'flat' },
      { name: 'Sports', percentage: 8, trend: 'down' },
    ],
    sentimentOverview: {
      positive: 35,
      neutral: 45,
      negative: 20,
    }
  };
};

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Ensure consistent component types for all Typography
// Simple wrapper with consistent props
const SafeTypography = (props: React.ComponentProps<typeof Typography>) => {
  const { children, ...rest } = props;
  return (
    <Typography component="div" {...rest}>
      {children}
    </Typography>
  );
};

// Add client-side only rendering to fix hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { mode } = useColorMode();
  const isDarkMode = mode === 'dark';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulate API call with timeout
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        const data = generateMockDashboardData();
        setStats(data);
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
  }, [refreshing]);

  const handleRefresh = () => {
    setRefreshing(prev => !prev);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: 'error.main' }} />;
      default:
        return <TrendingFlatIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="500">
          Dashboard Overview
        </Typography>
        
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Welcome to the Social Media Analysis Dashboard. Explore and analyze social media data to understand how information spreads across platforms.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SearchIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Quick Search</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip label="Technology" onClick={() => {}} />
          <Chip label="Politics" onClick={() => {}} />
          <Chip label="Science" onClick={() => {}} />
          <Chip label="Climate Change" onClick={() => {}} />
          <Chip 
            label={isDarkMode ? "Dark Mode Active" : "Light Mode Active"} 
            color={isDarkMode ? "secondary" : "primary"}
            variant="outlined"
            icon={isDarkMode ? <Brightness4Icon /> : <Brightness7Icon />}
          />
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigateTo('/search')}
        >
          Advanced Search
        </Button>
      </Paper>
      
      <SearchFilters 
        onSearch={(params: SearchParams) => {
          router.push(`/search?keyword=${params.keyword || ''}`);
        }}
        showAdvanced={false}
      />
      
      {/* Stats Overview */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
        <InfoIcon sx={{ mr: 1 }} /> Key Metrics
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="card-hover">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Posts
                  </Typography>
                  <ArticleIcon color="primary" />
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatNumber(stats?.totalPosts || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Across all subreddits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="card-hover">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Unique Authors
                  </Typography>
                  <PersonIcon color="secondary" />
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatNumber(stats?.totalAuthors || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Contributing users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="card-hover">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subreddits
                  </Typography>
                  <ForumIcon sx={{ color: '#4caf50' }} />
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatNumber(stats?.totalSubreddits || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Different communities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="card-hover">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Posts Today
                  </Typography>
                  <TrendingUpIcon sx={{ color: '#ff9800' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(stats?.postsToday || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    {getTrendIcon(stats?.postsTrend || 'flat')}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getTrendColor(stats?.postsTrend || 'flat'),
                        ml: 0.5,
                        fontWeight: 'bold'
                      }}
                    >
                      {stats?.postsTrendPercentage}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Compared to yesterday
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Analysis Tools */}
      <Typography variant="h5" gutterBottom sx={{ mt: 5, mb: 3 }}>
        Analysis Tools
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <TimelineIcon />
                </Box>
                <Typography variant="h6">
                  Time Series Analysis
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Analyze posting activity over time to identify trends and patterns in social media content.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Post Volume" size="small" />
                <Chip label="Trends" size="small" />
                <Chip label="Temporal Patterns" size="small" />
              </Box>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button 
                size="small" 
                onClick={() => navigateTo('/timeseries')}
                variant="contained"
                fullWidth
              >
                Explore Time Series
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#4caf50', 
                    color: 'white', 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <BubbleChartIcon />
                </Box>
                <Typography variant="h6">
                  Network Analysis
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Explore the connections between subreddits and authors to understand information flow and community structures.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Connections" size="small" />
                <Chip label="Communities" size="small" />
                <Chip label="Influencers" size="small" />
              </Box>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button 
                size="small" 
                onClick={() => navigateTo('/network')}
                variant="contained"
                fullWidth
                color="success"
              >
                Explore Networks
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#ff9800', 
                    color: 'white', 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <SentimentSatisfiedAltIcon />
                </Box>
                <Typography variant="h6">
                  Sentiment Analysis
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Analyze the emotional tone of social media content to understand public perception and reactions.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Positive" size="small" color="success" />
                <Chip label="Neutral" size="small" color="info" />
                <Chip label="Negative" size="small" color="error" />
              </Box>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button 
                size="small" 
                onClick={() => navigateTo('/sentiment')}
                variant="contained"
                fullWidth
                color="warning"
              >
                Explore Sentiment
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'secondary.main', 
                    color: 'white', 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <TagIcon />
                </Box>
                <Typography variant="h6">
                  Topic Modeling
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Discover the main themes and topics discussed across social media platforms using natural language processing.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Topics" size="small" />
                <Chip label="Themes" size="small" />
                <Chip label="Keywords" size="small" />
              </Box>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button 
                size="small" 
                onClick={() => navigateTo('/topics')}
                variant="contained"
                fullWidth
                color="secondary"
              >
                Explore Topics
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#9c27b0', 
                    color: 'white', 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <AutoAwesomeIcon />
                </Box>
                <Typography variant="h6">
                  AI Insights
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Leverage advanced AI analysis to uncover hidden patterns, trends, and opportunities in social media data.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Predictions" size="small" />
                <Chip label="Anomalies" size="small" />
                <Chip label="Recommendations" size="small" />
              </Box>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button 
                size="small" 
                onClick={() => navigateTo('/ai-insights')}
                variant="contained"
                fullWidth
                sx={{ bgcolor: '#9c27b0' }}
              >
                Explore AI Insights
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#1976d2', 
                    color: 'white', 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <SearchIcon />
                </Box>
                <Typography variant="h6">
                  Search
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Search for specific content, authors, or subreddits to analyze targeted segments of social media data.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Content" size="small" />
                <Chip label="Authors" size="small" />
                <Chip label="Subreddits" size="small" />
              </Box>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button 
                size="small" 
                onClick={() => navigateTo('/search')}
                variant="contained"
                fullWidth
              >
                Search Content
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {!loading && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 5, mb: 3 }}>
            Quick Stats
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    Top Subreddits
                  </Typography>
                  
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {stats?.topSubreddits.map((subreddit, index) => (
                      <Box key={subreddit.name} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                          r/{subreddit.name}
                        </Typography>
                        
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              bgcolor: `hsl(${index * 36}, 70%, 50%)`,
                              width: `${(subreddit.posts / stats.topSubreddits[0].posts) * 100}%`,
                              borderRadius: 1,
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 30 }}>
                          {getTrendIcon(subreddit.trend)}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    Top Topics
                  </Typography>
                  
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {stats?.topTopics.map((topic, index) => (
                      <Box key={topic.name} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                          {topic.name}
                        </Typography>
                        
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              bgcolor: `hsl(${index * 36 + 180}, 70%, 50%)`,
                              width: `${(topic.percentage / stats.topTopics[0].percentage) * 100}%`,
                              borderRadius: 1,
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="body2">
                          {topic.percentage}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    Sentiment Overview
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SentimentSatisfiedAltIcon sx={{ fontSize: 40, color: 'success.main' }} />
                      <Typography variant="h6" color="success.main">
                        {stats?.sentimentOverview.positive}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Positive
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <SentimentSatisfiedAltIcon sx={{ fontSize: 40, color: 'info.main' }} />
                      <Typography variant="h6" color="info.main">
                        {stats?.sentimentOverview.neutral}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Neutral
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <SentimentSatisfiedAltIcon sx={{ fontSize: 40, color: 'error.main' }} />
                      <Typography variant="h6" color="error.main">
                        {stats?.sentimentOverview.negative}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Negative
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      size="small" 
                      onClick={() => navigateTo('/sentiment')}
                      variant="outlined"
                      fullWidth
                    >
                      View Detailed Sentiment
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
} 