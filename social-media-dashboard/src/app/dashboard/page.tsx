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
  Alert,
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
import {
  TrendingUp as TrendingUpIconMUI,
  TrendingDown as TrendingDownIconMUI,
  TrendingFlat as TrendingFlatIconMUI,
  Language as LanguageIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

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
  total_posts: number;
  top_subreddits: Array<{ subreddit: string; count: number }>;
  top_authors: Array<{ author: string; count: number }>;
  top_domains: Array<{ domain: string; count: number }>;
  posts_over_time: Array<{ date: string; count: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { mode } = useColorMode();
  const isDarkMode = mode === 'dark';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshing]);

  const handleRefresh = () => {
    setRefreshing(prev => !prev);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: 'error.main' }} />;
      default:
        return <TrendingFlatIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getTrendColor = (trend: string) => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No data available
      </Alert>
    );
  }

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
                {stats.total_posts.toLocaleString()}
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
                  Active Subreddits
                </Typography>
                <LanguageIcon color="primary" />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.top_subreddits.length.toLocaleString()}
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
                  Unique Authors
                </Typography>
                <PersonIcon color="secondary" />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.top_authors.length.toLocaleString()}
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
                  External Domains
                </Typography>
                <LinkIcon color="primary" />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.top_domains.length.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Different domains
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
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
                    {stats.top_subreddits.map((subreddit, index) => (
                      <Box key={subreddit.subreddit} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                          r/{subreddit.subreddit}
                        </Typography>
                        
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              bgcolor: `hsl(${index * 36}, 70%, 50%)`,
                              width: `${(subreddit.count / stats.top_subreddits[0].count) * 100}%`,
                              borderRadius: 1,
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 30 }}>
                          {getTrendIcon(subreddit.subreddit)}
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
                    Top Authors
                  </Typography>
                  
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {stats.top_authors.map((author, index) => (
                      <Box key={author.author} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                          u/{author.author}
                        </Typography>
                        
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              bgcolor: `hsl(${index * 36 + 180}, 70%, 50%)`,
                              width: `${(author.count / stats.top_authors[0].count) * 100}%`,
                              borderRadius: 1,
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="body2">
                          {author.count.toLocaleString()} posts
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
                    Top External Domains
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {stats.top_domains.map((domain) => (
                      <Chip
                        key={domain.domain}
                        label={`${domain.domain} (${domain.count})`}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
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