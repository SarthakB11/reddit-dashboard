'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  useTheme,
} from '@mui/material';
import SearchFilters from '@/app/components/common/SearchFilters';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RepeatIcon from '@mui/icons-material/Repeat';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Types for AI summary data
interface InsightPoint {
  title: string;
  description: string;
  type: 'insight' | 'trend' | 'warning' | 'recommendation';
  confidence: number;
  relatedTopics?: string[];
  sources?: string[];
}

interface TrendPoint {
  label: string;
  value: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
}

interface NarrativeSection {
  title: string;
  content: string;
  key_points: string[];
}

interface AISummaryData {
  insights: InsightPoint[];
  trends: TrendPoint[];
  summary: string;
  narrative: NarrativeSection[];
  keywords: string[];
  misinformationDetected: boolean;
  misinformationDetails?: {
    description: string;
    evidence: string[];
    counter_narratives: string[];
  };
  generatedAt: string;
  dataPoints: number;
}

// Sample data generation
const generateMockAISummaryData = (): AISummaryData => {
  // Create a narrative with sections
  const narrative = [
    {
      title: "General Content Overview",
      content: "The collected data spans multiple social media platforms with discussion primarily centered around technology, politics, climate change, and healthcare. The conversations show distinct patterns of engagement with technology-related content receiving the most interactions, followed by political discourse which tends to be more polarized. Climate-related discussions show consistent engagement but lower overall volume.",
      key_points: [
        "Technology topics dominate the discussion landscape (35% of all content)",
        "Political content shows the highest engagement per post, but lower posting frequency",
        "Climate discussions maintain consistent interest over time with seasonal spikes",
        "Healthcare topics experienced a significant uptick in the past month"
      ]
    },
    {
      title: "Emerging Trends",
      content: "Analysis reveals several emerging trends across the monitored platforms. There's a notable increase in discussions about artificial intelligence ethics and regulations, with a 47% growth in the past quarter. Discussion of misinformation and its impacts has become more prevalent, especially in political contexts. Climate activism content is increasingly connecting with economic impact narratives rather than purely environmental concerns.",
      key_points: [
        "AI ethics discussions up 47% quarter-over-quarter",
        "Misinformation concerns increasingly paired with calls for platform accountability",
        "Climate narratives shifting toward economic framing",
        "Cross-platform content sharing increased by 28%"
      ]
    },
    {
      title: "Sentiment Analysis",
      content: "Sentiment across the analyzed content shows varying patterns by topic. Technology discussions maintain a generally positive sentiment (68%) with specific concerns about privacy and job displacement. Political content demonstrates the most polarized sentiment distribution, with minimal neutral engagement. Environmental topics show an increase in anxiety-related sentiment markers compared to previous periods.",
      key_points: [
        "Technology content maintains positive sentiment (68%) despite specific concerns",
        "Political discussions show extreme sentiment polarization with minimal neutral engagement",
        "Climate topics show increasing anxiety markers in language patterns",
        "Health-related content sentiment improved significantly following recent policy announcements"
      ]
    },
    {
      title: "Network Dynamics",
      content: "Community structure analysis reveals distinct but interconnected groups forming around specific topics. Cross-pollination of ideas occurs primarily through approximately 15% of users who engage across multiple topic communities. These 'bridge users' play a disproportionate role in information diffusion. Viral content typically reaches peak diffusion within 12 hours, with political content spreading fastest and climate content showing the most sustained engagement patterns.",
      key_points: [
        "Distinct community structures identified around core topics",
        "15% of users serve as 'bridges' between topic communities",
        "Political content reaches viral peaks within 6 hours on average",
        "Climate content shows most sustained engagement patterns over time"
      ]
    }
  ];

  // Generate insights
  const insights: InsightPoint[] = [
    {
      title: "AI Discussion Increasingly Connected to Employment Concerns",
      description: "Analysis shows a 43% increase in discussions connecting artificial intelligence advancements with employment concerns, particularly in manufacturing and service industries.",
      type: "insight",
      confidence: 0.92,
      relatedTopics: ["technology", "economics", "employment"],
      sources: ["Twitter trend analysis", "Reddit r/technology and r/economics"]
    },
    {
      title: "Climate Policy Discussions More Bipartisan Than Expected",
      description: "Despite polarization in other political topics, climate policy discussions show unexpected levels of bipartisan engagement, with 38% of positive interactions crossing typical political divides.",
      type: "trend",
      confidence: 0.85,
      relatedTopics: ["climate", "politics", "policy"],
      sources: ["Cross-platform sentiment analysis", "Community interaction patterns"]
    },
    {
      title: "Potential Misinformation Campaign Detected",
      description: "Network analysis detected coordinated sharing patterns of misleading health information across multiple platforms, originating from a small cluster of accounts with suspicious activity patterns.",
      type: "warning",
      confidence: 0.88,
      relatedTopics: ["health", "vaccine", "misinformation"],
      sources: ["Network anomaly detection", "Content similarity analysis"]
    },
    {
      title: "Local Content Performs Better Than National",
      description: "Content focused on local impacts of major issues receives 2.7x more engagement than similar content framed at national level across all analyzed topics.",
      type: "insight",
      confidence: 0.91,
      relatedTopics: ["content strategy", "engagement", "localization"],
      sources: ["Engagement metrics analysis", "Content categorization"]
    },
    {
      title: "Educational Format Content Growing",
      description: "Explanatory and educational content formats have grown 58% year-over-year with significantly higher trust scores than opinion or news formats.",
      type: "trend",
      confidence: 0.89,
      relatedTopics: ["content formats", "education", "trust"],
      sources: ["Format classification analysis", "Year-over-year comparison"]
    },
    {
      title: "Consider Localizing National Topics",
      description: "Based on engagement patterns, consider creating content that connects national issues to local impacts to increase relevance and engagement.",
      type: "recommendation",
      confidence: 0.93,
      relatedTopics: ["content strategy", "engagement optimization"],
      sources: ["Performance pattern analysis"]
    }
  ];

  // Create trend points
  const trends: TrendPoint[] = [
    {
      label: "Engagement Rate",
      value: 4.8,
      change: 0.7,
      direction: "up"
    },
    {
      label: "Topic Diversity",
      value: 8.2,
      change: 1.2,
      direction: "up"
    },
    {
      label: "Cross-Platform Sharing",
      value: 27,
      change: 3.5,
      direction: "up"
    },
    {
      label: "Sentiment Polarization",
      value: 6.4,
      change: 0.2,
      direction: "up"
    },
    {
      label: "Reply Depth",
      value: 3.2,
      change: -0.4,
      direction: "down"
    },
    {
      label: "New Contributors",
      value: 15.3,
      change: -1.8,
      direction: "down"
    }
  ];

  // Create the mock AI summary data
  return {
    insights,
    trends,
    summary: "Social media discussions show increased interconnectivity between technology and economic concerns, with AI ethics emerging as a central topic. Climate conversations demonstrate a shift towards economic framing with unexpectedly bipartisan engagement. Educational content formats continue to outperform traditional formats in engagement and trust metrics. A potential coordinated misinformation campaign was detected related to healthcare topics.",
    narrative,
    keywords: ["artificial intelligence", "climate policy", "bipartisan engagement", "misinformation", "local content", "educational formats", "employment concerns", "economic framing"],
    misinformationDetected: true,
    misinformationDetails: {
      description: "Analysis identified potentially coordinated distribution of misleading health information across platforms. The content presents correlation data as causal and omits critical contextual information.",
      evidence: [
        "Network analysis shows unusual sharing patterns from 27 accounts with coordinated timing",
        "Content contains misleadingly presented statistical data contradicting scientific consensus",
        "Accounts involved show suspicious creation patterns and activity profiles"
      ],
      counter_narratives: [
        "Actual peer-reviewed research contradicts the central claims made in the content",
        "Context omitted from shared statistics significantly changes their interpretation",
        "Similar misleading framings have been identified and debunked previously by fact-checking organizations"
      ]
    },
    generatedAt: new Date().toISOString(),
    dataPoints: 18726
  };
};

