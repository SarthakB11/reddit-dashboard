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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Alert,
} from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import ForumIcon from '@mui/icons-material/Forum';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import dynamic from 'next/dynamic';

// Add this after other imports
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false }) as any;

// Define interfaces for topic modeling data
interface TopicWord {
  word: string;
  weight: number;
}

interface Topic {
  id: number;
  name: string;
  words: TopicWord[];
  postCount: number;
  trend: 'up' | 'down' | 'flat';
  percentChange: number;
}

interface SubredditTopics {
  name: string;
  topTopics: number[]; // IDs of top topics
  postCount: number;
}

interface TopicModelingData {
  topics: Topic[];
  subreddits: SubredditTopics[];
  timeData: {
    date: string;
    topicDistribution: {
      topicId: number;
      percentage: number;
    }[];
  }[];
}

// Function to generate mock topic modeling data
const generateMockTopicModelingData = (): TopicModelingData => {
  // Create topics
  const topics: Topic[] = [
    {
      id: 1,
      name: "Technology",
      words: [
        { word: "technology", weight: 0.95 },
        { word: "innovation", weight: 0.85 },
        { word: "digital", weight: 0.82 },
        { word: "software", weight: 0.78 },
        { word: "hardware", weight: 0.75 },
        { word: "computer", weight: 0.72 },
        { word: "device", weight: 0.68 },
        { word: "app", weight: 0.65 },
        { word: "tech", weight: 0.62 },
        { word: "system", weight: 0.58 }
      ],
      postCount: 450,
      trend: 'up',
      percentChange: 15
    },
    {
      id: 2,
      name: "Politics",
      words: [
        { word: "politics", weight: 0.92 },
        { word: "government", weight: 0.88 },
        { word: "election", weight: 0.85 },
        { word: "policy", weight: 0.82 },
        { word: "vote", weight: 0.78 },
        { word: "candidate", weight: 0.75 },
        { word: "party", weight: 0.72 },
        { word: "debate", weight: 0.68 },
        { word: "campaign", weight: 0.65 },
        { word: "democracy", weight: 0.62 }
      ],
      postCount: 380,
      trend: 'up',
      percentChange: 8
    },
    {
      id: 3,
      name: "Science",
      words: [
        { word: "science", weight: 0.94 },
        { word: "research", weight: 0.90 },
        { word: "study", weight: 0.87 },
        { word: "data", weight: 0.83 },
        { word: "experiment", weight: 0.79 },
        { word: "discovery", weight: 0.76 },
        { word: "scientist", weight: 0.73 },
        { word: "theory", weight: 0.70 },
        { word: "evidence", weight: 0.67 },
        { word: "hypothesis", weight: 0.64 }
      ],
      postCount: 320,
      trend: 'up',
      percentChange: 12
    },
    {
      id: 4,
      name: "Entertainment",
      words: [
        { word: "movie", weight: 0.93 },
        { word: "film", weight: 0.89 },
        { word: "show", weight: 0.86 },
        { word: "actor", weight: 0.82 },
        { word: "series", weight: 0.78 },
        { word: "character", weight: 0.75 },
        { word: "director", weight: 0.72 },
        { word: "entertainment", weight: 0.69 },
        { word: "watch", weight: 0.66 },
        { word: "streaming", weight: 0.63 }
      ],
      postCount: 280,
      trend: 'flat',
      percentChange: 2
    },
    {
      id: 5,
      name: "Sports",
      words: [
        { word: "sports", weight: 0.95 },
        { word: "game", weight: 0.91 },
        { word: "team", weight: 0.87 },
        { word: "player", weight: 0.84 },
        { word: "season", weight: 0.80 },
        { word: "league", weight: 0.77 },
        { word: "match", weight: 0.74 },
        { word: "championship", weight: 0.71 },
        { word: "coach", weight: 0.68 },
        { word: "score", weight: 0.65 }
      ],
      postCount: 250,
      trend: 'down',
      percentChange: -5
    },
    {
      id: 6,
      name: "Health",
      words: [
        { word: "health", weight: 0.94 },
        { word: "medical", weight: 0.90 },
        { word: "doctor", weight: 0.86 },
        { word: "patient", weight: 0.83 },
        { word: "treatment", weight: 0.79 },
        { word: "disease", weight: 0.76 },
        { word: "medicine", weight: 0.73 },
        { word: "healthcare", weight: 0.70 },
        { word: "hospital", weight: 0.67 },
        { word: "wellness", weight: 0.64 }
      ],
      postCount: 220,
      trend: 'up',
      percentChange: 18
    },
    {
      id: 7,
      name: "Finance",
      words: [
        { word: "finance", weight: 0.93 },
        { word: "money", weight: 0.89 },
        { word: "investment", weight: 0.85 },
        { word: "market", weight: 0.82 },
        { word: "stock", weight: 0.78 },
        { word: "economy", weight: 0.75 },
        { word: "financial", weight: 0.72 },
        { word: "bank", weight: 0.69 },
        { word: "trading", weight: 0.66 },
        { word: "investor", weight: 0.63 }
      ],
      postCount: 200,
      trend: 'up',
      percentChange: 10
    },
    {
      id: 8,
      name: "Education",
      words: [
        { word: "education", weight: 0.92 },
        { word: "school", weight: 0.88 },
        { word: "student", weight: 0.84 },
        { word: "learning", weight: 0.81 },
        { word: "teacher", weight: 0.77 },
        { word: "university", weight: 0.74 },
        { word: "college", weight: 0.71 },
        { word: "academic", weight: 0.68 },
        { word: "course", weight: 0.65 },
        { word: "degree", weight: 0.62 }
      ],
      postCount: 180,
      trend: 'flat',
      percentChange: 3
    }
  ];
  
  // Create subreddit topics
  const subreddits: SubredditTopics[] = [
    {
      name: "technology",
      topTopics: [1, 3, 7],
      postCount: 450
    },
    {
      name: "politics",
      topTopics: [2, 6, 8],
      postCount: 380
    },
    {
      name: "science",
      topTopics: [3, 6, 1],
      postCount: 320
    },
    {
      name: "movies",
      topTopics: [4, 5, 7],
      postCount: 280
    },
    {
      name: "sports",
      topTopics: [5, 4, 6],
      postCount: 250
    }
  ];
  
  // Create time data
  const timeData = [
    {
      date: "Jan 1",
      topicDistribution: [
        { topicId: 1, percentage: 20 },
        { topicId: 2, percentage: 18 },
        { topicId: 3, percentage: 15 },
        { topicId: 4, percentage: 12 },
        { topicId: 5, percentage: 10 },
        { topicId: 6, percentage: 10 },
        { topicId: 7, percentage: 8 },
        { topicId: 8, percentage: 7 }
      ]
    },
    {
      date: "Jan 5",
      topicDistribution: [
        { topicId: 1, percentage: 22 },
        { topicId: 2, percentage: 19 },
        { topicId: 3, percentage: 16 },
        { topicId: 4, percentage: 12 },
        { topicId: 5, percentage: 9 },
        { topicId: 6, percentage: 11 },
        { topicId: 7, percentage: 8 },
        { topicId: 8, percentage: 7 }
      ]
    },
    {
      date: "Jan 10",
      topicDistribution: [
        { topicId: 1, percentage: 23 },
        { topicId: 2, percentage: 19 },
        { topicId: 3, percentage: 17 },
        { topicId: 4, percentage: 12 },
        { topicId: 5, percentage: 8 },
        { topicId: 6, percentage: 12 },
        { topicId: 7, percentage: 9 },
        { topicId: 8, percentage: 7 }
      ]
    }
  ];
  
  return {
    topics,
    subreddits,
    timeData
  };
};

