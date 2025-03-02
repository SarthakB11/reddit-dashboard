'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  LinearProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ForumIcon from '@mui/icons-material/Forum';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SendIcon from '@mui/icons-material/Send';
import TagIcon from '@mui/icons-material/Tag';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

// Define interfaces for AI insights data
interface Insight {
  id: number;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  relatedSubreddits: string[];
  date: string;
}

interface AIQuestion {
  id: number;
  question: string;
  answer: string;
  date: string;
}

interface Topic {
  name: string;
  keywords: string[];
  post_count: number;
  sentiment: string;
}

interface TimeTrends {
  peak_period?: string;
  growth_rate?: string;
  most_active_times?: string;
  seasonal_patterns?: string;
}

interface EngagementPatterns {
  most_engaging_content?: string;
  controversial_topics?: string[];
  user_participation?: string;
}

interface ContentQuality {
  source_diversity?: string;
  factual_accuracy?: string;
  echo_chamber_index?: string;
}

interface AIInsightsData {
  summary: string;
  total_posts: number;
  date_range: {
    start: string;
    end: string;
  };
  sentiment: string;
  top_subreddits: Array<{ name: string; count: number }>;
  topics?: Topic[];
  time_trends?: TimeTrends;
  engagement_patterns?: EngagementPatterns;
  content_quality?: ContentQuality;
  recommendations?: string[];
  error?: string;
}