export default function AISummary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<AISummaryData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Get search parameters from URL
  const getSearchParamsObject = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  // Fetch AI summary data based on search params
  useEffect(() => {
    const fetchAISummaryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For demo purposes, use mock data with a delay
        setTimeout(() => {
          const data = generateMockAISummaryData();
          setSummaryData(data);
          setLoading(false);
        }, 1000);
        
        // In production, fetch from API:
        // const response = await fetchAISummary(getSearchParamsObject());
        // setSummaryData(response);
      } catch (err) {
        console.error('Error fetching AI summary data:', err);
        setError('Failed to fetch AI-generated insights. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAISummaryData();
  }, [searchParams]);
  
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
    
    // Navigate with new search params
    router.push(`/ai-summary?${urlParams.toString()}`);
  };
  
  // Handle regenerate request
  const handleRegenerate = () => {
    setGenerating(true);
    
    // Simulate regeneration with a delay
    setTimeout(() => {
      const newData = generateMockAISummaryData();
      setSummaryData(newData);
      setGenerating(false);
    }, 2000);
  };
  
  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, 3));
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };
  
  // Get icon for insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <LightbulbIcon color="primary" />;
      case 'trend':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'recommendation':
        return <TipsAndUpdatesIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return <AutoAwesomeIcon />;
    }
  };
  
  // Get color for trend direction
  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  // Get arrow for trend direction
  const getTrendDirection = (direction: string) => {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };
  
  // Prepare trend data for visualization
  const getTrendChartData = () => {
    if (!summaryData || !summaryData.trends) return [];
    
    return [{
      type: 'bar',
      x: summaryData.trends.map(trend => trend.label),
      y: summaryData.trends.map(trend => trend.value),
      marker: {
        color: summaryData.trends.map(trend => 
          trend.direction === 'up' 
            ? theme.palette.success.main 
            : trend.direction === 'down' 
              ? theme.palette.error.main 
              : theme.palette.primary.main
        ),
      },
      text: summaryData.trends.map(trend => 
        `${trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} ${Math.abs(trend.change).toFixed(1)}`
      ),
      textposition: 'outside',
    }];
  };
  
  // Get layout for trend chart
  const getTrendChartLayout = () => {
    return {
      autosize: true,
      margin: { l: 50, r: 20, t: 30, b: 100 },
      height: 400,
      xaxis: {
        title: { text: 'Metrics' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        tickangle: -45,
      },
      yaxis: {
        title: { text: 'Score (0-10)' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        range: [0, 30],
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDarkMode ? '#e0e0e0' : '#333333',
      },
    };
  };
  
  // Render narrative sections based on active step
  const renderNarrativeSection = () => {
    if (!summaryData || !summaryData.narrative || summaryData.narrative.length === 0) {
      return null;
    }
    
    const section = summaryData.narrative[activeStep];
    
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          {section.title}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {section.content}
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Key Points
        </Typography>
        
        <List>
          {section.key_points.map((point, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <CheckCircleIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={point} />
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            onClick={handleBack} 
            disabled={activeStep === 0}
            variant="outlined"
          >
            Previous Section
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={activeStep === summaryData.narrative.length - 1}
            variant="contained"
          >
            Next Section
          </Button>
        </Box>
      </Box>
    );
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
          AI-Generated Insights
        </Typography>
        
        {summaryData && !generating && (
          <IconButton 
            color="primary" 
            onClick={handleRegenerate}
            title="Regenerate analysis"
            size="large"
          >
            <RepeatIcon />
          </IconButton>
        )}
      </Box>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Advanced AI analysis of social media data revealing key insights, trends, and anomalies. This automated analysis helps identify patterns that might be missed in manual review.
      </Typography>
      
      <SearchFilters 
        onSearch={handleSearch} 
        defaultValues={getSearchParamsObject()}
      />
      
      {/* Main content */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Loading states */}
        {(loading || generating) && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3 }}>
                {generating ? 'Regenerating AI analysis...' : 'Analyzing social media data...'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {generating 
                  ? 'Creating fresh insights based on current data' 
                  : 'Our AI is processing thousands of data points to extract meaningful insights'}
              </Typography>
            </Box>
          </Grid>
        )}
        
        {/* Error state */}
        {!loading && !generating && error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          </Grid>
        )}
        
        {/* Empty state */}
        {!loading && !generating && !error && !summaryData && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ my: 4 }}>
              No AI analysis available for the current filters. Try adjusting your search criteria.
            </Alert>
          </Grid>
        )}
        
        {/* Results */}
        {!loading && !generating && !error && summaryData && (
          <>
            {/* Executive Summary Card */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 4, position: 'relative' }}>
                <AutoAwesomeIcon 
                  sx={{ 
                    position: 'absolute', 
                    top: 20, 
                    right: 20,
                    fontSize: 28,
                    color: theme.palette.primary.main,
                    opacity: 0.8,
                  }} 
                />
                
                <Typography variant="h5" gutterBottom fontWeight="500">
                  Executive Summary
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {summaryData.summary}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
                  {summaryData.keywords.map((keyword, index) => (
                    <Chip 
                      key={index} 
                      label={keyword} 
                      color={index % 3 === 0 ? "primary" : index % 3 === 1 ? "secondary" : "default"}
                      variant={index % 2 === 0 ? "filled" : "outlined"}
                      size="medium"
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, color: 'text.secondary' }}>
                  <Typography variant="caption">
                    Based on {summaryData.dataPoints.toLocaleString()} data points • Generated on {new Date(summaryData.generatedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            {/* Narrative */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="500">
                  Narrative Analysis
                </Typography>
                
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                  {summaryData.narrative.map((section, index) => (
                    <Step key={index}>
                      <StepLabel>{section.title}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                
                <Divider sx={{ mb: 3 }} />
                
                {renderNarrativeSection()}
              </Paper>
            </Grid>
            
            {/* Insights */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom fontWeight="500">
                  Key Insights and Recommendations
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  {summaryData.insights.map((insight, index) => (
                    <Accordion key={index} defaultExpanded={index === 0} sx={{ mb: 2 }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ 
                          borderLeft: '4px solid',
                          borderColor: 
                            insight.type === 'insight' ? theme.palette.primary.main :
                            insight.type === 'trend' ? theme.palette.success.main :
                            insight.type === 'warning' ? theme.palette.warning.main :
                            theme.palette.info.main
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2 }}>
                            {getInsightIcon(insight.type)}
                          </Box>
                          <Typography variant="subtitle1">
                            {insight.title}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" paragraph>
                          {insight.description}
                        </Typography>
                        
                        {insight.relatedTopics && insight.relatedTopics.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Related Topics
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {insight.relatedTopics.map((topic, i) => (
                                <Chip key={i} label={topic} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {insight.sources && insight.sources.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Evidence Sources
                            </Typography>
                            <List dense disablePadding>
                              {insight.sources.map((source, i) => (
                                <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                                  <ListItemText primary={source} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 2,
                          bgcolor: 'action.hover',
                          p: 1,
                          borderRadius: 1
                        }}>
                          <Typography variant="caption" sx={{ mr: 1 }}>
                            AI Confidence:
                          </Typography>
                          <Box sx={{ 
                            width: `${insight.confidence * 100}%`, 
                            height: 8, 
                            bgcolor: 
                              insight.confidence > 0.9 ? theme.palette.success.main :
                              insight.confidence > 0.7 ? theme.palette.info.main :
                              theme.palette.warning.main,
                            borderRadius: 4
                          }} />
                          <Typography variant="caption" sx={{ ml: 2 }}>
                            {(insight.confidence * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            {/* Trends and Misinformation */}
            <Grid item xs={12} md={5}>
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom fontWeight="500">
                      Key Metrics
                    </Typography>
                    
                    <Box sx={{ height: 400 }}>
                      <Plot
                        data={getTrendChartData()}
                        layout={getTrendChartLayout()}
                        config={{ responsive: true }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                {summaryData.misinformationDetected && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderLeft: `4px solid ${theme.palette.error.main}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <NotInterestedIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="error.main">
                          Potential Misinformation Detected
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {summaryData.misinformationDetails?.description}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Evidence:
                      </Typography>
                      
                      <List dense>
                        {summaryData.misinformationDetails?.evidence.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <WarningIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Counter Information:
                      </Typography>
                      
                      <List dense>
                        {summaryData.misinformationDetails?.counter_narratives.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Grid>
            
            {/* Related Analysis Links */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Explore Detailed Analysis
                </Typography>
                
                <Typography variant="body2" paragraph color="text.secondary">
                  Dive deeper into the data with these specialized analytics:
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item>
                    <Button 
                      variant="outlined" 
                      startIcon={<BubbleChartIcon />}
                      component={Link}
                      href={searchParams ? `/topics?${searchParams.toString()}` : '/topics'}
                    >
                      Topic Modeling
                    </Button>
                  </Grid>
                  
                  <Grid item>
                    <Button 
                      variant="outlined" 
                      startIcon={<TimelineIcon />}
                      component={Link}
                      href={searchParams ? `/timeseries?${searchParams.toString()}` : '/timeseries'}
                    >
                      Time Series Analysis
                    </Button>
                  </Grid>
                  
                  <Grid item>
                    <Button 
                      variant="outlined" 
                      startIcon={<SentimentSatisfiedAltIcon />}
                      component={Link}
                      href={searchParams ? `/sentiment?${searchParams.toString()}` : '/sentiment'}
                    >
                      Sentiment Analysis
                    </Button>
                  </Grid>
                  
                  <Grid item>
                    <Button 
                      variant="outlined" 
                      startIcon={<BubbleChartIcon />}
                      component={Link}
                      href={searchParams ? `/network?${searchParams.toString()}` : '/network'}
                    >
                      Network Analysis
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
} 