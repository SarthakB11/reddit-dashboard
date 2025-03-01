import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  Skeleton,
  Alert,
  useTheme,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';

import { useData } from '../context/DataContext';
import { formatNumber, formatDate, formatPercent } from '../utils/formatters';
import SearchFilters from '../components/common/SearchFilters';
import LoadingState from '../components/common/LoadingState';
import CacheIndicator from '../components/common/CacheIndicator';

// Simple stat card component
const StatCard = ({ title, value, icon, color, subtitle, isLoading, isFromCache, onRefresh, error }) => {
  const theme = useTheme();
  
  return (
    <Card 
      className="card-hover" 
      sx={{ 
        height: '100%',
        borderTop: `4px solid ${color}`,
        position: 'relative',
      }}
    >
      <CacheIndicator isFromCache={isFromCache} onRefresh={onRefresh} size="small" />
      
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="div" gutterBottom color="text.secondary">
            {title}
          </Typography>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              p: 1,
              bgcolor: `${color}20`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
        
        {isLoading ? (
          <Skeleton variant="text" width="60%" height={60} />
        ) : error ? (
          <Typography variant="body2" color="error">
            Error loading data
          </Typography>
        ) : (
          <>
            <Typography variant="h3" component="div" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Analysis card component
const AnalysisCard = ({ title, description, icon, linkTo, color }) => {
  const theme = useTheme();
  
  return (
    <Card className="card-hover">
      <CardActionArea component={Link} to={linkTo}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                p: 1,
                bgcolor: `${color}20`,
                color: color,
                mr: 2,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const { 
    stats, 
    loading, 
    errors, 
    cacheStatus,
    fetchBasicStats, 
    fetchSearchResults, 
    fetchTimeSeriesData, 
    searchParams,
    refreshData
  } = useData();
  
  const [topSubreddits, setTopSubreddits] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);
  
  // Fetch data when component mounts
  useEffect(() => {
    if (!stats) {
      fetchBasicStats();
    }
    fetchTimeSeriesData();
    fetchSearchResults();
  }, [fetchBasicStats, fetchTimeSeriesData, fetchSearchResults, stats]);
  
  // Extract top subreddits from stats
  useEffect(() => {
    if (stats && stats.top_subreddits) {
      setTopSubreddits(stats.top_subreddits.slice(0, 5));
    }
  }, [stats]);
  
  // Prepare recent topics data
  useEffect(() => {
    if (stats && stats.recent_topics) {
      setRecentTopics(stats.recent_topics.slice(0, 5));
    }
  }, [stats]);
  
  // Handle search submission
  const handleSearch = (params) => {
    fetchSearchResults(params);
    fetchTimeSeriesData(params);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Social Media Analysis Dashboard
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Explore and analyze social media data to understand how information spreads across platforms.
        Use the search filters below to narrow down your analysis or browse the different analysis tools.
      </Typography>
      
      <SearchFilters onSearch={handleSearch} initialExpanded={false} />
      
      {/* Stats Overview */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Overall Statistics
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Posts"
            value={stats ? formatNumber(stats.total_posts) : '-'}
            icon={<ArticleIcon />}
            color={theme.palette.primary.main}
            subtitle="Across all subreddits"
            isLoading={loading.stats}
            isFromCache={cacheStatus.stats}
            onRefresh={() => refreshData('stats')}
            error={errors.stats}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unique Authors"
            value={stats ? formatNumber(stats.unique_authors) : '-'}
            icon={<PersonIcon />}
            color={theme.palette.secondary.main}
            subtitle="Contributing users"
            isLoading={loading.stats}
            isFromCache={cacheStatus.stats}
            onRefresh={() => refreshData('stats')}
            error={errors.stats}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Subreddits"
            value={stats ? formatNumber(stats.subreddit_count) : '-'}
            icon={<NetworkCheckIcon />}
            color="#4caf50"
            subtitle="Different communities"
            isLoading={loading.stats}
            isFromCache={cacheStatus.stats}
            onRefresh={() => refreshData('stats')}
            error={errors.stats}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="External Links"
            value={stats ? formatNumber(stats.external_link_count) : '-'}
            icon={<LinkIcon />}
            color="#ff9800"
            subtitle="Unique domains referenced"
            isLoading={loading.stats}
            isFromCache={cacheStatus.stats}
            onRefresh={() => refreshData('stats')}
            error={errors.stats}
          />
        </Grid>
      </Grid>
      
      {/* Analysis Tools */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Analysis Tools
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnalysisCard
            title="Time Series Analysis"
            description="Track post volume over time, identify trends and analyze temporal patterns in the data."
            icon={<TimelineIcon />}
            linkTo="/timeseries"
            color={theme.palette.primary.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <AnalysisCard
            title="Network Analysis"
            description="Explore connections between subreddits and authors to discover community structures."
            icon={<NetworkCheckIcon />}
            linkTo="/network"
            color="#4caf50"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <AnalysisCard
            title="Sentiment Analysis"
            description="Analyze the emotional tone of content to understand how topics are being discussed."
            icon={<SentimentSatisfiedAltIcon />}
            linkTo="/sentiment"
            color="#ff9800"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <AnalysisCard
            title="Topic Modeling"
            description="Discover key themes and topics in the content using advanced text analysis."
            icon={<FormatQuoteIcon />}
            linkTo="/topics"
            color={theme.palette.secondary.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <AnalysisCard
            title="AI Summary"
            description="Get AI-generated insights and summaries of trends for quick understanding."
            icon={<AutoAwesomeIcon />}
            linkTo="/ai-summary"
            color="#9c27b0"
          />
        </Grid>
      </Grid>
      
      {/* More detailed stats */}
      <Grid container spacing={3}>
        {/* Top Subreddits */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', position: 'relative' }}>
            <CacheIndicator 
              isFromCache={cacheStatus.stats} 
              onRefresh={() => refreshData('stats')} 
              size="small" 
            />
            
            <Typography variant="h6" gutterBottom>
              Top Subreddits
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Communities with the most activity in the dataset
            </Typography>
            
            {loading.stats ? (
              <LoadingState type="table" count={5} />
            ) : errors.stats ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                Error loading subreddit data: {errors.stats}
              </Alert>
            ) : topSubreddits.length > 0 ? (
              topSubreddits.map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          width: 30, 
                          height: 30, 
                          borderRadius: '50%',
                          bgcolor: 'background.default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          fontSize: '0.9rem',
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Typography variant="body1">
                        r/{item.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {formatNumber(item.count)} posts
                    </Typography>
                  </Box>
                  {index < topSubreddits.length - 1 && <Divider />}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No subreddit data available
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Topics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', position: 'relative' }}>
            <CacheIndicator 
              isFromCache={cacheStatus.stats} 
              onRefresh={() => refreshData('stats')} 
              size="small" 
            />
            
            <Typography variant="h6" gutterBottom>
              Trending Topics
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Popular topics being discussed in recent posts
            </Typography>
            
            {loading.stats ? (
              <LoadingState type="skeleton" variant="rectangular" count={3} height={40} fullWidth />
            ) : errors.stats ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                Error loading topic data: {errors.stats}
              </Alert>
            ) : recentTopics.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {recentTopics.map((topic, index) => (
                  <Chip 
                    key={index}
                    label={topic.name}
                    color={index % 2 === 0 ? "primary" : "secondary"}
                    variant={index < 2 ? "filled" : "outlined"}
                    icon={index < 2 ? <TrendingUpIcon /> : undefined}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No topic data available
              </Typography>
            )}
            
            {!loading.stats && !errors.stats && recentTopics.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Topic "{recentTopics[0]?.name}" has seen a {formatPercent(0.23)} increase in 
                  mentions over the past week, primarily in r/{topSubreddits[0]?.name}.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;