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
  Avatar,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock search results
      const mockResults = [
        {
          id: '1',
          title: 'Discussion about climate change policies',
          content: 'Climate change is a pressing issue that requires immediate action. Many countries are implementing new policies to reduce carbon emissions.',
          author: 'environmentalist123',
          subreddit: 'environment',
          timestamp: '2023-12-15T14:30:00Z',
          comments: 45,
          score: 128,
        },
        {
          id: '2',
          title: 'New AI breakthrough in natural language processing',
          content: 'Researchers have developed a new AI model that can understand and generate human language with unprecedented accuracy.',
          author: 'tech_enthusiast',
          subreddit: 'technology',
          timestamp: '2023-12-14T09:15:00Z',
          comments: 72,
          score: 256,
        },
        {
          id: '3',
          title: 'The impact of social media on mental health',
          content: 'Studies show that excessive use of social media can have negative effects on mental health, particularly among teenagers.',
          author: 'health_advocate',
          subreddit: 'psychology',
          timestamp: '2023-12-13T18:45:00Z',
          comments: 89,
          score: 195,
        },
      ];

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
          <Typography variant="body1">Searching...</Typography>
        </Box>
      )}
      
      {hasSearched && !isSearching && searchResults.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No results found for "{searchQuery}". Try different keywords or broaden your search.
        </Alert>
      )}
      
      {searchResults.length > 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {searchResults.length} results for "{searchQuery}"
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {searchResults.map((result) => (
              <Grid item xs={12} key={result.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={`r/${result.subreddit}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {result.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {result.content}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {result.author}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {formatDate(result.timestamp)}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ForumIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {result.comments} comments
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
} 