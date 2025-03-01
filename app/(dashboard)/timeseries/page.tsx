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
  Tabs,
  Tab,
  ButtonGroup,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import EventIcon from '@mui/icons-material/Event';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import MovingIcon from '@mui/icons-material/Moving';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import SearchFilters component
import SearchFilters from '@/app/components/common/SearchFilters';
import { formatDate, formatNumber } from '@/app/lib/formatters';

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Interface for time series data point
interface TimeSeriesPoint {
  date: string;
  value: number;
  subreddit?: string;
}

// Mock data for development
const mockTimeSeriesData: TimeSeriesPoint[] = [
  { date: '2023-01-01', value: 245 },
  { date: '2023-01-02', value: 267 },
  { date: '2023-01-03', value: 289 },
  { date: '2023-01-04', value: 302 },
  { date: '2023-01-05', value: 335 },
  { date: '2023-01-06', value: 367 },
  { date: '2023-01-07', value: 389 },
  { date: '2023-01-08', value: 356 },
  { date: '2023-01-09', value: 321 },
  { date: '2023-01-10', value: 298 },
  { date: '2023-01-11', value: 275 },
  { date: '2023-01-12', value: 253 },
  { date: '2023-01-13', value: 278 },
  { date: '2023-01-14', value: 301 },
  { date: '2023-01-15', value: 325 },
  { date: '2023-01-16', value: 356 },
  { date: '2023-01-17', value: 389 },
  { date: '2023-01-18', value: 423 },
  { date: '2023-01-19', value: 467 },
  { date: '2023-01-20', value: 498 },
  { date: '2023-01-21', value: 534 },
  { date: '2023-01-22', value: 567 },
  { date: '2023-01-23', value: 598 },
  { date: '2023-01-24', value: 623 },
  { date: '2023-01-25', value: 645 },
  { date: '2023-01-26', value: 689 },
  { date: '2023-01-27', value: 721 },
  { date: '2023-01-28', value: 756 },
  { date: '2023-01-29', value: 789 },
  { date: '2023-01-30', value: 823 },
  { date: '2023-01-31', value: 856 },
];

// Mock data for breakdown by subreddit
const mockSubredditData = [
  { date: '2023-01-01', value: 120, subreddit: 'politics' },
  { date: '2023-01-01', value: 85, subreddit: 'news' },
  { date: '2023-01-01', value: 40, subreddit: 'worldnews' },
  { date: '2023-01-02', value: 135, subreddit: 'politics' },
  { date: '2023-01-02', value: 92, subreddit: 'news' },
  { date: '2023-01-02', value: 40, subreddit: 'worldnews' },
  // ... more data
];

// Mock statistics
const mockStatistics = {
  total: 12567,
  average: 405.4,
  min: 245,
  max: 856,
  growth: 0.28, // 28% growth
  peakDay: '2023-01-31',
  trend: 'increasing',
};

// Mock peak dates
const mockPeaks = [
  { date: '2023-01-26', value: 689, event: 'Major news event about climate policy' },
  { date: '2023-01-31', value: 856, event: 'Viral post about political controversy' },
];

