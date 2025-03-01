import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { useData } from '../context/DataContext';
import SearchFilters from '../components/common/SearchFilters';

// Helper function to highlight keywords in text
const highlightKeywords = (text, keywords, theme) => {
  if (!keywords || keywords.length === 0 || !text) return text;
  
  let highlightedText = text;
  const color = theme.palette.mode === 'dark' ? '#ff9800' : '#f57c00';
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span style="background-color: ${color}30; color: ${color}; font-weight: 500; padding: 0 2px; border-radius: 2px;">$1</span>`);
  });
  
  return highlightedText;
};

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// AI Summary component
const AISummary = () => {
  const theme = useTheme();
  const { aiSummary, loading, errors, fetchAISummary, searchParams } = useData();
  
  const [tabValue, setTabValue] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [promptSubmitted, setPromptSubmitted] = useState(false);
  
  // Define tab labels and corresponding summary types
  const tabs = [
    { label: 'Key Insights', type: 'insights' },
    { label: 'Audience Analysis', type: 'audience' },
    { label: 'Trend Report', type: 'trends' },
    { label: 'Content Ideas', type: 'content_ideas' },
    { label: 'Custom Query', type: 'custom' },
  ];
  
  // Fetch initial summary data when component mounts
  useEffect(() => {
    if (!aiSummary) {
      fetchAISummary({}, tabs[0].type);
    }
  }, [fetchAISummary, aiSummary, tabs]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPromptSubmitted(false);
    
    // Don't fetch for custom tab until prompt is submitted
    if (tabs[newValue].type !== 'custom') {
      fetchAISummary(searchParams, tabs[newValue].type);
    }
  };
  
  // Handle search submission
  const handleSearch = (params) => {
    fetchAISummary(params, tabs[tabValue].type, tabValue === 4 ? customPrompt : undefined);
  };
  
  // Handle custom prompt submission
  const handlePromptSubmit = () => {
    if (customPrompt.trim()) {
      fetchAISummary(searchParams, 'custom', customPrompt);
      setPromptSubmitted(true);
    }
  };
  
  // Handle refresh for current tab
  const handleRefresh = () => {
    fetchAISummary(
      searchParams, 
      tabs[tabValue].type,
      tabValue === 4 ? customPrompt : undefined
    );
  };
  
  // Handle copy to clipboard
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };
  
  // Handle save/unsave summary
  const handleSaveToggle = (summary) => {
    const isSaved = savedSummaries.some(s => s.id === summary.id);
    
    if (isSaved) {
      setSavedSummaries(savedSummaries.filter(s => s.id !== summary.id));
    } else {
      setSavedSummaries([...savedSummaries, summary]);
    }
  };
  
  // Check if current summary is saved
  const isSummarySaved = (summary) => {
    return savedSummaries.some(s => s.id === summary.id);
  };
  
  // Extract keywords for highlighting
  const extractKeywords = () => {
    if (!aiSummary) return [];
    
    // From search params
    const keywords = [];
    if (searchParams && searchParams.keyword) {
      keywords.push(...searchParams.keyword.split(' ').filter(k => k.length > 3));
    }
    
    // From summary tags if available
    if (aiSummary.tags && Array.isArray(aiSummary.tags)) {
      keywords.push(...aiSummary.tags);
    }
    
    return [...new Set(keywords)];
  };
  
  // Get current summary based on active tab
  const getCurrentSummary = () => {
    if (!aiSummary) return null;
    
    if (tabValue === 4) {
      return aiSummary.custom_response;
    }
    
    switch (tabs[tabValue].type) {
      case 'insights':
        return aiSummary.key_insights;
      case 'audience':
        return aiSummary.audience_analysis;
      case 'trends':
        return aiSummary.trend_report;
      case 'content_ideas':
        return aiSummary.content_ideas;
      default:
        return null;
    }
  };
  
  // Format the current summary for display
  const formatSummary = (summary) => {
    if (!summary) return null;
    
    // If summary is an array, join with line breaks
    if (Array.isArray(summary)) {
      return summary.join('\n\n');
    }
    
    // If summary is a string, return as is
    if (typeof summary === 'string') {
      return summary;
    }
    
    // If summary is an object with sections
    if (typeof summary === 'object' && summary !== null) {
      let formattedText = '';
      
      Object.entries(summary).forEach(([key, value]) => {
        const title = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        formattedText += `<strong>${title}</strong>\n\n`;
        
        if (Array.isArray(value)) {
          formattedText += value.join('\n\n');
        } else {
          formattedText += value;
        }
        
        formattedText += '\n\n';
      });
      
      return formattedText;
    }
    
    return JSON.stringify(summary, null, 2);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        AI Summary & Insights
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Leverage artificial intelligence to extract insights, identify trends, and generate summaries from the social media data.
      </Typography>
      
      <SearchFilters onSearch={handleSearch} initialExpanded={false} />
      
      <Paper sx={{ mt: 4, mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={tab.type} 
              label={tab.label} 
              id={`ai-tab-${index}`}
              aria-controls={`ai-tabpanel-${index}`}
            />
          ))}
        </Tabs>
        
        {/* Loading state */}
        {loading.aiSummary && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Error state */}
        {!loading.aiSummary && errors.aiSummary && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Error loading AI summary: {errors.aiSummary}
            </Alert>
          </Box>
        )}
        
        {/* Empty state */}
        {!loading.aiSummary && !errors.aiSummary && (!aiSummary || !getCurrentSummary()) && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">
              {tabValue === 4 && !promptSubmitted
                ? 'Enter your query to get AI-generated insights.'
                : 'No AI summary data available for the current selection. Try adjusting your search criteria.'}
            </Alert>
          </Box>
        )}
        
        {/* Content for each tab */}
        {tabs.map((tab, index) => (
          <TabPanel key={tab.type} value={tabValue} index={index}>
            {/* Custom prompt input for the Custom tab */}
            {index === 4 && (
              <Box sx={{ px: 3, pb: 2 }}>
                <TextField
                  label="Enter your custom query"
                  placeholder="Example: What are the main concerns users have about this topic? or Analyze the emotional responses to the latest feature update."
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="contained" 
                  onClick={handlePromptSubmit} 
                  disabled={!customPrompt.trim() || loading.aiSummary}
                >
                  Submit Query
                </Button>
              </Box>
            )}
            
            {/* Summary content */}
            {!loading.aiSummary && !errors.aiSummary && aiSummary && getCurrentSummary() && (
              <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {searchParams && searchParams.keyword 
                      ? `Results for "${searchParams.keyword}"`
                      : 'Based on all available data'}
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Refresh analysis">
                      <IconButton onClick={handleRefresh}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={isSummarySaved({ id: tab.type, content: getCurrentSummary() }) ? 'Remove from saved' : 'Save summary'}>
                      <IconButton onClick={() => handleSaveToggle({ id: tab.type, content: getCurrentSummary() })}>
                        {isSummarySaved({ id: tab.type, content: getCurrentSummary() }) ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Copy to clipboard">
                      <IconButton onClick={() => handleCopy(getCurrentSummary(), index)}>
                        {copiedIndex === index ? <DoneIcon color="success" /> : <ContentCopyIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                {/* Tags if available */}
                {aiSummary.tags && Array.isArray(aiSummary.tags) && aiSummary.tags.length > 0 && (
                  <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <LocalOfferIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    {aiSummary.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                )}
                
                {/* Format the summary content with proper styling */}
                <Typography 
                  component="div" 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: 1.7, 
                    '& p': {
                      marginBottom: 2,
                    },
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightKeywords(formatSummary(getCurrentSummary()), extractKeywords(), theme) 
                  }}
                />
                
                {/* Metadata if available */}
                {aiSummary.metadata && (
                  <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Analysis based on {aiSummary.metadata.post_count} posts from {aiSummary.metadata.date_range}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Generated on {new Date(aiSummary.metadata.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </TabPanel>
        ))}
      </Paper>
      
      {/* Saved Summaries Section */}
      {savedSummaries.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <BookmarkIcon sx={{ mr: 1 }} /> Saved Insights
          </Typography>
          
          <Grid container spacing={3}>
            {savedSummaries.map((summary, index) => (
              <Grid item xs={12} key={`${summary.id}-${index}`}>
                <Card sx={{ position: 'relative' }}>
                  <CardHeader 
                    title={tabs.find(t => t.type === summary.id)?.label || 'Custom Insight'}
                    action={
                      <Box>
                        <Tooltip title="Remove from saved">
                          <IconButton onClick={() => handleSaveToggle(summary)}>
                            <BookmarkIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Copy to clipboard">
                          <IconButton onClick={() => handleCopy(summary.content, `saved-${index}`)}>
                            {copiedIndex === `saved-${index}` ? <DoneIcon color="success" /> : <ContentCopyIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Typography 
                      component="div" 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: highlightKeywords(formatSummary(summary.content), extractKeywords(), theme) 
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AISummary;