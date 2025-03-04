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
  Alert,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Timeline as TimelineIcon,
  CloudDone as CloudDoneIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { PlotParams } from 'react-plotly.js';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false }) as React.ComponentType<PlotParams>;

// Define the data structure for time series data
interface TimeSeriesDataPoint {
  period: string;
  post_count: number;
  comment_count: number;
  avg_score: number;
}

export default function TimeSeriesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [timeUnit, setTimeUnit] = useState('day');
  const [stats, setStats] = useState({
    total_posts: 0,
    average_posts: 0,
    peak: { date: '', count: 0 },
    trend: { direction: 'flat' as 'up' | 'down' | 'flat', percent_change: 0 }
  });
  const [dataSource, setDataSource] = useState<'backend' | 'sample'>('sample');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timeseries?interval=${timeUnit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch time series data');
        }
        const data = await response.json();
        setTimeSeriesData(data);
        setDataSource('backend');
        
        // Calculate statistics from the data
        if (data && data.length > 0) {
          // Total posts
          const totalPosts = data.reduce((sum: number, item: TimeSeriesDataPoint) => sum + item.post_count, 0);
          
          // Average posts per period
          const avgPosts = Math.round(totalPosts / data.length);
          
          // Find peak
          const peakItem = [...data].sort((a, b) => b.post_count - a.post_count)[0];
          
          // Calculate trend (difference between first and last period)
          const firstPeriod = data[0];
          const lastPeriod = data[data.length - 1];
          let direction: 'up' | 'down' | 'flat' = 'flat';
          let percentChange = 0;
          
          if (firstPeriod && lastPeriod) {
            if (lastPeriod.post_count > firstPeriod.post_count) {
              direction = 'up';
            } else if (lastPeriod.post_count < firstPeriod.post_count) {
              direction = 'down';
            }
            
            if (firstPeriod.post_count > 0) {
              percentChange = ((lastPeriod.post_count - firstPeriod.post_count) / firstPeriod.post_count) * 100;
            }
          }
          
          setStats({
            total_posts: totalPosts,
            average_posts: avgPosts,
            peak: { date: peakItem.period, count: peakItem.post_count },
            trend: { direction, percent_change: percentChange }
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Create some sample data if the API fails
        const sampleData = generateSampleData();
        setTimeSeriesData(sampleData);
        setDataSource('sample');
        setStats({
          total_posts: sampleData.reduce((sum, item) => sum + item.post_count, 0),
          average_posts: Math.round(sampleData.reduce((sum, item) => sum + item.post_count, 0) / sampleData.length),
          peak: { date: '2025-02-14', count: 633 },
          trend: { direction: 'up', percent_change: 143 }
        });
      } finally {
        setLoading(false);
      }
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

  // Function to generate sample data if API fails
  const generateSampleData = (): TimeSeriesDataPoint[] => {
    const today = new Date();
    const sampleData: TimeSeriesDataPoint[] = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate some random data with an upward trend
      const basePosts = 100 + Math.floor(i * 10 * Math.random());
      sampleData.push({
        period: dateStr,
        post_count: basePosts,
        comment_count: basePosts * 3 + Math.floor(Math.random() * 100),
        avg_score: Math.floor(Math.random() * 200) + 50
      });
    }
    
    return sampleData;
  };

  // Client-side only rendering
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !timeSeriesData.length) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Time Series Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze posting activity over time to identify trends and patterns in social media content.
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Chip 
          icon={dataSource === 'backend' ? <CloudDoneIcon /> : <CodeIcon />}
          label={dataSource === 'backend' ? 'Data from API' : 'Sample Data (API unavailable)'}
          color={dataSource === 'backend' ? 'success' : 'warning'}
          variant="outlined"
        />
      </Box>
      
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
        
        <Box sx={{ height: 400, mb: 3 }}>
          {isClient && timeSeriesData.length > 0 && (
            <Plot
              data={[
                {
                  x: timeSeriesData.map(d => d.period),
                  y: timeSeriesData.map(d => d.post_count),
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: '#1976d2' },
                  name: 'Post Count',
                },
              ]}
              layout={{
                autosize: true,
                margin: { l: 50, r: 20, t: 20, b: 50 },
                xaxis: {
                  title: 'Date',
                  showgrid: false,
                },
                yaxis: {
                  title: 'Number of Posts',
                  showgrid: true,
                  gridcolor: '#f0f0f0',
                },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                showlegend: false,
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
            />
          )}
          {!isClient && (
            <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <TimelineIcon sx={{ fontSize: 60, opacity: 0.5, mr: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Chart loading...
              </Typography>
            </Box>
          )}
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
                      {stats.total_posts.toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Average Per {timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}
                    </Typography>
                    <Typography variant="h5">
                      {stats.average_posts.toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Peak Volume
                    </Typography>
                    <Typography variant="h5">
                      {stats.peak.count.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      on {stats.peak.date}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Trend
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTrendIcon(stats.trend.direction)}
                      <Typography variant="h5" sx={{ ml: 1 }}>
                        {Math.abs(stats.trend.percent_change).toFixed(1)}%
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
                  Insights
                </Typography>
                
                <Typography variant="body1" paragraph>
                  Based on the time series analysis, we can observe:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="info">
                    Peak activity of {stats.peak.count.toLocaleString()} posts was recorded on{' '}
                    {stats.peak.date}
                  </Alert>
                  
                  <Alert severity={stats.trend.direction === 'up' ? 'success' : stats.trend.direction === 'down' ? 'warning' : 'info'}>
                    Post volume shows a {stats.trend.direction}ward trend with a{' '}
                    {Math.abs(stats.trend.percent_change).toFixed(1)}% {stats.trend.direction === 'up' ? 'increase' : stats.trend.direction === 'down' ? 'decrease' : 'change'}
                  </Alert>
                  
                  <Alert severity="success">
                    Average of {stats.average_posts.toLocaleString()} posts per {timeUnit}
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
} 