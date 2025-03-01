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
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ForumIcon from '@mui/icons-material/Forum';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SendIcon from '@mui/icons-material/Send';

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

interface AIInsightsData {
  insights: Insight[];
  recentQuestions: AIQuestion[];
}

// Function to generate mock AI insights data
const generateMockAIInsightsData = (): AIInsightsData => {
  // Create insights
  const insights: Insight[] = [
    {
      id: 1,
      type: 'trend',
      title: 'Rising Interest in AI Ethics',
      description: 'There has been a 45% increase in discussions about AI ethics across technology and science subreddits in the past month. This trend correlates with recent news about AI regulation and several high-profile AI incidents.',
      confidence: 0.92,
      relatedSubreddits: ['technology', 'science', 'artificial', 'ethics'],
      date: '2023-03-15'
    },
    {
      id: 2,
      type: 'anomaly',
      title: 'Unusual Activity in Cryptocurrency Subreddits',
      description: 'Detected an unusual 300% spike in activity in cryptocurrency subreddits in the last 48 hours. This coincides with recent market volatility but shows patterns that differ from previous market events.',
      confidence: 0.85,
      relatedSubreddits: ['cryptocurrency', 'bitcoin', 'CryptoMarkets'],
      date: '2023-03-14'
    },
    {
      id: 3,
      type: 'prediction',
      title: 'Potential Viral Topic: Space Tourism',
      description: 'Based on early signal detection, discussions about space tourism are showing patterns similar to previous viral topics. There\'s a 78% probability this will become a major trending topic within the next 7-10 days.',
      confidence: 0.78,
      relatedSubreddits: ['space', 'Futurology', 'technology'],
      date: '2023-03-13'
    },
    {
      id: 4,
      type: 'recommendation',
      title: 'Content Opportunity: Renewable Energy',
      description: 'Analysis shows high engagement but relatively low content volume on renewable energy topics. This represents an opportunity for content creators to address this demand gap with educational or discussion-oriented content.',
      confidence: 0.88,
      relatedSubreddits: ['energy', 'RenewableEnergy', 'environment', 'science'],
      date: '2023-03-12'
    },
    {
      id: 5,
      type: 'trend',
      title: 'Declining Interest in NFTs',
      description: 'Conversations about NFTs have declined by 62% over the past three months across all monitored subreddits. Sentiment has also shifted from primarily positive to predominantly skeptical.',
      confidence: 0.94,
      relatedSubreddits: ['NFT', 'CryptoCurrency', 'technology', 'art'],
      date: '2023-03-11'
    },
    {
      id: 6,
      type: 'anomaly',
      title: 'Coordinated Information Campaign Detected',
      description: 'Our pattern recognition algorithms have identified what appears to be a coordinated information campaign about a new health supplement. Multiple accounts with similar behavior patterns are promoting the same product across health and fitness subreddits.',
      confidence: 0.81,
      relatedSubreddits: ['health', 'fitness', 'supplements', 'nutrition'],
      date: '2023-03-10'
    }
  ];
  
  // Create recent questions
  const recentQuestions: AIQuestion[] = [
    {
      id: 1,
      question: 'What topics are gaining the most traction in technology subreddits this week?',
      answer: 'This week, the fastest-growing topics in technology subreddits are quantum computing (up 78%), AI regulation (up 65%), and augmented reality applications (up 52%). Quantum computing discussions are primarily focused on recent breakthroughs in error correction, while AI regulation conversations center on the EU\'s proposed AI Act and its potential global implications.',
      date: '2023-03-15'
    },
    {
      id: 2,
      question: 'Is there any correlation between stock market movements and Reddit sentiment for major tech companies?',
      answer: 'Yes, our analysis shows a moderate correlation (r=0.62) between Reddit sentiment and stock price movements for major tech companies, with a typical lag of 1-2 trading days. This correlation is strongest for companies like Tesla and Apple, which have highly engaged online communities. However, the correlation weakens during major market-wide events or when company-specific news dominates the narrative.',
      date: '2023-03-14'
    },
    {
      id: 3,
      question: 'Which subreddits have the most balanced political discussions?',
      answer: 'Based on our analysis of political discourse across Reddit, the subreddits with the most balanced discussions (defined by representation of diverse viewpoints and civil discourse) are r/NeutralPolitics, r/PoliticalDiscussion, and r/moderatepolitics. These communities have stronger moderation policies that enforce evidence-based arguments and discourage partisan attacks, resulting in more substantive exchanges.',
      date: '2023-03-12'
    },
    {
      id: 4,
      question: 'How has the sentiment around climate change evolved over the past year?',
      answer: 'Over the past year, climate change discussions have shown a 28% increase in urgency and a 15% increase in scientific content. The sentiment has shifted from general concern to more specific discussions about solutions, with renewable energy technologies and policy proposals dominating the conversation. There\'s also been a notable 35% decrease in climate change denial content across all monitored subreddits.',
      date: '2023-03-10'
    }
  ];
  
  return {
    insights,
    recentQuestions
  };
};

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [aiData, setAIData] = useState<AIInsightsData | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionResponse, setQuestionResponse] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate API call with timeout
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        const data = generateMockAIInsightsData();
        setAIData(data);
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
  }, []);
  
  const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserQuestion(event.target.value);
  };
  
  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;
    
    setIsAskingQuestion(true);
    setQuestionResponse(null);
    
    // Simulate AI processing time
    setTimeout(() => {
      // Mock response based on question keywords
      let response = "I've analyzed the data and found that ";
      
      if (userQuestion.toLowerCase().includes('trend')) {
        response += "the most significant trend currently is the rising interest in AI ethics and the declining conversations around NFTs. The AI ethics discussions have increased by 45% in the past month across technology and science subreddits.";
      } else if (userQuestion.toLowerCase().includes('predict')) {
        response += "based on current patterns, discussions about space tourism are likely to become a major trending topic within the next 7-10 days. This prediction has a 78% confidence level based on similarity to previous viral topic patterns.";
      } else if (userQuestion.toLowerCase().includes('recommend') || userQuestion.toLowerCase().includes('suggest')) {
        response += "renewable energy topics show high engagement but relatively low content volume, representing an opportunity for content creators. Additionally, educational content about quantum computing basics would likely perform well given the rising interest but high complexity of the subject.";
      } else {
        response += "while I don't have specific information directly addressing your question, I can tell you that discussions about AI ethics, renewable energy, and space tourism are currently showing significant engagement. Would you like more specific information about any of these topics?";
      }
      
      setQuestionResponse(response);
      setIsAskingQuestion(false);
    }, 2000);
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
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Insights
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Leverage advanced AI analysis to uncover hidden patterns, trends, and opportunities in social media data.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PsychologyIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Ask the AI Assistant
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Ask a question about social media trends, patterns, or insights"
            variant="outlined"
            value={userQuestion}
            onChange={handleQuestionChange}
            disabled={isAskingQuestion}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleAskQuestion}
            disabled={!userQuestion.trim() || isAskingQuestion}
          >
            Ask
          </Button>
        </Box>
        
        {isAskingQuestion && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {questionResponse && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body1">
              {questionResponse}
            </Typography>
          </Paper>
        )}
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Recent Questions
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {aiData?.recentQuestions.map((q) => (
                <Accordion key={q.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography>{q.question}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {q.answer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Answered on {q.date}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AutoAwesomeIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            AI-Generated Insights
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {aiData?.insights.map((insight) => (
              <Grid item xs={12} md={6} key={insight.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getInsightIcon(insight.type)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {insight.title}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} 
                      color={getInsightColor(insight.type) as any}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" paragraph>
                      {insight.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {insight.relatedSubreddits.map(subreddit => (
                        <Chip 
                          key={subreddit}
                          icon={<ForumIcon />}
                          label={`r/${subreddit}`}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Confidence: {(insight.confidence * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Generated on {insight.date}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          How It Works
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Our AI insights system uses advanced machine learning algorithms to analyze social media data and extract meaningful patterns and trends:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <TrendingUpIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Trend Detection" 
                secondary="Identifies emerging topics and conversations before they become mainstream." 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <WarningIcon color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Anomaly Detection" 
                secondary="Spots unusual patterns that may indicate coordinated campaigns or viral content." 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <AutoAwesomeIcon color="secondary" />
              </ListItemIcon>
              <ListItemText 
                primary="Predictive Analytics" 
                secondary="Forecasts how topics and sentiments are likely to evolve based on historical patterns." 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <LightbulbIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Strategic Recommendations" 
                secondary="Suggests content opportunities and engagement strategies based on data analysis." 
              />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The system continuously learns from new data and user feedback to improve its accuracy and relevance.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 