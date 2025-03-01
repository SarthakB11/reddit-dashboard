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
} from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import ForumIcon from '@mui/icons-material/Forum';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

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

export default function TopicModelingPage() {
  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState<TopicModelingData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate API call with timeout
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        const data = generateMockTopicModelingData();
        setTopicData(data);
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
  }, []);
  
  const handleTopicChange = (event: SelectChangeEvent) => {
    setSelectedTopic(Number(event.target.value));
  };
  
  const handleSubredditChange = (event: SelectChangeEvent) => {
    setSelectedSubreddit(event.target.value);
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Topic Modeling
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Discover the main themes and topics discussed across social media platforms using natural language processing.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
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
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Placeholder for topic distribution visualization */}
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
                <BubbleChartIcon sx={{ fontSize: 40, opacity: 0.7, mr: 1 }} />
                Topic Distribution Visualization Placeholder
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Topics
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {topicData?.topics
                      .sort((a, b) => b.postCount - a.postCount)
                      .slice(0, 5)
                      .map((topic, index) => (
                        <Box key={topic.id} sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                          <TagIcon sx={{ mr: 1, color: `hsl(${topic.id * 40}, 70%, 50%)` }} />
                          
                          <Typography variant="body1" sx={{ minWidth: 120 }}>
                            {topic.name}
                          </Typography>
                          
                          <Box sx={{ flexGrow: 1, mx: 2 }}>
                            <Box 
                              sx={{ 
                                height: 8, 
                                bgcolor: `hsl(${topic.id * 40}, 70%, 50%)`,
                                width: `${(topic.postCount / topicData.topics[0].postCount) * 100}%`,
                                borderRadius: 1,
                              }} 
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getTrendIcon(topic.trend)}
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {topic.percentChange > 0 ? '+' : ''}{topic.percentChange}%
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Topic Trends Over Time
                    </Typography>
                    
                    {/* Placeholder for topic trends chart */}
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
                        Topic Trends Chart Placeholder
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      The chart shows how topic distribution has changed over time. Technology and Health topics show the strongest growth trends.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
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
            <Chip 
              icon={<TagIcon />} 
              label="Technology is the dominant topic" 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              icon={<TrendingUpIcon />} 
              label="Health topics growing fastest" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<TrendingDownIcon />} 
              label="Sports topics declining" 
              color="error" 
              variant="outlined" 
            />
          </Box>
          
          <Typography variant="body1">
            The topic modeling reveals that Technology is the most discussed topic across the analyzed subreddits,
            accounting for approximately {topicData?.timeData[topicData.timeData.length - 1].topicDistribution.find(t => t.topicId === 1)?.percentage}% of all content.
            Health-related topics show the strongest growth at +{topicData?.topics.find(t => t.id === 6)?.percentChange}%,
            likely due to increased interest in wellness and healthcare.
            Sports topics have seen a decline of {topicData?.topics.find(t => t.id === 5)?.percentChange}%,
            possibly reflecting seasonal variations in sporting events.
          </Typography>
        </Paper>
      </Box>
      
      <ClientOnly>
        {/* Wrap the problematic parts with ClientOnly */}
        {/* Content that may cause hydration errors */}
      </ClientOnly>
    </Box>
  );
} 