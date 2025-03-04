'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Paper,
  Alert,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import LinkIcon from '@mui/icons-material/Link';

interface SearchResult {
  id: string;
  title: string;
  preview_text: string;
  author: string;
  subreddit: string;
  created_utc: string;
  score: number;
  num_comments: number;
  url: string;
  domain: string;
}

interface SearchResponse {
  total: number;
  offset: number;
  limit: number;
  posts: SearchResult[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const postsPerPage = 10;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/search?keyword=${encodeURIComponent(searchQuery)}&offset=${(page - 1) * postsPerPage}&limit=${postsPerPage}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Create a proper form event
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Social Media Content
      </Typography>
      
      <Paper component="form" onSubmit={handleSearch} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search for posts, topics, or trends
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Search query"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter keywords, topics, or phrases..."
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            disabled={isSearching}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try searching for topics like "climate change", "technology", or "politics"
        </Typography>
      </Paper>
      
      {isSearching && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {searchResults && searchResults.posts.length === 0 && !isSearching && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No results found for "{searchQuery}". Try different keywords or broaden your search.
        </Alert>
      )}
      
      {searchResults && searchResults.posts.length > 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {searchResults.total.toLocaleString()} results for "{searchQuery}"
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {searchResults.posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={`r/${post.subreddit}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={<ThumbUpIcon />}
                          label={post.score}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<ForumIcon />}
                          label={post.num_comments}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {post.title}
                    </Typography>
                    
                    {post.preview_text && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {post.preview_text}...
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {post.author}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {formatDate(post.created_utc)}
                      </Box>
                      
                      {post.domain && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {post.domain}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {searchResults.total > postsPerPage && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(searchResults.total / postsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
} 