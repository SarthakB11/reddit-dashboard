import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Tabs,
  Tab,
  Chip,
  ButtonGroup,
  Button,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import EventIcon from '@mui/icons-material/Event';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import { parseISO, format, differenceInDays } from 'date-fns';
import Plot from 'react-plotly.js';

import { useData } from '../context/DataContext';
import { formatNumber, formatDate, formatPercent } from '../utils/formatters';
import SearchFilters from '../components/common/SearchFilters';
import LoadingState from '../components/common/LoadingState';
import CacheIndicator from '../components/common/CacheIndicator';

const TimeSeriesAnalysis = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { 
    timeSeries, 
    loading, 
    errors, 
    cacheStatus,
    fetchTimeSeriesData, 
    refreshData,
    searchParams 
  } = useData();
  
  const [timeUnit, setTimeUnit] = useState('day');
  const [chartType, setChartType] = useState('line');
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchTimeSeriesData();
  }, [fetchTimeSeriesData]);
  
  // Handle search submission
  const handleSearch = (params) => {
    fetchTimeSeriesData(params);
  };
  
  // Handle time unit change
  const handleTimeUnitChange = (unit) => {
    setTimeUnit(unit);
  };
  
  // Handle chart type change
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  // Prepare chart data based on time unit and chart type
  const chartData = useMemo(() => {
    if (!timeSeries || !timeSeries.data || timeSeries.data.length === 0) {
      return null;
    }
    
    // Get raw data
    const data = [...timeSeries.data];
    
    // Sort data by date
    data.sort((a, b) => new Date(a.period) - new Date(b.period));
    
    // Aggregate data by time unit if needed
    let aggregatedData = data;
    
    if (timeUnit === 'week') {
      // Aggregate by week
      const weeklyData = {};
      data.forEach(item => {
        const date = parseISO(item.period);
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            period: weekKey,
            post_count: 0,
            comment_count: 0,
            engagement_score: 0
          };
        }
        
        weeklyData[weekKey].post_count += item.post_count;
        weeklyData[weekKey].comment_count += item.comment_count || 0;
        weeklyData[weekKey].engagement_score += item.engagement_score || 0;
      });
      
      aggregatedData = Object.values(weeklyData);
    } else if (timeUnit === 'month') {
      // Aggregate by month
      const monthlyData = {};
      data.forEach(item => {
        const monthKey = item.period.substring(0, 7); // YYYY-MM
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            period: `${monthKey}-01`,
            post_count: 0,
            comment_count: 0,
            engagement_score: 0
          };
        }
        
        monthlyData[monthKey].post_count += item.post_count;
        monthlyData[monthKey].comment_count += item.comment_count || 0;
        monthlyData[monthKey].engagement_score += item.engagement_score || 0;
      });
      
      aggregatedData = Object.values(monthlyData);
    }
    
    // Sort the aggregated data
    aggregatedData.sort((a, b) => new Date(a.period) - new Date(b.period));
    
    // Format data for Plotly
    const x = aggregatedData.map(item => item.period);
    const y = aggregatedData.map(item => item.post_count);
    const y2 = aggregatedData.map(item => item.comment_count || 0);
    
    // Create traces
    const traces = [];
    
    // Post count trace
    traces.push({
      x,
      y,
      type: chartType === 'line' ? 'scatter' : 'bar',
      mode: chartType === 'line' ? 'lines+markers' : undefined,
      name: 'Posts',
      marker: {
        color: theme.palette.primary.main,
      },
    });
    
    // Comment count trace (if available)
    if (aggregatedData[0].comment_count !== undefined) {
      traces.push({
        x,
        y: y2,
        type: chartType === 'line' ? 'scatter' : 'bar',
        mode: chartType === 'line' ? 'lines+markers' : undefined,
        name: 'Comments',
        marker: {
          color: theme.palette.secondary.main,
        },
        yaxis: 'y2',
      });
    }
    
    return {
      raw: data,
      aggregated: aggregatedData,
      traces,
    };
  }, [timeSeries, timeUnit, chartType, theme.palette.primary.main, theme.palette.secondary.main]);
  
  // Calculate insights from the time series data
  const insights = useMemo(() => {
    if (!chartData || !chartData.aggregated || chartData.aggregated.length < 2) {
      return null;
    }
    
    const data = chartData.aggregated;
    
    // Calculate total posts
    const totalPosts = data.reduce((sum, item) => sum + item.post_count, 0);
    
    // Calculate average posts per time unit
    const avgPosts = totalPosts / data.length;
    
    // Find max and min points
    const maxPoint = data.reduce((max, item) => 
      item.post_count > max.post_count ? item : max, data[0]);
      
    const minPoint = data.reduce((min, item) => 
      item.post_count < min.post_count ? item : min, data[0]);
    
    // Calculate trend
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    const postCountChange = lastPoint.post_count - firstPoint.post_count;
    const percentChange = firstPoint.post_count !== 0 
      ? (postCountChange / firstPoint.post_count) 
      : 0;
    
    // Determine trend direction
    let trendDirection = 'stable';
    let trendIcon = <TrendingFlatIcon />;
    let trendColor = theme.palette.warning.main;
    
    if (percentChange > 0.05) {
      trendDirection = 'increasing';
      trendIcon = <TrendingUpIcon />;
      trendColor = theme.palette.success.main;
    } else if (percentChange < -0.05) {
      trendDirection = 'decreasing';
      trendIcon = <TrendingDownIcon />;
      trendColor = theme.palette.error.main;
    }
    
    // Check for seasonality (basic approach)
    let seasonality = 'none';
    if (data.length >= 14 && timeUnit === 'day') {
      // Check weekly pattern (simplified)
      const weekdayCounts = Array(7).fill(0);
      const weekdayOccurrences = Array(7).fill(0);
      
      data.forEach(item => {
        const date = parseISO(item.period);
        const dayOfWeek = date.getDay();
        weekdayCounts[dayOfWeek] += item.post_count;
        weekdayOccurrences[dayOfWeek]++;
      });
      
      // Calculate average by day of week
      const avgByDayOfWeek = weekdayCounts.map((count, index) => 
        weekdayOccurrences[index] > 0 ? count / weekdayOccurrences[index] : 0);
      
      // Calculate coefficient of variation
      const avgOfAvgs = avgByDayOfWeek.reduce((sum, val) => sum + val, 0) / 7;
      const variance = avgByDayOfWeek.reduce((sum, val) => sum + Math.pow(val - avgOfAvgs, 2), 0) / 7;
      const stdDev = Math.sqrt(variance);
      const cv = avgOfAvgs > 0 ? stdDev / avgOfAvgs : 0;
      
      if (cv > 0.2) {
        seasonality = 'weekly';
      }
    }
    
    return {
      totalPosts,
      avgPosts,
      maxPoint,
      minPoint,
      trendDirection,
      trendIcon,
      trendColor,
      percentChange,
      seasonality,
      timeSpan: differenceInDays(parseISO(lastPoint.period), parseISO(firstPoint.period)),
    };
  }, [chartData, theme.palette.error.main, theme.palette.success.main, theme.palette.warning.main, timeUnit]);
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
        Time Series Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze how post volume and engagement change over time. Identify trends, peaks, and patterns in activity.
      </Typography>
      
      <SearchFilters onSearch={handleSearch} initialExpanded={false} />
      
      {/* Loading state */}
      {loading.timeSeries && (
        <Box sx={{ my: 4 }}>
          <LoadingState 
            type="chart" 
            height={400} 
            message="Loading time series data..." 
            fromCache={cacheStatus.timeSeries} 
          />
        </Box>
      )}
      
      {/* Error state */}
      {!loading.timeSeries && errors.timeSeries && (
        <Alert severity="error" sx={{ my: 4 }}>
          Error loading time series data: {errors.timeSeries}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading.timeSeries && !errors.timeSeries && (!timeSeries || !timeSeries.data || timeSeries.data.length === 0) && (
        <Alert severity="info" sx={{ my: 4 }}>
          No time series data available for the current filters. Try adjusting your search criteria.
        </Alert>
      )}
      
      {/* Data visualization */}
      {!loading.timeSeries && !errors.timeSeries && timeSeries && timeSeries.data && timeSeries.data.length > 0 && (
        <>
          {/* Controls */}
          <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
            <Grid item xs={12} sm={6} md={8}>
              <ButtonGroup variant="outlined" aria-label="time unit">
                <Button 
                  onClick={() => handleTimeUnitChange('day')}
                  variant={timeUnit === 'day' ? 'contained' : 'outlined'}
                  startIcon={<CalendarTodayIcon />}
                >
                  Daily
                </Button>
                <Button 
                  onClick={() => handleTimeUnitChange('week')}
                  variant={timeUnit === 'week' ? 'contained' : 'outlined'}
                  startIcon={<CalendarViewWeekIcon />}
                >
                  Weekly
                </Button>
                <Button 
                  onClick={() => handleTimeUnitChange('month')}
                  variant={timeUnit === 'month' ? 'contained' : 'outlined'}
                  startIcon={<CalendarViewMonthIcon />}
                >
                  Monthly
                </Button>
              </ButtonGroup>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <ButtonGroup variant="outlined" aria-label="chart type">
                <Button 
                  onClick={() => handleChartTypeChange('line')}
                  variant={chartType === 'line' ? 'contained' : 'outlined'}
                  startIcon={<TimelineIcon />}
                >
                  Line
                </Button>
                <Button 
                  onClick={() => handleChartTypeChange('bar')}
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  startIcon={<BarChartIcon />}
                >
                  Bar
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
          
          {/* Chart */}
          <Paper sx={{ p: 0, mb: 4, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            <CacheIndicator 
              isFromCache={cacheStatus.timeSeries} 
              onRefresh={() => refreshData('timeSeries')} 
              position="top-right"
            />
            
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange} 
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Post Count" />
              <Tab label="Engagement" disabled={!timeSeries.data[0].engagement_score} />
              <Tab label="Advanced Metrics" disabled={!insights} />
            </Tabs>
            
            <Box sx={{ height: 500, p: 0 }}>
              {chartData && chartData.traces && (
                <Plot
                  data={chartData.traces}
                  layout={{
                    autosize: true,
                    margin: { l: 50, r: 50, t: 30, b: 50 },
                    xaxis: {
                      title: {
                        text: `Date (by ${timeUnit})`,
                      },
                      gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                    yaxis: {
                      title: {
                        text: 'Post Count',
                      },
                      gridcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                    yaxis2: {
                      title: {
                        text: 'Comment Count',
                      },
                      overlaying: 'y',
                      side: 'right',
                      showgrid: false,
                    },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: {
                      color: isDarkMode ? '#e0e0e0' : '#333333',
                    },
                    legend: {
                      orientation: 'h',
                      y: 1.1,
                    },
                    hovermode: 'closest',
                  }}
                  useResizeHandler={true}
                  style={{ width: '100%', height: '100%' }}
                  config={{ responsive: true, displayModeBar: true }}
                />
              )}
            </Box>
          </Paper>
          
          {/* Insights */}
          {insights && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CacheIndicator 
                    isFromCache={cacheStatus.timeSeries} 
                    onRefresh={() => refreshData('timeSeries')} 
                    size="small"
                    position="top-right"
                  />
                  
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overall Trend
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${insights.trendColor}20`,
                          color: insights.trendColor,
                          borderRadius: '50%',
                          p: 1,
                          mr: 2,
                        }}
                      >
                        {insights.trendIcon}
                      </Box>
                      <Typography variant="h5" component="div">
                        {insights.trendDirection.charAt(0).toUpperCase() + insights.trendDirection.slice(1)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                      {Math.abs(insights.percentChange) > 0.001 ? (
                        <>
                          Post volume has {insights.percentChange > 0 ? 'increased' : 'decreased'} by
                          {' '}<strong>{formatPercent(Math.abs(insights.percentChange))}</strong>
                          {' '}over the analyzed period of {insights.timeSpan} days.
                        </>
                      ) : (
                        <>
                          Post volume has remained stable over the analyzed period of {insights.timeSpan} days.
                        </>
                      )}
                    </Typography>
                    
                    {insights.seasonality !== 'none' && (
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          icon={<EventIcon />} 
                          label={`${insights.seasonality.charAt(0).toUpperCase() + insights.seasonality.slice(1)} seasonality detected`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CacheIndicator 
                    isFromCache={cacheStatus.timeSeries} 
                    onRefresh={() => refreshData('timeSeries')} 
                    size="small"
                    position="top-right"
                  />
                  
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Peak Activity
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Most active day:
                      </Typography>
                      <Typography variant="h5" component="div" sx={{ mt: 1 }}>
                        {formatDate(insights.maxPoint.period, 'MMMM d, yyyy')}
                      </Typography>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {formatNumber(insights.maxPoint.post_count)} posts
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        Least active day:
                      </Typography>
                      <Typography variant="h5" component="div" sx={{ mt: 1 }}>
                        {formatDate(insights.minPoint.period, 'MMMM d, yyyy')}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight="bold">
                        {formatNumber(insights.minPoint.post_count)} posts
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CacheIndicator 
                    isFromCache={cacheStatus.timeSeries} 
                    onRefresh={() => refreshData('timeSeries')} 
                    size="small"
                    position="top-right"
                  />
                  
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Summary Statistics
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Posts:
                          </Typography>
                          <Typography variant="h6" component="div">
                            {formatNumber(insights.totalPosts)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Avg. per {timeUnit}:
                          </Typography>
                          <Typography variant="h6" component="div">
                            {formatNumber(Math.round(insights.avgPosts))}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Time Span:
                          </Typography>
                          <Typography variant="h6" component="div">
                            {insights.timeSpan} days
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Data Points:
                          </Typography>
                          <Typography variant="h6" component="div">
                            {chartData.aggregated.length}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="body2" sx={{ mt: 3 }} color="text.secondary">
                        {searchParams && searchParams.keyword ? (
                          `This data shows posts containing "${searchParams.keyword}" over time.`
                        ) : searchParams && searchParams.subreddit ? (
                          `This data shows posts from r/${searchParams.subreddit} over time.`
                        ) : (
                          `This data shows all posts over time. Use filters to narrow down your analysis.`
                        )}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default TimeSeriesAnalysis;