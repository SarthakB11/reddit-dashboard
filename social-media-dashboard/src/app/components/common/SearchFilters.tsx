'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchParams {
  keyword?: string;
  subreddit?: string;
  domain?: string;
  author?: string;
}

interface SearchFiltersProps {
  onSearch?: (params: SearchParams) => void;
  showAdvanced?: boolean;
  initialExpanded?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  showAdvanced = true,
  initialExpanded = false,
}) => {
  const [keyword, setKeyword] = useState('');
  const [subreddit, setSubreddit] = useState('');
  
  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const params: SearchParams = {
      keyword: keyword || undefined,
      subreddit: subreddit || undefined,
    };
    
    if (onSearch) {
      onSearch(params);
    }
  };
  
  // Handle clearing keyword
  const handleClearKeyword = () => {
    setKeyword('');
  };
  
  // Handle clearing subreddit
  const handleClearSubreddit = () => {
    setSubreddit('');
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Search & Filter
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Keyword"
            fullWidth
            variant="outlined"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by keyword or phrase..."
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: keyword ? (
                <IconButton 
                  size="small" 
                  onClick={handleClearKeyword}
                  aria-label="clear keyword"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null,
            }}
          />
          
          {showAdvanced && (
            <TextField
              label="Subreddit"
              fullWidth
              variant="outlined"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              placeholder="e.g. AskReddit"
              InputProps={{
                endAdornment: subreddit ? (
                  <IconButton 
                    size="small" 
                    onClick={handleClearSubreddit}
                    aria-label="clear subreddit"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null,
              }}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {keyword && (
              <Chip 
                label={`Keyword: ${keyword}`} 
                onDelete={handleClearKeyword} 
                size="small" 
                sx={{ mr: 1 }} 
              />
            )}
            
            {subreddit && showAdvanced && (
              <Chip 
                label={`Subreddit: ${subreddit}`} 
                onDelete={handleClearSubreddit} 
                size="small" 
              />
            )}
          </Box>
          
          <Button 
            variant="contained" 
            type="submit" 
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SearchFilters;
