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
  ButtonGroup,
  CircularProgress,
  Divider,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TimelineIcon from '@mui/icons-material/Timeline';
import ForumIcon from '@mui/icons-material/Forum';

// Define interfaces for sentiment data
interface SentimentPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SubredditSentiment {
  name: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  score: number; // -1 to 1 scale
}

interface SentimentData {
  overall: {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
    score: number; // -1 to 1 scale
  };
  timeData: SentimentPoint[];
  subreddits: SubredditSentiment[];
}

// Function to generate mock sentiment data
const generateMockSentimentData = (): SentimentData => {
  // Create time series data
  const timeData: SentimentPoint[] = [];
  const dates = [
    'Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 
    'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10'
  ];
  
  // Generate realistic sentiment patterns
  let positiveTrend = 30;
  let neutralTrend = 50;
  let negativeTrend = 20;
  
  dates.forEach(date => {
    // Add some randomness but maintain a general trend
    const positiveChange = Math.random() * 10 - 3; // Slight upward bias
    const negativeChange = Math.random() * 8 - 2; // Slight downward bias
    
    positiveTrend = Math.max(10, Math.min(60, positiveTrend + positiveChange));
    negativeTrend = Math.max(5, Math.min(50, negativeTrend + negativeChange));
    neutralTrend = 100 - positiveTrend - negativeTrend;
    
    timeData.push({
      date,
      positive: Math.round(positiveTrend),
      neutral: Math.round(neutralTrend),
      negative: Math.round(negativeTrend)
    });
  });
  
  // Create subreddit sentiment data
  const subreddits: SubredditSentiment[] = [
    {
      name: 'technology',
      positive: 45,
      neutral: 40,
      negative: 15,
      total: 450,
      score: 0.3
    },
    {
      name: 'politics',
      positive: 25,
      neutral: 30,
      negative: 45,
      total: 380,
      score: -0.2
    },
    {
      name: 'science',
      positive: 55,
      neutral: 35,
      negative: 10,
      total: 320,
      score: 0.45
    },
    {
      name: 'news',
      positive: 30,
      neutral: 40,
      negative: 30,
      total: 280,
      score: 0
    },
    {
      name: 'worldnews',
      positive: 20,
      neutral: 45,
      negative: 35,
      total: 240,
      score: -0.15
    },
  ];
  
  // Calculate overall sentiment
  const totalPosts = subreddits.reduce((sum, sr) => sum + sr.total, 0);
  const weightedPositive = subreddits.reduce((sum, sr) => sum + (sr.positive * sr.total), 0) / totalPosts;
  const weightedNeutral = subreddits.reduce((sum, sr) => sum + (sr.neutral * sr.total), 0) / totalPosts;
  const weightedNegative = subreddits.reduce((sum, sr) => sum + (sr.negative * sr.total), 0) / totalPosts;
  
  return {
    overall: {
      positive: Math.round(weightedPositive),
      neutral: Math.round(weightedNeutral),
      negative: Math.round(weightedNegative),
      total: totalPosts,
      score: (weightedPositive - weightedNegative) / 100
    },
    timeData,
    subreddits
  };
};

