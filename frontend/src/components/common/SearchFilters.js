import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useData } from '../../context/DataContext';
import useDebounce from '../../hooks/useDebounce';

const SearchFilters = ({ onSearch, showAdvanced = true, initialExpanded = false }) => {
  const theme = useTheme();
  const { searchParams, updateSearchParams } = useData();
  
  const [expanded, setExpanded] = useState(initialExpanded);
  const [keyword, setKeyword] = useState(searchParams.keyword || '');
  const [subreddit, setSubreddit] = useState(searchParams.subreddit || '');
  const [domain, setDomain] = useState(searchParams.domain || '');
  const [author, setAuthor] = useState(searchParams.author || '');
  const [startDate, setStartDate] = useState(searchParams.startDate ? new Date(searchParams.startDate) : null);
  const [endDate, setEndDate] = useState(searchParams.endDate ? new Date(searchParams.endDate) : null);
  
  const debouncedKeyword = useDebounce(keyword, 300);
  
  // Update component state when searchParams changes
  useEffect(() => {
    setKeyword(searchParams.keyword || '');
    setSubreddit(searchParams.subreddit || '');
    setDomain(searchParams.domain || '');
    setAuthor(searchParams.author || '');
    setStartDate(searchParams.startDate ? new Date(searchParams.startDate) : null);
    setEndDate(searchParams.endDate ? new Date(searchParams.endDate) : null);
  }, [searchParams]);
  
  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    
    const params = {
      keyword,
      subreddit,
      domain,
      author,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    };
    
    updateSearchParams(params);
    
    if (onSearch) {
      onSearch(params);
    }
  };
  
  // Handle clearing all filters
  const handleClearFilters = () => {
    setKeyword('');
    setSubreddit('');
    setDomain('');
    setAuthor('');
    setStartDate(null);
    setEndDate(null);
    
    const emptyParams = {
      keyword: '',
      subreddit: '',
      domain: '',
      author: '',
      startDate: '',
      endDate: '',
    };
    
    updateSearchParams(emptyParams);
    
    if (onSearch) {
      onSearch(emptyParams);
    }
  };
  
  // Toggle advanced filters visibility
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Get the active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (keyword) count++;
    if (subreddit) count++;
    if (domain) count++;
    if (author) count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Search & Filter
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
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
                    onClick={() => setKeyword('')}
                    aria-label="clear keyword"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
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
                    onClick={() => setSubreddit('')}
                    aria-label="clear subreddit"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Domain"
              fullWidth
              variant="outlined"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. example.com"
              InputProps={{
                endAdornment: domain ? (
                  <IconButton 
                    size="small" 
                    onClick={() => setDomain('')}
                    aria-label="clear domain"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null,
              }}
            />
          </Grid>
        </Grid>
        
        {showAdvanced && (
          <>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 2, 
                cursor: 'pointer' 
              }}
              onClick={toggleExpanded}
            >
              <Typography variant="subtitle2" color="primary">
                {expanded ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </Typography>
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </Box>
            
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Author"
                    fullWidth
                    variant="outlined"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. username"
                    InputProps={{
                      endAdornment: author ? (
                        <IconButton 
                          size="small" 
                          onClick={() => setAuthor('')}
                          aria-label="clear author"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      ) : null,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4.5}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={setStartDate}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      maxDate={endDate || undefined}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={4.5}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={setEndDate}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={startDate || undefined}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Collapse>
          </>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            {getActiveFiltersCount() > 0 && (
              <Typography variant="body2" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center' }}>
                <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                Active Filters:
              </Typography>
            )}
            
            {keyword && (
              <Chip 
                label={`Keyword: ${keyword}`} 
                onDelete={() => setKeyword('')} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
            )}
            
            {subreddit && (
              <Chip 
                label={`Subreddit: ${subreddit}`} 
                onDelete={() => setSubreddit('')} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
            )}
            
            {domain && (
              <Chip 
                label={`Domain: ${domain}`} 
                onDelete={() => setDomain('')} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
            )}
            
            {author && (
              <Chip 
                label={`Author: ${author}`} 
                onDelete={() => setAuthor('')} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
            )}
            
            {startDate && (
              <Chip 
                label={`From: ${startDate.toLocaleDateString()}`} 
                onDelete={() => setStartDate(null)} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
            )}
            
            {endDate && (
              <Chip 
                label={`To: ${endDate.toLocaleDateString()}`} 
                onDelete={() => setEndDate(null)} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
            )}
          </Box>
          
          <Box>
            {getActiveFiltersCount() > 0 && (
              <Button 
                variant="outlined" 
                onClick={handleClearFilters} 
                sx={{ mr: 1 }}
              >
                Clear Filters
              </Button>
            )}
            
            <Button 
              variant="contained" 
              type="submit" 
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default SearchFilters;