// API Status component
const ApiStatus = ({ status }: { status: 'connected' | 'disconnected' | 'loading' }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor:
            status === 'connected'
              ? 'success.main'
              : status === 'loading'
              ? 'warning.main'
              : 'error.main',
          mr: 1,
        }}
      />
      <Typography variant="body2" color="text.secondary">
        API Status:{' '}
        {status === 'connected'
          ? 'Connected'
          : status === 'loading'
          ? 'Loading...'
          : 'Disconnected'}
      </Typography>
    </Box>
  );
};

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [aiData, setAIData] = useState<AIInsightsData | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionResponse, setQuestionResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search parameters
  const [keyword, setKeyword] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [domain, setDomain] = useState('');
  
  useEffect(() => {
    // Check API health
    checkApiHealth();
  }, []);
  
  const checkApiHealth = async () => {
    try {
      setApiStatus('loading');
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch (error) {
      setApiStatus('disconnected');
    }
  };
  
  const fetchInsights = async () => {
    if (!keyword && !subreddit && !domain) {
      setError('Please provide at least one search parameter (keyword, subreddit, or domain)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (subreddit) params.append('subreddit', subreddit);
      if (domain) params.append('domain', domain);
      
      const response = await fetch(`http://localhost:5000/api/ai/insights?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch insights');
      }
      
      const data = await response.json();
      setAIData(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setAIData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };
  
  const handleSubredditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubreddit(event.target.value);
  };
  
  const handleDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(event.target.value);
  };
  
  const handleSearch = () => {
    fetchInsights();
  };
  
  const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserQuestion(event.target.value);
  };
  
  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    setIsAskingQuestion(true);
    setQuestionResponse(null);
    
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate a response based on the question
      
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a response based on the available data
      let response = "Based on the available data, ";
      
      if (aiData) {
        if (userQuestion.toLowerCase().includes('trend')) {
          if (aiData.time_trends?.growth_rate) {
            response += `I can tell you that there's been a ${aiData.time_trends.growth_rate} in posts. `;
          }
          if (aiData.topics && aiData.topics.length > 0) {
            response += `The most discussed topic is "${aiData.topics[0].name}" with ${aiData.topics[0].post_count} posts. `;
          }
        } else if (userQuestion.toLowerCase().includes('sentiment')) {
          response += `the overall sentiment is ${aiData.sentiment}. `;
          if (aiData.topics) {
            const sentiments = aiData.topics.map(t => t.sentiment);
            const uniqueSentiments = [...new Set(sentiments)];
            if (uniqueSentiments.length > 1) {
              response += `Different topics show varying sentiments including ${uniqueSentiments.join(', ')}. `;
            }
          }
        } else if (userQuestion.toLowerCase().includes('recommend') || userQuestion.toLowerCase().includes('suggest')) {
          if (aiData.recommendations && aiData.recommendations.length > 0) {
            response += `I would recommend: ${aiData.recommendations[0]} `;
            if (aiData.recommendations.length > 1) {
              response += `and ${aiData.recommendations[1]}`;
            }
          } else {
            response += "I don't have specific recommendations based on the current data.";
          }
        } else {
          response += `I found ${aiData.total_posts} posts from ${aiData.date_range.start} to ${aiData.date_range.end}. `;
          if (aiData.top_subreddits && aiData.top_subreddits.length > 0) {
            response += `The most active subreddit is r/${aiData.top_subreddits[0].name} with ${aiData.top_subreddits[0].count} posts. `;
          }
        }
      } else {
        response = "I don't have enough data to answer your question. Please run an analysis first by entering search parameters and clicking 'Generate Insights'.";
      }
      
      setQuestionResponse(response);
    } catch (error) {
      setQuestionResponse("I'm sorry, I encountered an error while processing your question. Please try again later.");
    } finally {
      setIsAskingQuestion(false);
    }
  };
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUpIcon sx={{ color: 'primary.main' }} />;
      case 'anomaly':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'prediction':
        return <AutoAwesomeIcon sx={{ color: 'secondary.main' }} />;
      case 'recommendation':
        return <LightbulbIcon sx={{ color: 'success.main' }} />;
      default:
        return <AutoAwesomeIcon sx={{ color: 'primary.main' }} />;
    }
  };
  
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'primary';
      case 'anomaly':
        return 'warning';
      case 'prediction':
        return 'secondary';
      case 'recommendation':
        return 'success';
      default:
        return 'primary';
    }
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success.main';
      case 'slightly positive':
        return 'success.light';
      case 'negative':
        return 'error.main';
      case 'slightly negative':
        return 'error.light';
      case 'neutral':
        return 'info.main';
      case 'mixed':
        return 'warning.main';
      case 'polarized':
        return 'secondary.main';
      case 'concerned':
        return 'warning.dark';
      default:
        return 'text.primary';
    }
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
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Insights
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Leverage advanced AI analysis to uncover hidden patterns, trends, and opportunities in social media data.
      </Typography>
      
      <ApiStatus status={apiStatus} />
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SearchIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Generate Insights
          </Typography>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Keyword"
              variant="outlined"
              value={keyword}
              onChange={handleKeywordChange}
              placeholder="Enter a keyword"
              helperText="Search in post titles and content"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Subreddit"
              variant="outlined"
              value={subreddit}
              onChange={handleSubredditChange}
              placeholder="Enter a subreddit"
              helperText="Filter by specific subreddit"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Domain"
              variant="outlined"
              value={domain}
              onChange={handleDomainChange}
              placeholder="Enter a domain"
              helperText="Filter by source domain"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading || (!keyword && !subreddit && !domain)}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
          >
            {loading ? 'Generating...' : 'Generate Insights'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PsychologyIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Ask the AI Assistant
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          label="Ask a question about the data"
          variant="outlined"
          value={userQuestion}
          onChange={handleQuestionChange}
          placeholder="e.g., What are the main trends in this data?"
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAskQuestion}
            disabled={isAskingQuestion || !userQuestion.trim() || !aiData}
            startIcon={isAskingQuestion ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            {isAskingQuestion ? 'Processing...' : 'Ask Question'}
          </Button>
        </Box>
        
        {questionResponse && (
          <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
            <Typography variant="body1">{questionResponse}</Typography>
          </Paper>
        )}
      </Paper>
      
      {loading ? (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Analyzing data and generating insights...
          </Typography>
        </Box>
      ) : aiData ? (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {aiData.summary}
            </Typography>
          </Paper>
          
          {aiData.topics && aiData.topics.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Key Topics
              </Typography>
              <Grid container spacing={2}>
                {aiData.topics.map((topic, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {topic.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Sentiment:
                          </Typography>
                          <Typography variant="body2" sx={{ color: getSentimentColor(topic.sentiment) }}>
                            {topic.sentiment.charAt(0).toUpperCase() + topic.sentiment.slice(1)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {topic.post_count} posts
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {topic.keywords.map((keyword, i) => (
                            <Chip
                              key={i}
                              label={keyword}
                              size="small"
                              icon={<TagIcon />}
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          <Grid container spacing={3}>
            {aiData.time_trends && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Time Trends</Typography>
                  </Box>
                  <List>
                    {aiData.time_trends.peak_period && (
                      <ListItem>
                        <ListItemText
                          primary="Peak Period"
                          secondary={aiData.time_trends.peak_period}
                        />
                      </ListItem>
                    )}
                    {aiData.time_trends.growth_rate && (
                      <ListItem>
                        <ListItemText
                          primary="Growth Rate"
                          secondary={aiData.time_trends.growth_rate}
                        />
                      </ListItem>
                    )}
                    {aiData.time_trends.most_active_times && (
                      <ListItem>
                        <ListItemText
                          primary="Most Active Times"
                          secondary={aiData.time_trends.most_active_times}
                        />
                      </ListItem>
                    )}
                    {aiData.time_trends.seasonal_patterns && (
                      <ListItem>
                        <ListItemText
                          primary="Seasonal Patterns"
                          secondary={aiData.time_trends.seasonal_patterns}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
            )}
            
            {aiData.engagement_patterns && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GroupIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h6">Engagement Patterns</Typography>
                  </Box>
                  <List>
                    {aiData.engagement_patterns.most_engaging_content && (
                      <ListItem>
                        <ListItemText
                          primary="Most Engaging Content"
                          secondary={aiData.engagement_patterns.most_engaging_content}
                        />
                      </ListItem>
                    )}
                    {aiData.engagement_patterns.controversial_topics && (
                      <ListItem>
                        <ListItemText
                          primary="Controversial Topics"
                          secondary={aiData.engagement_patterns.controversial_topics.join(', ')}
                        />
                      </ListItem>
                    )}
                    {aiData.engagement_patterns.user_participation && (
                      <ListItem>
                        <ListItemText
                          primary="User Participation"
                          secondary={aiData.engagement_patterns.user_participation}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
            )}
          </Grid>
          
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            {aiData.content_quality && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">Content Quality</Typography>
                  </Box>
                  <List>
                    {aiData.content_quality.source_diversity && (
                      <ListItem>
                        <ListItemText
                          primary="Source Diversity"
                          secondary={aiData.content_quality.source_diversity}
                        />
                      </ListItem>
                    )}
                    {aiData.content_quality.factual_accuracy && (
                      <ListItem>
                        <ListItemText
                          primary="Factual Accuracy"
                          secondary={aiData.content_quality.factual_accuracy}
                        />
                      </ListItem>
                    )}
                    {aiData.content_quality.echo_chamber_index && (
                      <ListItem>
                        <ListItemText
                          primary="Echo Chamber Index"
                          secondary={aiData.content_quality.echo_chamber_index}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
            )}
            
            {aiData.recommendations && aiData.recommendations.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LightbulbIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Recommendations</Typography>
                  </Box>
                  <List>
                    {aiData.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <VerifiedIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Insights Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter search parameters above and click "Generate Insights" to analyze the data.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}