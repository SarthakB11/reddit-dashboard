import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CommentIcon from '@mui/icons-material/Comment';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { useData } from '../context/DataContext';
import SearchFilters from '../components/common/SearchFilters';
import { formatNumber, formatDate } from '../utils/formatters';

// Helper function to get sentiment color
const getSentimentColor = (sentiment, theme) => {
  if (!sentiment || sentiment === 0) return theme.palette.text.secondary;
  
  if (sentiment > 0.5) return theme.palette.success.main;
  if (sentiment > 0) return theme.palette.success.light;
  if (sentiment > -0.5) return theme.palette.error.light;
  return theme.palette.error.main;
};

// Helper function to format sentiment as text
const formatSentiment = (sentiment) => {
  if (!sentiment || sentiment === 0) return 'Neutral';
  
  if (sentiment > 0.5) return 'Very Positive';
  if (sentiment > 0) return 'Positive';
  if (sentiment > -0.5) return 'Negative';
  return 'Very Negative';
};

// Result Card component
const ResultCard = ({ post, onClick }) => {
  const theme = useTheme();
  
  // Function to handle external link clicks
  const handleLinkClick = (e, url) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Chip 
            size="small" 
            label={`r/${post.subreddit}`} 
            sx={{ 
              fontWeight: 500, 
              backgroundColor: `hsla(${post.subreddit.charCodeAt(0) * 10 % 360}, 70%, 60%, 0.2)`,
              color: `hsl(${post.subreddit.charCodeAt(0) * 10 % 360}, 70%, 40%)`,
              mb: 1,
            }} 
          />
          
          {post.sentiment !== undefined && (
            <Tooltip title={formatSentiment(post.sentiment)}>
              <Chip 
                size="small" 
                icon={post.sentiment > 0 ? <ThumbUpIcon fontSize="small" /> : post.sentiment < 0 ? <ThumbDownIcon fontSize="small" /> : null}
                label={formatSentiment(post.sentiment)}
                sx={{ 
                  color: getSentimentColor(post.sentiment, theme),
                  borderColor: getSentimentColor(post.sentiment, theme),
                  bgcolor: 'transparent',
                  border: 1,
                }}
              />
            </Tooltip>
          )}
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ lineHeight: 1.3, fontSize: '1.1rem' }}>
          {post.title}
        </Typography>
        
        {post.content && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {post.content}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, color: 'text.secondary', fontSize: '0.75rem', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
            {post.author}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
            {formatDate(post.timestamp)}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
            {formatNumber(post.comments)} comments
          </Box>
          
          {post.score !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChartIcon fontSize="small" sx={{ mr: 0.5 }} />
              {formatNumber(post.score)} points
            </Box>
          )}
          
          {post.url && (
            <Tooltip title="Open original post">
              <IconButton 
                size="small" 
                onClick={(e) => handleLinkClick(e, post.url)}
                sx={{ ml: 'auto' }}
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// SearchResults component
const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { searchResults, loading, errors, fetchSearchResults, searchParams } = useData();
  
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(true);
  
  const resultsPerPage = 10;
  
  // Extract query params from URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get('keyword');
    const subreddit = queryParams.get('subreddit');
    const author = queryParams.get('author');
    const startDate = queryParams.get('startDate');
    const endDate = queryParams.get('endDate');
    const domain = queryParams.get('domain');
    
    // Construct search params object
    const params = {};
    if (keyword) params.keyword = keyword;
    if (subreddit) params.subreddit = subreddit;
    if (author) params.author = author;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (domain) params.domain = domain;
    
    // Fetch search results if we have params
    if (Object.keys(params).length > 0) {
      fetchSearchResults(params);
    }
  }, [location.search, fetchSearchResults]);
  
  // Update URL when search params change
  useEffect(() => {
    if (searchParams) {
      const queryParams = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });
      
      const newUrl = `${location.pathname}?${queryParams.toString()}`;
      
      if (location.search !== `?${queryParams.toString()}`) {
        navigate(newUrl, { replace: true });
      }
    }
  }, [searchParams, location.pathname, location.search, navigate]);
  
  // Handle search submission
  const handleSearch = (params) => {
    setPage(1);
    fetchSearchResults(params);
  };
  
  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle card click
  const handleCardClick = (post) => {
    // Navigate to appropriate analysis page based on post content
    if (post.content && post.content.length > 1000) {
      navigate('/topic-modeling', { state: { postId: post.id } });
    } else if (post.sentiment !== undefined) {
      navigate('/sentiment-analysis', { state: { postId: post.id } });
    } else {
      navigate('/time-series-analysis', { state: { subreddit: post.subreddit } });
    }
  };
  
  // Calculate pagination
  const totalPages = searchResults?.total 
    ? Math.ceil(searchResults.total / resultsPerPage) 
    : 0;
  
  // Get current page items
  const getCurrentPageItems = () => {
    if (!searchResults || !searchResults.posts) return [];
    
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    
    // Sort results
    let sortedResults = [...searchResults.posts];
    
    switch (sortBy) {
      case 'recent':
        sortedResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'comments':
        sortedResults.sort((a, b) => b.comments - a.comments);
        break;
      case 'score':
        sortedResults.sort((a, b) => b.score - a.score);
        break;
      case 'sentiment':
        sortedResults.sort((a, b) => b.sentiment - a.sentiment);
        break;
      default:
        // 'relevance' - keep original order
        break;
    }
    
    return sortedResults.slice(startIndex, endIndex);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Search Results
      </Typography>
      
      <Button
        variant="text"
        color="primary"
        startIcon={<FilterListIcon />}
        onClick={() => setShowFilters(!showFilters)}
        sx={{ mb: 2 }}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </Button>
      
      {showFilters && (
        <SearchFilters 
          onSearch={handleSearch} 
          initialExpanded={true}
          initialValues={searchParams}
        />
      )}
      
      {/* Results Header */}
      {!loading.searchResults && searchResults && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {searchResults.total === 0 ? (
              'No results found'
            ) : (
              <span>
                Showing {Math.min(resultsPerPage, searchResults.total - (page - 1) * resultsPerPage)} of {searchResults.total} results
                {searchParams?.keyword && (
                  <span> for "<strong>{searchParams.keyword}</strong>"</span>
                )}
              </span>
            )}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
                startAdornment={<SortIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="recent">Most Recent</MenuItem>
                <MenuItem value="comments">Most Comments</MenuItem>
                <MenuItem value="score">Highest Score</MenuItem>
                <MenuItem value="sentiment">Sentiment</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
      
      {/* Loading state */}
      {loading.searchResults && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {!loading.searchResults && errors.searchResults && (
        <Alert severity="error" sx={{ my: 4 }}>
          Error loading search results: {errors.searchResults}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading.searchResults && !errors.searchResults && (!searchResults || searchResults.total === 0) && (
        <Alert severity="info" sx={{ my: 4 }}>
          No results match your search criteria. Try adjusting your filters or search for different keywords.
        </Alert>
      )}
      
      {/* Search tip when there are no results and a filter is applied */}
      {!loading.searchResults && !errors.searchResults && searchResults && searchResults.total === 0 && searchParams && Object.keys(searchParams).some(key => !!searchParams[key]) && (
        <Box sx={{ my: 4 }}>
          <Typography variant="body1" paragraph>
            Here are some search tips:
          </Typography>
          <ul>
            <li>Try using more general keywords</li>
            <li>Check the spelling of your search terms</li>
            <li>Broaden your date range</li>
            <li>Remove subreddit or author filters</li>
          </ul>
          
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => handleSearch({})}
          >
            Clear all filters
          </Button>
        </Box>
      )}
      
      {/* Results Grid */}
      {!loading.searchResults && !errors.searchResults && searchResults && searchResults.posts && searchResults.posts.length > 0 && (
        <>
          <Grid container spacing={3}>
            {getCurrentPageItems().map((post) => (
              <Grid item xs={12} key={post.id}>
                <ResultCard post={post} onClick={() => handleCardClick(post)} />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton 
                showLastButton
              />
            </Box>
          )}
          
          {/* Additional Analysis Buttons */}
          <Box sx={{ mt: 6, mb: 4 }}>
            <Divider sx={{ mb: 4 }}>
              <Chip label="Analyze These Results" />
            </Divider>
            
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button 
                  variant="outlined" 
                  startIcon={<QueryStatsIcon />}
                  onClick={() => navigate('/sentiment-analysis', { state: { searchParams } })}
                >
                  Sentiment Analysis
                </Button>
              </Grid>
              
              <Grid item>
                <Button 
                  variant="outlined" 
                  startIcon={<ForumIcon />}
                  onClick={() => navigate('/topic-modeling', { state: { searchParams } })}
                >
                  Topic Modeling
                </Button>
              </Grid>
              
              <Grid item>
                <Button 
                  variant="outlined" 
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/time-series-analysis', { state: { searchParams } })}
                >
                  Time Series Analysis
                </Button>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SearchResults;