import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Link,
  useTheme,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ForumIcon from '@mui/icons-material/Forum';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import DescriptionIcon from '@mui/icons-material/Description';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useNavigate } from 'react-router-dom';

// Team member data
const teamMembers = [
  {
    name: 'Jane Smith',
    role: 'Data Scientist',
    bio: 'Specializes in NLP and sentiment analysis with 5+ years of experience in social media analytics.',
    image: 'https://via.placeholder.com/150',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'John Doe',
    role: 'Full Stack Developer',
    bio: 'Experienced in React and Python, building data visualization tools and interactive dashboards.',
    image: 'https://via.placeholder.com/150',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Alex Johnson',
    role: 'UX/UI Designer',
    bio: 'Creates intuitive user experiences with a focus on data visualization and information architecture.',
    image: 'https://via.placeholder.com/150',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
];

// Feature data
const features = [
  {
    title: 'Time Series Analysis',
    description: 'Track post volume and engagement trends over time, by day, week, or month.',
    icon: <TimelineIcon fontSize="large" />,
    path: '/time-series-analysis',
  },
  {
    title: 'Network Analysis',
    description: 'Visualize connections between subreddits, authors, and topics in interactive 2D/3D graphs.',
    icon: <BubbleChartIcon fontSize="large" />,
    path: '/network-analysis',
  },
  {
    title: 'Sentiment Analysis',
    description: 'Analyze the emotional tone of posts and track sentiment trends over time.',
    icon: <SentimentSatisfiedAltIcon fontSize="large" />,
    path: '/sentiment-analysis',
  },
  {
    title: 'Topic Modeling',
    description: 'Discover key themes and topics within content using advanced NLP techniques.',
    icon: <ForumIcon fontSize="large" />,
    path: '/topic-modeling',
  },
  {
    title: 'AI Summary',
    description: 'Get AI-generated insights, trend analysis, and content summaries.',
    icon: <SmartToyIcon fontSize="large" />,
    path: '/ai-summary',
  },
  {
    title: 'Advanced Search',
    description: 'Filter content by subreddit, author, date range, and keywords.',
    icon: <SearchIcon fontSize="large" />,
    path: '/search',
  },
];

// Technologies used
const technologies = [
  { name: 'React', category: 'Frontend' },
  { name: 'Material UI', category: 'Frontend' },
  { name: 'Plotly.js', category: 'Visualization' },
  { name: 'React-Force-Graph', category: 'Visualization' },
  { name: 'Flask', category: 'Backend' },
  { name: 'SQLite', category: 'Database' },
  { name: 'PRAW (Reddit API)', category: 'Data Collection' },
  { name: 'NLTK', category: 'NLP' },
  { name: 'Scikit-learn', category: 'Machine Learning' },
  { name: 'Pandas', category: 'Data Processing' },
  { name: 'GPT-3.5', category: 'AI' },
];

// About Component
const About = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        About This Project
      </Typography>
      
      {/* Project Overview */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Social Media Analysis Dashboard
        </Typography>
        
        <Typography variant="body1" paragraph>
          This interactive dashboard provides comprehensive tools for analyzing Reddit data, 
          helping researchers, marketers, and content creators gain valuable insights from social media conversations.
        </Typography>
        
        <Typography variant="body1" paragraph>
          From tracking engagement trends over time to identifying key topics and sentiment patterns, 
          this platform offers a robust suite of visualization and analysis tools that make complex data 
          accessible and actionable.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Explore Dashboard
        </Button>
      </Paper>
      
      {/* Key Features */}
      <Typography variant="h5" gutterBottom>
        Key Features
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
                cursor: 'pointer',
              }}
              onClick={() => navigate(feature.path)}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: theme.palette.primary.main,
                }}
              >
                {feature.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom align="center">
                  {feature.title}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Technologies Used */}
      <Typography variant="h5" gutterBottom>
        Technologies Used
      </Typography>
      
      <Paper sx={{ p: 3, mb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CodeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Frontend & Visualization</Typography>
            </Box>
            <List dense>
              {technologies
                .filter(tech => tech.category === 'Frontend' || tech.category === 'Visualization')
                .map(tech => (
                  <ListItem key={tech.name}>
                    <ListItemText 
                      primary={tech.name} 
                      secondary={tech.category} 
                    />
                  </ListItem>
                ))
              }
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorageIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Backend & Data Processing</Typography>
            </Box>
            <List dense>
              {technologies
                .filter(tech => 
                  tech.category === 'Backend' || 
                  tech.category === 'Database' || 
                  tech.category === 'Data Collection' ||
                  tech.category === 'Data Processing'
                )
                .map(tech => (
                  <ListItem key={tech.name}>
                    <ListItemText 
                      primary={tech.name} 
                      secondary={tech.category} 
                    />
                  </ListItem>
                ))
              }
            </List>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LightbulbIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">ML & AI</Typography>
            </Box>
            <List dense sx={{ columns: { xs: 1, sm: 2 } }}>
              {technologies
                .filter(tech => 
                  tech.category === 'NLP' || 
                  tech.category === 'Machine Learning' || 
                  tech.category === 'AI'
                )
                .map(tech => (
                  <ListItem key={tech.name}>
                    <ListItemText 
                      primary={tech.name} 
                      secondary={tech.category} 
                    />
                  </ListItem>
                ))
              }
            </List>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Project Architecture */}
      <Typography variant="h5" gutterBottom>
        Project Architecture
      </Typography>
      
      <Paper sx={{ p: 3, mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <AccountTreeIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <Typography variant="body1" paragraph>
              The dashboard follows a client-server architecture with a React frontend and a Flask backend API.
              Data is collected from Reddit using PRAW, processed using NLP techniques, and stored in a SQLite database.
              The frontend communicates with the backend via RESTful API endpoints to fetch and display the data.
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Frontend Structure
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Components-based architecture" 
                  secondary="Reusable UI components for consistency" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Context API for state management" 
                  secondary="Centralized data handling across components" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="React Router for navigation" 
                  secondary="Client-side routing between analysis tools" 
                />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Backend Structure
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="RESTful API endpoints" 
                  secondary="JSON data exchange between client and server" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Data processing pipeline" 
                  secondary="Cleaning, analysis, and feature extraction" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Caching system" 
                  secondary="Performance optimization for repeated queries" 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Documentation & Resources */}
      <Typography variant="h5" gutterBottom>
        Documentation & Resources
      </Typography>
      
      <Paper sx={{ p: 3, mb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    API Documentation
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Comprehensive documentation for all backend API endpoints, 
                  including request parameters, response formats, and examples.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<CodeIcon />}
                  component={Link} 
                  href="#"
                >
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GitHubIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Source Code
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  The project is open-source and available on GitHub. 
                  Feel free to explore the code, report issues, or contribute.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<GitHubIcon />}
                  component={Link} 
                  href="https://github.com"
                >
                  GitHub Repository
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Contact Information */}
      <Typography variant="h5" gutterBottom>
        Our Team
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {teamMembers.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.name}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={member.image}
                alt={member.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {member.name}
                </Typography>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {member.role}
                </Typography>
                <Typography variant="body2" paragraph>
                  {member.bio}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<GitHubIcon />}
                    component={Link} 
                    href={member.github}
                    target="_blank" 
                    rel="noopener"
                  >
                    GitHub
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<LinkedInIcon />}
                    component={Link} 
                    href={member.linkedin}
                    target="_blank" 
                    rel="noopener"
                  >
                    LinkedIn
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Footer */}
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Social Media Analysis Dashboard | Built for research and educational purposes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Data collected from Reddit using the official API in compliance with the Terms of Service.
        </Typography>
      </Paper>
    </Box>
  );
};

export default About;