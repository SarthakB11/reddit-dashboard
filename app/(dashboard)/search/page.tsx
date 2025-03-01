'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ForumIcon from '@mui/icons-material/Forum';
import Link from 'next/link';

import { searchPosts } from '@/app/lib/api';
import { formatDate, formatNumber, formatSentiment, getSentimentColor } from '@/app/lib/formatters';
import SearchFilters from '@/app/components/common/SearchFilters';

// Result card component
interface Post {
  id: string;
  title: string;
  content?: string;
  author: string;
  subreddit: string;
  timestamp: string;
  comments: number;
  score?: number;
  sentiment?: number;
  url?: string;
}

const ResultCard = ({ post, onClick }: { post: Post; onClick: () => void }) => {
  const theme = useTheme();
  
  // Function to handle external link clicks
  const handleLinkClick = (e: React.MouseEvent, url?: string) => {
    if (!url) return;
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
                label={formatSentiment(post.sentiment)}
                sx={{ 
                  color: getSentimentColor(post.sentiment),
                  borderColor: getSentimentColor(post.sentiment),
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
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            {post.author}
          </Typography>
          
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            {formatDate(post.timestamp)}
          </Typography>
          
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            {formatNumber(post.comments)} comments
          </Typography>
          
          {post.score !== undefined && (
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              {formatNumber(post.score)} points
            </Typography>
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

// Mock data for development
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Climate change is accelerating faster than expected, new study finds',
    content: 'A new comprehensive study published in Nature shows that climate change is accelerating at a pace faster than previously predicted by most models. The research team analyzed data from the past 50 years and found disturbing patterns...',
    author: 'climateScientist',
    subreddit: 'science',
    timestamp: '2023-06-15T12:30:00Z',
    comments: 245,
    score: 1892,
    sentiment: 0.2,
    url: 'https://example.com/study'
  },
  {
    id: '2',
    title: 'Is anyone else concerned about the rising cost of healthcare?',
    content: 'I recently had to go to the ER and was shocked when I got the bill. Even with insurance, I had to pay thousands out of pocket. This system is broken and I don\'t know how people without good insurance manage...',
    author: 'concernedCitizen',
    subreddit: 'askreddit',
    timestamp: '2023-06-12T10:15:00Z',
    comments: 578,
    score: 2145,
    sentiment: -0.4,
  },
  {
    id: '3',
    title: 'New AI model can generate realistic images from simple text descriptions',
    content: 'OpenAI has released their latest model that can create hyper-realistic images from text prompts. The technology represents a significant advance in generative AI and could have profound implications for creative fields...',
    author: 'techEnthusiast',
    subreddit: 'technology',
    timestamp: '2023-06-10T14:45:00Z',
    comments: 326,
    score: 3451,
    sentiment: 0.7,
    url: 'https://example.com/ai-news'
  },
];

export default function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  
  const postsPerPage = 10;
  
  // Get search parameters from URL
  const getSearchParamsObject = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      const params = getSearchParamsObject();
      
      try {
        // For demo purposes, return mock data with a delay
        // In production, uncomment the API call
        setTimeout(() => {
          setPosts(mockPosts);
          setTotalPosts(mockPosts.length);
          setLoading(false);
        }, 1000);
        
        // const response = await searchPosts({
        //   ...params,
        //   offset: (page - 1) * postsPerPage,
        //   limit: postsPerPage
        // });
        // setPosts(response.posts);
        // setTotalPosts(response.total);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [searchParams, page]);
  
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
    
    // Reset page when search changes
    setPage(1);
    
    // Navigate with new search params
    router.push(`/search?${urlParams.toString()}`);
  };
  
  // Handle sort change
  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };
  
  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle card click
  const handleCardClick = (post: Post) => {
    // Navigate to appropriate analysis page based on post content
    if (post.content && post.content.length > 1000) {
      router.push(`/topics?postId=${post.id}`);
    } else if (post.sentiment !== undefined) {
      router.push(`/sentiment?postId=${post.id}`);
    } else {
      router.push(`/timeseries?subreddit=${post.subreddit}`);
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  // Sort posts based on selected option
  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'comments':
        return b.comments - a.comments;
      case 'score':
        return (b.score || 0) - (a.score || 0);
      case 'sentiment':
        return (b.sentiment || 0) - (a.sentiment || 0);
      default:
        // 'relevance' - keep original order
        return 0;
    }
  });
  
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
          defaultValues={getSearchParamsObject()}
        />
      )}
      
      {/* Results Header */}
      {!loading && posts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Showing {posts.length} of {totalPosts} results
            {searchParams.get('keyword') && (
              <span> for "<strong>{searchParams.get('keyword')}</strong>"</span>
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
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {!loading && error && (
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading && !error && posts.length === 0 && (
        <Alert severity="info" sx={{ my: 4 }}>
          No results match your search criteria. Try adjusting your filters or search for different keywords.
        </Alert>
      )}
      
      {/* Search tips when there are no results and a filter is applied */}
      {!loading && !error && posts.length === 0 && Object.keys(getSearchParamsObject()).length > 0 && (
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
      {!loading && !error && posts.length > 0 && (
        <>
          <Grid container spacing={3}>
            {sortedPosts.map((post) => (
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
                  component={Link}
                  href={`/sentiment?${searchParams.toString()}`}
                >
                  Sentiment Analysis
                </Button>
              </Grid>
              
              <Grid item>
                <Button 
                  variant="outlined" 
                  startIcon={<ForumIcon />}
                  component={Link}
                  href={`/topics?${searchParams.toString()}`}
                >
                  Topic Modeling
                </Button>
              </Grid>
              
              <Grid item>
                <Button 
                  variant="outlined" 
                  startIcon={<TrendingUpIcon />}
                  component={Link}
                  href={`/timeseries?${searchParams.toString()}`}
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
} 