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
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TimelineIcon from '@mui/icons-material/Timeline';

export default function TimeSeriesPage() {
  const [loading, setLoading] = useState(true);
  const [timeUnit, setTimeUnit] = useState('day');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Simulate API call with timeout
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        // Mock time series data
        const mockData = {
          labels: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10'],
          datasets: [
            {
              label: 'Post Volume',
              data: [120, 190, 300, 250, 280, 500, 480, 390, 600, 550],
              trend: 'up',
              percentChange: 32.5,
            }
          ],
          subreddits: [
            { name: 'technology', data: [50, 80, 120, 90, 100, 200, 180, 150, 250, 220], trend: 'up' },
            { name: 'politics', data: [30, 50, 80, 70, 90, 150, 140, 120, 180, 160], trend: 'up' },
            { name: 'science', data: [20, 30, 50, 40, 50, 80, 90, 70, 100, 90], trend: 'up' },
            { name: 'news', data: [10, 20, 30, 35, 25, 40, 50, 30, 45, 55], trend: 'up' },
            { name: 'worldnews', data: [10, 10, 20, 15, 15, 30, 20, 20, 25, 25], trend: 'flat' },
          ],
          stats: {
            total: 3740,
            average: 374,
            peak: { value: 600, date: 'Jan 9' },
            trend: 'up',
            percentChange: 32.5,
          }
        };
        
        setChartData(mockData);
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
  }, [timeUnit]);

  const handleTimeUnitChange = (unit: string) => {
    setTimeUnit(unit);
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
        Time Series Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze posting activity over time to identify trends and patterns in social media content.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Post Volume Over Time
          </Typography>
          
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => handleTimeUnitChange('hour')}
              variant={timeUnit === 'hour' ? 'contained' : 'outlined'}
            >
              Hourly
            </Button>
            <Button 
              onClick={() => handleTimeUnitChange('day')}
              variant={timeUnit === 'day' ? 'contained' : 'outlined'}
            >
              Daily
            </Button>
            <Button 
              onClick={() => handleTimeUnitChange('week')}
              variant={timeUnit === 'week' ? 'contained' : 'outlined'}
            >
              Weekly
            </Button>
            <Button 
              onClick={() => handleTimeUnitChange('month')}
              variant={timeUnit === 'month' ? 'contained' : 'outlined'}
            >
              Monthly
            </Button>
          </ButtonGroup>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Placeholder for chart - in a real app, you would use a chart library */}
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
                Time Series Chart Placeholder
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overall Statistics
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Posts
                        </Typography>
                        <Typography variant="h5">
                          {chartData?.stats.total.toLocaleString()}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Average Per Day
                        </Typography>
                        <Typography variant="h5">
                          {chartData?.stats.average.toLocaleString()}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Peak Volume
                        </Typography>
                        <Typography variant="h5">
                          {chartData?.stats.peak.value.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          on {chartData?.stats.peak.date}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Overall Trend
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getTrendIcon(chartData?.stats.trend)}
                          <Typography variant="h5" sx={{ ml: 1 }}>
                            {chartData?.stats.percentChange}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Subreddits
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {chartData?.subreddits.map((subreddit: any, index: number) => (
                      <Box key={subreddit.name} sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ minWidth: 120 }}>
                          r/{subreddit.name}
                        </Typography>
                        
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              bgcolor: `hsl(${index * 36}, 70%, 50%)`,
                              width: `${(Math.max(...subreddit.data) / Math.max(...chartData.datasets[0].data)) * 100}%`,
                              borderRadius: 1,
                            }} 
                          />
                        </Box>
                        
                        {getTrendIcon(subreddit.trend)}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Based on the time series analysis, we can observe the following trends:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              icon={<TrendingUpIcon />} 
              label="Increasing trend in post volume" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<TimelineIcon />} 
              label="Peak activity on weekends" 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label="Technology subreddit most active" 
              color="secondary" 
              variant="outlined" 
            />
          </Box>
          
          <Typography variant="body1">
            The data shows a significant increase in posting activity over the analyzed period, with a 
            {chartData?.stats.percentChange}% growth. The peak activity was observed on {chartData?.stats.peak.date} 
            with {chartData?.stats.peak.value} posts. The technology subreddit shows the highest activity, 
            followed by politics and science.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 