export default function SentimentAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState<'stacked' | 'line'>('stacked');
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('all');
  
  useEffect(() => {
    // Simulate API call with timeout
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        const data = generateMockSentimentData();
        setSentimentData(data);
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleChartTypeChange = (type: 'stacked' | 'line') => {
    setChartType(type);
  };
  
  const handleSubredditChange = (event: SelectChangeEvent) => {
    setSelectedSubreddit(event.target.value);
  };
  
  const getSentimentIcon = (sentiment: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    const iconProps = { 
      fontSize: size,
      sx: { 
        color: sentiment === 'positive' ? 'success.main' : 
               sentiment === 'negative' ? 'error.main' : 'info.main'
      }
    };
    
    switch (sentiment) {
      case 'positive':
        return <SentimentSatisfiedAltIcon {...iconProps} />;
      case 'negative':
        return <SentimentVeryDissatisfiedIcon {...iconProps} />;
      default:
        return <SentimentNeutralIcon {...iconProps} />;
    }
  };
  
  const getSentimentColor = (score: number) => {
    if (score > 0.2) return 'success.main';
    if (score < -0.2) return 'error.main';
    return 'info.main';
  };
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sentiment Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze the emotional tone of social media content to understand public perception and reactions.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="sentiment analysis tabs">
            <Tab label="Overview" />
            <Tab label="Time Trends" />
            <Tab label="Subreddit Comparison" />
          </Tabs>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 1: Overview */}
            {tabValue === 0 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Overall Sentiment
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 4 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            {getSentimentIcon('positive', 'large')}
                            <Typography variant="h5" color="success.main">
                              {sentimentData?.overall.positive}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Positive
                            </Typography>
                          </Box>
                          
                          <Box sx={{ textAlign: 'center' }}>
                            {getSentimentIcon('neutral', 'large')}
                            <Typography variant="h5" color="info.main">
                              {sentimentData?.overall.neutral}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Neutral
                            </Typography>
                          </Box>
                          
                          <Box sx={{ textAlign: 'center' }}>
                            {getSentimentIcon('negative', 'large')}
                            <Typography variant="h5" color="error.main">
                              {sentimentData?.overall.negative}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Negative
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Overall Sentiment Score
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ color: getSentimentColor(sentimentData?.overall.score || 0) }}
                            >
                              {sentimentData?.overall.score.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              (-1 to 1 scale)
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Sentiment Distribution
                        </Typography>
                        
                        {/* Placeholder for sentiment distribution chart */}
                        <Box 
                          sx={{ 
                            height: 200, 
                            bgcolor: 'action.hover', 
                            borderRadius: 1, 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            Sentiment Distribution Chart Placeholder
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          The sentiment analysis shows a generally {sentimentData?.overall.score && sentimentData.overall.score > 0 ? 'positive' : sentimentData?.overall.score && sentimentData.overall.score < 0 ? 'negative' : 'neutral'} tone across analyzed content, with {sentimentData?.overall.positive}% positive, {sentimentData?.overall.neutral}% neutral, and {sentimentData?.overall.negative}% negative sentiment.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top Positive and Negative Subreddits
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <SentimentSatisfiedAltIcon sx={{ mr: 1, color: 'success.main' }} />
                            Most Positive Subreddits
                          </Typography>
                          
                          <Divider sx={{ mb: 2 }} />
                          
                          {sentimentData?.subreddits
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 3)
                            .map((subreddit, index) => (
                              <Box key={subreddit.name} sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                                <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                                
                                <Typography variant="body1" sx={{ minWidth: 120 }}>
                                  r/{subreddit.name}
                                </Typography>
                                
                                <Box sx={{ flexGrow: 1, mx: 2 }}>
                                  <Box 
                                    sx={{ 
                                      height: 8, 
                                      bgcolor: 'success.main',
                                      width: `${(subreddit.score + 1) / 2 * 100}%`,
                                      borderRadius: 1,
                                    }} 
                                  />
                                </Box>
                                
                                <Typography variant="body2" sx={{ color: 'success.main' }}>
                                  {subreddit.score.toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <SentimentVeryDissatisfiedIcon sx={{ mr: 1, color: 'error.main' }} />
                            Most Negative Subreddits
                          </Typography>
                          
                          <Divider sx={{ mb: 2 }} />
                          
                          {sentimentData?.subreddits
                            .sort((a, b) => a.score - b.score)
                            .slice(0, 3)
                            .map((subreddit, index) => (
                              <Box key={subreddit.name} sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                                <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                                
                                <Typography variant="body1" sx={{ minWidth: 120 }}>
                                  r/{subreddit.name}
                                </Typography>
                                
                                <Box sx={{ flexGrow: 1, mx: 2 }}>
                                  <Box 
                                    sx={{ 
                                      height: 8, 
                                      bgcolor: 'error.main',
                                      width: `${(1 - (subreddit.score + 1) / 2) * 100}%`,
                                      borderRadius: 1,
                                    }} 
                                  />
                                </Box>
                                
                                <Typography variant="body2" sx={{ color: 'error.main' }}>
                                  {subreddit.score.toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
            
            {/* Tab 2: Time Trends */}
            {tabValue === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Sentiment Over Time
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <ButtonGroup variant="outlined" size="small">
                      <Button 
                        onClick={() => handleChartTypeChange('stacked')}
                        variant={chartType === 'stacked' ? 'contained' : 'outlined'}
                      >
                        Stacked
                      </Button>
                      <Button 
                        onClick={() => handleChartTypeChange('line')}
                        variant={chartType === 'line' ? 'contained' : 'outlined'}
                      >
                        Line
                      </Button>
                    </ButtonGroup>
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel id="subreddit-select-label">Subreddit</InputLabel>
                      <Select
                        labelId="subreddit-select-label"
                        value={selectedSubreddit}
                        label="Subreddit"
                        onChange={handleSubredditChange}
                      >
                        <MenuItem value="all">All Subreddits</MenuItem>
                        {sentimentData?.subreddits.map(subreddit => (
                          <MenuItem key={subreddit.name} value={subreddit.name}>
                            r/{subreddit.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {/* Placeholder for time series chart */}
                <Box 
                  sx={{ 
                    height: 300, 
                    bgcolor: 'action.hover', 
                    borderRadius: 1, 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    <TimelineIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
                    Sentiment Time Series Chart Placeholder ({chartType} view)
                  </Typography>
                </Box>
                
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Observations
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      Based on the sentiment trends over time, we can observe:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        icon={<SentimentSatisfiedAltIcon />} 
                        label="Increasing positive sentiment" 
                        color="success" 
                        variant="outlined" 
                      />
                      <Chip 
                        icon={<TimelineIcon />} 
                        label="Weekend sentiment spikes" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        icon={<SentimentVeryDissatisfiedIcon />} 
                        label="Decreasing negative sentiment" 
                        color="error" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Typography variant="body1">
                      The data shows a gradual improvement in sentiment over the analyzed period, with positive sentiment
                      increasing from {sentimentData?.timeData[0].positive}% to {sentimentData?.timeData[sentimentData.timeData.length - 1].positive}%.
                      Negative sentiment has decreased from {sentimentData?.timeData[0].negative}% to {sentimentData?.timeData[sentimentData.timeData.length - 1].negative}%.
                      Weekend days typically show higher positive sentiment compared to weekdays.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
            
            {/* Tab 3: Subreddit Comparison */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Sentiment Comparison Across Subreddits
                </Typography>
                
                {/* Placeholder for subreddit comparison chart */}
                <Box 
                  sx={{ 
                    height: 300, 
                    bgcolor: 'action.hover', 
                    borderRadius: 1, 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Subreddit Comparison Chart Placeholder
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {sentimentData?.subreddits.map(subreddit => (
                    <Grid item xs={12} sm={6} md={4} key={subreddit.name}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                            r/{subreddit.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                              Sentiment:
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: getSentimentColor(subreddit.score)
                              }}
                            >
                              {subreddit.score.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <SentimentSatisfiedAltIcon sx={{ fontSize: 'small', color: 'success.main', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Positive:
                              </Typography>
                              <Box sx={{ flexGrow: 1, mx: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: 6, 
                                    bgcolor: 'success.main',
                                    width: `${subreddit.positive}%`,
                                    borderRadius: 1,
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2">
                                {subreddit.positive}%
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <SentimentNeutralIcon sx={{ fontSize: 'small', color: 'info.main', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Neutral:
                              </Typography>
                              <Box sx={{ flexGrow: 1, mx: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: 6, 
                                    bgcolor: 'info.main',
                                    width: `${subreddit.neutral}%`,
                                    borderRadius: 1,
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2">
                                {subreddit.neutral}%
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SentimentVeryDissatisfiedIcon sx={{ fontSize: 'small', color: 'error.main', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Negative:
                              </Typography>
                              <Box sx={{ flexGrow: 1, mx: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: 6, 
                                    bgcolor: 'error.main',
                                    width: `${subreddit.negative}%`,
                                    borderRadius: 1,
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2">
                                {subreddit.negative}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="body2" color="text.secondary">
                            Total posts analyzed: {subreddit.total}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Based on the sentiment analysis, we can draw the following conclusions:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              icon={<SentimentSatisfiedAltIcon />} 
              label="Science subreddit most positive" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<SentimentVeryDissatisfiedIcon />} 
              label="Politics subreddit most negative" 
              color="error" 
              variant="outlined" 
            />
            <Chip 
              icon={<TimelineIcon />} 
              label="Overall positive trend" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
          
          <Typography variant="body1">
            The sentiment analysis reveals that r/science has the most positive sentiment with a score of {sentimentData?.subreddits.find(s => s.name === 'science')?.score.toFixed(2)},
            while r/politics shows the most negative sentiment at {sentimentData?.subreddits.find(s => s.name === 'politics')?.score.toFixed(2)}.
            Overall, the content analyzed shows a slightly {sentimentData?.overall.score && sentimentData.overall.score > 0 ? 'positive' : sentimentData?.overall.score && sentimentData.overall.score < 0 ? 'negative' : 'neutral'} tone
            with a score of {sentimentData?.overall.score.toFixed(2)}.
            The trend over time indicates a gradual improvement in sentiment, suggesting increasing positivity in discussions.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 