export default function TimeSeriesAnalysis() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [peaks, setPeaks] = useState<any[]>([]);
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [timeUnit, setTimeUnit] = useState('day');
  const [chartType, setChartType] = useState('line');
  
  // Get search parameters from URL
  const getSearchParamsObject = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  // Fetch time series data based on search params
  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      setLoading(true);
      setError(null);
      
      const params = getSearchParamsObject();
      
      try {
        // For demo purposes, use mock data with a delay
        setTimeout(() => {
          setTimeSeriesData(mockTimeSeriesData);
          setStatistics(mockStatistics);
          setPeaks(mockPeaks);
          setLoading(false);
        }, 1000);
        
        // In production, fetch from API:
        // const response = await fetchTimeSeries(params);
        // setTimeSeriesData(response.data);
        // setStatistics(response.statistics);
        // setPeaks(response.peaks);
      } catch (err) {
        console.error('Error fetching time series data:', err);
        setError('Failed to fetch time series data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeSeriesData();
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
    router.push(`/timeseries?${urlParams.toString()}`);
  };
  
  // Handle time unit change
  const handleTimeUnitChange = (unit: string) => {
    setTimeUnit(unit);
    // In production: fetch new data with the selected time unit
  };
  
  // Handle chart type change
  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Prepare data for Plotly based on selected options
  const getPlotData = () => {
    if (!timeSeriesData || timeSeriesData.length === 0) {
      return [];
    }
    
    // Basic line or bar chart data
    if (tabValue === 0) {
      return [
        {
          x: timeSeriesData.map(point => point.date),
          y: timeSeriesData.map(point => point.value),
          type: chartType === 'line' ? 'scatter' : 'bar',
          mode: chartType === 'line' ? 'lines+markers' : undefined,
          marker: {
            color: theme.palette.primary.main,
          },
          line: chartType === 'line' ? {
            width: 3,
            shape: 'spline',
          } : undefined,
        }
      ];
    }
    
    // Breakdown by subreddit (stacked or grouped)
    if (tabValue === 1) {
      // Group data by subreddit
      const subreddits = Array.from(new Set(mockSubredditData.map(d => d.subreddit)));
      const dates = Array.from(new Set(mockSubredditData.map(d => d.date)));
      
      return subreddits.map((subreddit, index) => {
        const subredditData = mockSubredditData.filter(d => d.subreddit === subreddit);
        
        return {
          name: subreddit,
          x: dates,
          y: dates.map(date => {
            const point = subredditData.find(d => d.date === date);
            return point ? point.value : 0;
          }),
          type: chartType === 'line' ? 'scatter' : 'bar',
          mode: chartType === 'line' ? 'lines+markers' : undefined,
          marker: {
            color: `hsl(${index * 137 % 360}, 70%, 60%)`,
          },
          line: chartType === 'line' ? {
            width: 2,
          } : undefined,
        };
      });
    }
    
    // Cumulative view
    if (tabValue === 2) {
      let cumulative = 0;
      const cumulativeData = timeSeriesData.map(point => {
        cumulative += point.value;
        return { date: point.date, value: cumulative };
      });
      
      return [
        {
          x: cumulativeData.map(point => point.date),
          y: cumulativeData.map(point => point.value),
          type: 'scatter',
          mode: 'lines',
          fill: 'tozeroy',
          line: {
            width: 3,
            shape: 'spline',
          },
          marker: {
            color: theme.palette.primary.main,
          },
        }
      ];
    }
    
    return [];
  };
  
  // Get layout configuration for Plotly
  const getPlotLayout = () => {
    return {
      autosize: true,
      margin: { l: 50, r: 30, t: 10, b: 50 },
      height: 400,
      xaxis: {
        title: { text: 'Date' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      yaxis: {
        title: { text: 'Post Count' },
        gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      barmode: tabValue === 1 ? 'stack' : 'group',
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDarkMode ? '#e0e0e0' : '#333333',
      },
      showlegend: tabValue === 1,
      legend: {
        orientation: 'h',
        y: -0.2,
      },
      hovermode: 'closest',
    };
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Time Series Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze how post volume and engagement change over time. Identify trends, seasonal patterns, and key events that caused spikes in activity.
      </Typography>
      
      <SearchFilters 
        onSearch={handleSearch} 
        defaultValues={getSearchParamsObject()}
      />
      
      {/* Main content */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Time series chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            {/* Loading state */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            )}
            
            {/* Error state */}
            {!loading && error && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            )}
            
            {/* Chart view with controls */}
            {!loading && !error && timeSeriesData.length > 0 && (
              <>
                {/* Chart type and time unit controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <ButtonGroup size="small" aria-label="Chart type">
                    <Button 
                      variant={chartType === 'line' ? 'contained' : 'outlined'} 
                      onClick={() => handleChartTypeChange('line')}
                      startIcon={<TimelineIcon />}
                    >
                      Line
                    </Button>
                    <Button 
                      variant={chartType === 'bar' ? 'contained' : 'outlined'} 
                      onClick={() => handleChartTypeChange('bar')}
                      startIcon={<BarChartIcon />}
                    >
                      Bar
                    </Button>
                  </ButtonGroup>
                  
                  <ButtonGroup size="small" aria-label="Time unit">
                    <Button 
                      variant={timeUnit === 'day' ? 'contained' : 'outlined'} 
                      onClick={() => handleTimeUnitChange('day')}
                    >
                      Daily
                    </Button>
                    <Button 
                      variant={timeUnit === 'week' ? 'contained' : 'outlined'} 
                      onClick={() => handleTimeUnitChange('week')}
                    >
                      Weekly
                    </Button>
                    <Button 
                      variant={timeUnit === 'month' ? 'contained' : 'outlined'} 
                      onClick={() => handleTimeUnitChange('month')}
                    >
                      Monthly
                    </Button>
                  </ButtonGroup>
                </Box>
                
                {/* Tabs for different views */}
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  aria-label="time series view tabs"
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                  <Tab icon={<MovingIcon />} label="Overview" />
                  <Tab icon={<StackedBarChartIcon />} label="By Subreddit" />
                  <Tab icon={<BubbleChartIcon />} label="Cumulative" />
                </Tabs>
                
                {/* The chart */}
                <Box sx={{ height: 400, width: '100%' }}>
                  <Plot
                    data={getPlotData()}
                    layout={getPlotLayout()}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Box>
              </>
            )}
            
            {/* Empty state */}
            {!loading && !error && (!timeSeriesData || timeSeriesData.length === 0) && (
              <Alert severity="info" sx={{ my: 4 }}>
                No time series data available for the current filters. Try adjusting your search criteria.
              </Alert>
            )}
          </Paper>
        </Grid>
        
        {/* Statistics and insights */}
        {!loading && !error && statistics && (
          <>
            {/* Statistics cards */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Summary Statistics
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <BarChartIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Total Posts" 
                        secondary={formatNumber(statistics.total)} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <TimelineIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Daily Average" 
                        secondary={formatNumber(statistics.average)} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <TrendingDownIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Minimum" 
                        secondary={`${formatNumber(statistics.min)} (${formatDate(timeSeriesData[0].date)})`} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <TrendingUpIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Maximum" 
                        secondary={`${formatNumber(statistics.max)} (${formatDate(statistics.peakDay)})`} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {statistics.trend === 'increasing' ? (
                          <TrendingUpIcon color="success" />
                        ) : statistics.trend === 'decreasing' ? (
                          <TrendingDownIcon color="error" />
                        ) : (
                          <TrendingFlatIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Overall Trend" 
                        secondary={
                          <Typography 
                            variant="body2" 
                            color={
                              statistics.trend === 'increasing' 
                                ? 'success.main' 
                                : statistics.trend === 'decreasing' 
                                ? 'error.main' 
                                : 'warning.main'
                            }
                          >
                            {statistics.trend.charAt(0).toUpperCase() + statistics.trend.slice(1)}
                            {statistics.growth && ` (${(statistics.growth * 100).toFixed(1)}%)`}
                          </Typography>
                        } 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Peak events */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notable Events
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    These dates had significant activity spikes that may correlate with important real-world events.
                  </Typography>
                  
                  {peaks.map((peak, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                          {formatDate(peak.date)}
                        </Typography>
                        <Chip 
                          label={`${formatNumber(peak.value)} posts`} 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 2 }} 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {peak.event}
                      </Typography>
                      {index < peaks.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                  
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    component={Link}
                    href={searchParams ? `/sentiment?${searchParams.toString()}` : '/sentiment'}
                  >
                    Analyze Sentiment for These Dates
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
} 