// Add this component for client-only rendering
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

// Custom component to display API connection status
const ApiStatus = ({ status }: { status: 'connected' | 'disconnected' | 'loading' }) => {
  let icon = null;
  let text = '';
  let color = '';
  let bgColor = '';

  switch (status) {
    case 'connected':
      icon = <CheckCircleIcon fontSize="small" />;
      text = 'API Connected';
      color = 'success.main';
      bgColor = 'success.light';
      break;
    case 'disconnected':
      icon = <CloudOffIcon fontSize="small" />;
      text = 'API Disconnected';
      color = 'error.main';
      bgColor = 'error.light';
      break;
    case 'loading':
      icon = <CircularProgress size={16} />;
      text = 'Checking API...';
      color = 'info.main';
      bgColor = 'info.light';
      break;
  }

  return (
    <Chip
      icon={icon}
      label={text}
      sx={{ 
        color,
        bgcolor: bgColor,
        fontWeight: status === 'disconnected' ? 'bold' : 'normal',
        '& .MuiChip-icon': { color }
      }}
      size="small"
    />
  );
};

// Main component wrapped with ClientOnly to prevent hydration errors
export default function TopicModelingPage() {
  return (
    <ClientOnly>
      <TopicModelingContent />
    </ClientOnly>
  );
}

// Separate the content to a different component
function TopicModelingContent() {
  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState<TopicModelingData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [numTopics, setNumTopics] = useState(8);
  
  // Function to check API health
  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        setApiStatus('connected');
        return true;
      } else {
        setApiStatus('disconnected');
        return false;
      }
    } catch (err) {
      setApiStatus('disconnected');
      return false;
    }
  };
  
  // Function to fetch topic data from API
  const fetchTopicData = async (keyword: string = '', subreddit: string = '', numTopics: number = 8) => {
    setLoading(true);
    setError(null);
    setUsingSampleData(false);
    
    try {
      // First check API health
      const isApiHealthy = await checkApiHealth();
      
      if (!isApiHealthy) {
        throw new Error('API server is not available');
      }
      
      // Build API URL with query parameters
      const apiUrl = new URL('http://localhost:5000/api/topics');
      if (keyword) {
        apiUrl.searchParams.append('keyword', keyword);
      }
      if (subreddit) {
        apiUrl.searchParams.append('subreddit', subreddit);
      }
      apiUrl.searchParams.append('num_topics', numTopics.toString());
      
      // Fetch data from API
      const response = await fetch(apiUrl.toString(), { signal: AbortSignal.timeout(30000) });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we have valid data
      if (!data.topics || !data.subreddits || !data.timeData) {
        throw new Error('Invalid data format received from API');
      }
      
      setTopicData(data);
      setApiStatus('connected');
      setSelectedTopic(null);
      setSelectedSubreddit(null);
    } catch (err) {
      console.error('Error fetching topic data:', err);
      setError(`Failed to load topic data from API: ${err instanceof Error ? err.message : 'Unknown error'}. Using sample data instead.`);
      setApiStatus('disconnected');
      
      // Fallback to sample data
      const sampleData = generateMockTopicModelingData();
      setTopicData(sampleData);
      setUsingSampleData(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Check API status periodically
  useEffect(() => {
    const checkApiConnection = async () => {
      const isHealthy = await checkApiHealth();
      
      // If API is now available but we're using sample data, offer to refresh
      if (isHealthy && usingSampleData) {
        // Keep using sample data but update status
        setApiStatus('connected');
      }
    };
    
    // Initial check
    checkApiConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkApiConnection, 30000);
    
    return () => clearInterval(interval);
  }, [usingSampleData]);
  
  // Fetch data on initial load
  useEffect(() => {
    fetchTopicData();
  }, []);
  
  const handleTopicChange = (event: SelectChangeEvent) => {
    setSelectedTopic(Number(event.target.value));
  };
  
  const handleSubredditChange = (event: SelectChangeEvent) => {
    setSelectedSubreddit(event.target.value);
  };
  
  const handleRefreshData = () => {
    fetchTopicData(keyword, subreddit, numTopics);
  };
  
  const handleSearch = () => {
    fetchTopicData(keyword, subreddit, numTopics);
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
  
  // Get topic by ID
  const getTopicById = (id: number) => {
    return topicData?.topics.find(topic => topic.id === id);
  };
  
  // Get top topics for a subreddit
  const getTopTopicsForSubreddit = (subredditName: string) => {
    const subreddit = topicData?.subreddits.find(sr => sr.name === subredditName);
    if (!subreddit) return [];
    
    return subreddit.topTopics.map(topicId => getTopicById(topicId)).filter(Boolean);
  };
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }} suppressHydrationWarning>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Topic Modeling
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ApiStatus status={apiStatus} />
          {usingSampleData && apiStatus === 'connected' && (
            <Button 
              size="small" 
              variant="outlined" 
              color="primary" 
              onClick={handleRefreshData}
              startIcon={<RefreshIcon />}
            >
              Refresh with real data
            </Button>
          )}
        </Box>
      </Box>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Discover the main themes and topics discussed across social media platforms using natural language processing.
        {usingSampleData && (
          <Box component="span" sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}>
            <Chip 
              icon={<WarningIcon />} 
              label="Using sample data" 
              color="warning" 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
          </Box>
        )}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3, alignItems: 'flex-end' }}>
          <TextField
            label="Search Keyword"
            variant="outlined"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ flexGrow: 1 }}
            placeholder="Enter keyword to analyze topics..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          <TextField
            label="Subreddit"
            variant="outlined"
            value={subreddit}
            onChange={(e) => setSubreddit(e.target.value)}
            sx={{ flexGrow: 1 }}
            placeholder="e.g. politics, technology"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="num-topics-label">Topics</InputLabel>
            <Select
              labelId="num-topics-label"
              value={numTopics.toString()}
              label="Topics"
              onChange={(e) => setNumTopics(Number(e.target.value))}
            >
              <MenuItem value={5}>5 Topics</MenuItem>
              <MenuItem value={8}>8 Topics</MenuItem>
              <MenuItem value={10}>10 Topics</MenuItem>
              <MenuItem value={15}>15 Topics</MenuItem>
              <MenuItem value={20}>20 Topics</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            disabled={loading}
          >
            Analyze
          </Button>
        </Box>
        
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Topic Distribution
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="topic-select-label">Filter by Topic</InputLabel>
              <Select
                labelId="topic-select-label"
                value={selectedTopic?.toString() || ''}
                label="Filter by Topic"
                onChange={handleTopicChange}
              >
                <MenuItem value="">
                  <em>All Topics</em>
                </MenuItem>
                {topicData?.topics.map(topic => (
                  <MenuItem key={topic.id} value={topic.id.toString()}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="subreddit-select-label">Filter by Subreddit</InputLabel>
              <Select
                labelId="subreddit-select-label"
                value={selectedSubreddit || ''}
                label="Filter by Subreddit"
                onChange={handleSubredditChange}
              >
                <MenuItem value="">
                  <em>All Subreddits</em>
                </MenuItem>
                {topicData?.subreddits.map(subreddit => (
                  <MenuItem key={subreddit.name} value={subreddit.name}>
                    r/{subreddit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Box sx={{ height: 400, mb: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : topicData && topicData.topics && topicData.topics.length > 0 ? (
            <Plot
              data={[
                {
                  type: 'treemap',
                  labels: topicData.topics.map(topic => topic.name),
                  parents: Array(topicData.topics.length).fill(''),
                  values: topicData.topics.map(topic => topic.postCount),
                  textinfo: 'label+value',
                  textposition: 'middle center',
                  textfont: { size: 14, color: 'white' },
                  marker: {
                    colors: topicData.topics.map((topic, i) => `hsl(${(i * 360 / topicData.topics.length) % 360}, 70%, 50%)`),
                    line: { width: 2, color: 'white' }
                  },
                  hovertemplate: `
                    <b>%{label}</b><br>
                    Posts: %{value}<br>
                    Trend: %{customdata[0]}<br>
                    Change: %{customdata[1]}%
                    <extra></extra>
                  `,
                  customdata: topicData.topics.map(topic => [topic.trend, topic.percentChange])
                }
              ]}
              layout={{
                autosize: true,
                margin: { l: 0, r: 0, t: 10, b: 0 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { family: 'Roboto, sans-serif' }
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}>
              <Typography variant="body1" color="text.secondary">
                <BubbleChartIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
                No topic data available
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ height: 300, mb: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : topicData && topicData.timeData && topicData.timeData.length > 0 && topicData.topics && topicData.topics.length > 0 ? (
            <Plot
              data={topicData.topics.map((topic, i) => ({
                x: topicData.timeData.map(d => d.date),
                y: topicData.timeData.map(d => 
                  d.topicDistribution.find(t => t.topicId === topic.id)?.percentage || 0
                ),
                type: 'scatter',
                mode: 'lines+markers',
                name: topic.name,
                line: { 
                  color: `hsl(${(i * 360 / topicData.topics.length) % 360}, 70%, 50%)`,
                  width: 2,
                  shape: 'spline'
                },
                marker: {
                  size: 8,
                  color: `hsl(${(i * 360 / topicData.topics.length) % 360}, 70%, 50%)`,
                  line: { width: 1, color: 'white' }
                },
                hovertemplate: `
                  <b>${topic.name}</b><br>
                  Date: %{x}<br>
                  Percentage: %{y}%
                  <extra></extra>
                `
              }))}
              layout={{
                autosize: true,
                margin: { l: 50, r: 20, t: 20, b: 50 },
                xaxis: {
                  title: 'Date',
                  showgrid: false,
                  tickfont: { size: 12 }
                },
                yaxis: {
                  title: 'Topic Distribution (%)',
                  showgrid: true,
                  gridcolor: 'rgba(240,240,240,0.5)',
                  tickfont: { size: 12 },
                  range: [0, Math.max(
                    100,
                    ...topicData.timeData.flatMap(d => 
                      d.topicDistribution.map(t => t.percentage)
                    )
                  ) * 1.1]
                },
                showlegend: true,
                legend: {
                  orientation: 'h',
                  y: -0.2,
                  font: { size: 10 }
                },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { family: 'Roboto, sans-serif' },
                hovermode: 'closest'
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}>
              <Typography variant="body1" color="text.secondary">
                No trend data available
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      {!loading && selectedTopic && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Topic Detail: {getTopicById(selectedTopic)?.name}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Key Words
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                    {getTopicById(selectedTopic)?.words.map(word => (
                      <Chip 
                        key={word.word}
                        label={`${word.word} (${(word.weight * 100).toFixed(0)}%)`}
                        sx={{ 
                          bgcolor: `hsla(${selectedTopic * 40}, 70%, 50%, ${word.weight})`,
                          color: 'white',
                          fontWeight: word.weight > 0.8 ? 'bold' : 'normal'
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Related Subreddits
                  </Typography>
                  
                  <List>
                    {topicData?.subreddits
                      .filter(sr => sr.topTopics.includes(selectedTopic))
                      .map(subreddit => (
                        <ListItem key={subreddit.name}>
                          <ListItemIcon>
                            <ForumIcon sx={{ color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`r/${subreddit.name}`} 
                            secondary={`${subreddit.postCount} posts`} 
                          />
                        </ListItem>
                      ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {!loading && selectedSubreddit && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Subreddit Detail: r/{selectedSubreddit}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Top Topics in r/{selectedSubreddit}
                  </Typography>
                  
                  <List>
                    {getTopTopicsForSubreddit(selectedSubreddit).map(topic => (
                      <ListItem key={topic?.id}>
                        <ListItemIcon>
                          <TagIcon sx={{ color: `hsl(${topic?.id! * 40}, 70%, 50%)` }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={topic?.name} 
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" component="span">
                                Trend: 
                              </Typography>
                              {getTrendIcon(topic?.trend || 'flat')}
                              <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                                {topic?.percentChange! > 0 ? '+' : ''}{topic?.percentChange}%
                              </Typography>
                            </Box>
                          } 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Common Words in r/{selectedSubreddit}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                    {getTopTopicsForSubreddit(selectedSubreddit)
                      .flatMap(topic => topic?.words || [])
                      .slice(0, 15)
                      .map(word => (
                        <Chip 
                          key={word.word}
                          label={word.word}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderColor: `hsla(${getTopTopicsForSubreddit(selectedSubreddit)[0]?.id! * 40}, 70%, 50%, ${word.weight})`,
                            color: `hsla(${getTopTopicsForSubreddit(selectedSubreddit)[0]?.id! * 40}, 70%, 50%, ${word.weight + 0.3})`,
                            fontWeight: word.weight > 0.8 ? 'bold' : 'normal'
                          }}
                        />
                      ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Based on the topic modeling analysis, we can observe the following patterns:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {topicData && topicData.topics && topicData.topics.length > 0 && (
              <>
                {(() => {
                  // Safely get topics with null checks
                  const dominantTopic = [...topicData.topics].sort((a, b) => b.postCount - a.postCount)[0];
                  const fastestGrowingTopic = [...topicData.topics].sort((a, b) => b.percentChange - a.percentChange)[0];
                  const decliningTopic = [...topicData.topics].find(t => t.percentChange < 0);
                  
                  return (
                    <>
                      {dominantTopic && (
                        <Chip 
                          icon={<TagIcon />} 
                          label={`${dominantTopic.name} is the dominant topic`}
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                      {fastestGrowingTopic && (
                        <Chip 
                          icon={<TrendingUpIcon />} 
                          label={`${fastestGrowingTopic.name} growing fastest`}
                          color="success" 
                          variant="outlined" 
                        />
                      )}
                      {decliningTopic && (
                        <Chip 
                          icon={<TrendingDownIcon />} 
                          label={`${decliningTopic.name} declining`}
                          color="error" 
                          variant="outlined" 
                        />
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </Box>
          
          <Typography variant="body1">
            {topicData && topicData.topics && topicData.topics.length > 0 && topicData.timeData && topicData.timeData.length > 0 ? (
              <>
                {(() => {
                  // Safely get topics with null checks
                  const dominantTopic = [...topicData.topics].sort((a, b) => b.postCount - a.postCount)[0];
                  const fastestGrowingTopic = [...topicData.topics].sort((a, b) => b.percentChange - a.percentChange)[0];
                  const decliningTopic = [...topicData.topics].find(t => t.percentChange < 0);
                  
                  const latestTimeData = topicData.timeData[topicData.timeData.length - 1];
                  const dominantTopicPercentage = latestTimeData?.topicDistribution.find(
                    t => dominantTopic && t.topicId === dominantTopic.id
                  )?.percentage;
                  
                  return (
                    <>
                      {dominantTopic && (
                        <>
                          {dominantTopic.name} is the most discussed topic across the analyzed subreddits
                          {dominantTopicPercentage ? `, accounting for approximately ${dominantTopicPercentage}% of all content` : ''}.
                        </>
                      )}
                      {' '}
                      {fastestGrowingTopic && (
                        <>
                          {fastestGrowingTopic.name}-related topics show the strongest growth at +{fastestGrowingTopic.percentChange}%
                          {fastestGrowingTopic.name === 'Health' ? 
                            ', likely due to increased interest in wellness and healthcare' :
                            ', showing significant community interest in this area'
                          }.
                        </>
                      )}
                      {' '}
                      {decliningTopic ? 
                        `${decliningTopic.name} topics have seen a decline of ${decliningTopic.percentChange}%, possibly reflecting changing interests or seasonal variations.` :
                        'All topics are showing positive or stable trends, indicating broad engagement across subjects.'
                      }
                    </>
                  );
                })()}
              </>
            ) : (
              'No topic modeling data available for analysis.'
            )}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 