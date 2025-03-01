import React, { createContext, useState, useContext, useCallback } from 'react';
import { 
  fetchStats, 
  fetchTimeSeries, 
  fetchNetworkData, 
  fetchSentimentAnalysis, 
  fetchTopicModeling, 
  fetchAISummary, 
  searchPosts,
  clearCache 
} from '../api/apiService';

// Create a context for data state
const DataContext = createContext();

// Custom hook to use the data context
export const useData = () => useContext(DataContext);

// Data provider component
export const DataProvider = ({ children }) => {
  // Dashboard data states
  const [stats, setStats] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [topics, setTopics] = useState(null);
  const [aiSummary, setAISummary] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    stats: false,
    timeSeries: false,
    network: false,
    sentiment: false,
    topics: false,
    aiSummary: false,
    search: false,
  });
  
  // Error states
  const [errors, setErrors] = useState({
    stats: null,
    timeSeries: null,
    network: null,
    sentiment: null,
    topics: null,
    aiSummary: null,
    search: null,
  });
  
  // Cache state for UI feedback
  const [cacheStatus, setCacheStatus] = useState({
    stats: false,
    timeSeries: false,
    network: false,
    sentiment: false,
    topics: false,
    aiSummary: false,
    search: false,
  });
  
  // Search params state
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    subreddit: '',
    domain: '',
    author: '',
    startDate: '',
    endDate: '',
  });
  
  // Function to update search params
  const updateSearchParams = useCallback((newParams) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  }, []);
  
  // Function to fetch basic statistics
  const fetchBasicStats = useCallback(async (options = {}) => {
    setLoading(prev => ({ ...prev, stats: true }));
    setErrors(prev => ({ ...prev, stats: null }));
    setCacheStatus(prev => ({ ...prev, stats: false }));
    
    try {
      const data = await fetchStats(options);
      setStats(data);
      setCacheStatus(prev => ({ ...prev, stats: options.skipCache !== true && !options.forceRefresh }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        stats: error.response?.data?.error || error.message 
      }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);
  
  // Function to fetch time series data
  const fetchTimeSeriesData = useCallback(async (params = searchParams, options = {}) => {
    setLoading(prev => ({ ...prev, timeSeries: true }));
    setErrors(prev => ({ ...prev, timeSeries: null }));
    setCacheStatus(prev => ({ ...prev, timeSeries: false }));
    
    try {
      const data = await fetchTimeSeries(params, options);
      setTimeSeries(data);
      setCacheStatus(prev => ({ ...prev, timeSeries: options.skipCache !== true && !options.forceRefresh }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        timeSeries: error.response?.data?.error || error.message 
      }));
    } finally {
      setLoading(prev => ({ ...prev, timeSeries: false }));
    }
  }, [searchParams]);
  
  // Function to fetch network graph data
  const fetchNetworkGraphData = useCallback(async (params = searchParams, type = 'subreddit', options = {}) => {
    setLoading(prev => ({ ...prev, network: true }));
    setErrors(prev => ({ ...prev, network: null }));
    setCacheStatus(prev => ({ ...prev, network: false }));
    
    try {
      const data = await fetchNetworkData({ ...params, type }, options);
      setNetworkData(data);
      setCacheStatus(prev => ({ ...prev, network: options.skipCache !== true && !options.forceRefresh }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        network: error.response?.data?.error || error.message 
      }));
    } finally {
      setLoading(prev => ({ ...prev, network: false }));
    }
  }, [searchParams]);
  
  // Function to fetch sentiment analysis data
  const fetchSentimentData = useCallback(async (params = searchParams, options = {}) => {
    setLoading(prev => ({ ...prev, sentiment: true }));
    setErrors(prev => ({ ...prev, sentiment: null }));
    setCacheStatus(prev => ({ ...prev, sentiment: false }));
    
    try {
      const data = await fetchSentimentAnalysis(params, options);
      setSentiment(data);
      setCacheStatus(prev => ({ ...prev, sentiment: options.skipCache !== true && !options.forceRefresh }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        sentiment: error.response?.data?.error || error.message 
      }));
    } finally {
      setLoading(prev => ({ ...prev, sentiment: false }));
    }
  }, [searchParams]);
  
  // Function to fetch topic modeling data
  const fetchTopicData = useCallback(async (params = searchParams, numTopics = 5, options = {}) => {
    setLoading(prev => ({ ...prev, topics: true }));
    setErrors(prev => ({ ...prev, topics: null }));
    setCacheStatus(prev => ({ ...prev, topics: false }));
    
    try {
      const data = await fetchTopicModeling({ ...params, num_topics: numTopics }, options);
      setTopics(data);
      setCacheStatus(prev => ({ ...prev, topics: options.skipCache !== true && !options.forceRefresh }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        topics: error.response?.data?.error || error.message 
      }));
    } finally {
      setLoading(prev => ({ ...prev, topics: false }));
    }
  }, [searchParams]);
  
  // Function to fetch AI summary data
  const fetchAISummaryData = useCallback(async (params = searchParams, type = 'insights', promptText = '', options = {}) => {
    setLoading(prev => ({ ...prev, aiSummary: true }));
    setErrors(prev => ({ ...prev, aiSummary: null }));
    setCacheStatus(prev => ({ ...prev, aiSummary: false }));
    
    try {
      const apiParams = { ...params, type };
      if (type === 'custom' && promptText) {
        apiParams.prompt = promptText;
      }
      
      const data = await fetchAISummary(apiParams, options);
      setAISummary(data);
      setCacheStatus(prev => ({ ...prev, aiSummary: options.skipCache !== true && !options.forceRefresh }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        aiSummary: error.response?.data?.error || error.message 
      }));
    } finally {
      setLoading(prev => ({ ...prev, aiSummary: false }));
    }
  }, [searchParams]);
  
  // Function to search posts
  const fetchSearchResults = useCallback(async (params = searchParams, page = 0, limit = 10, options = {}) => {
    setLoading(prev => ({ ...prev, search: true }));
    setErrors(prev => ({ ...prev, search: null }));
    setCacheStatus(prev => ({ ...prev, search: false }));
    
    try {
      const data = await searchPosts({ 
        ...params, 
        offset: page * limit, 
        limit 
      }, options);
      setSearchResults(data);
      setCacheStatus(prev => ({ ...prev, search: options.skipCache !== true && !options.forceRefresh }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        search: error.response?.data?.error || error.message 
      }));
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  }, [searchParams]);
  
  // Function to clear all data and cache
  const clearAllData = useCallback(() => {
    // Clear local state
    setStats(null);
    setTimeSeries(null);
    setNetworkData(null);
    setSentiment(null);
    setTopics(null);
    setAISummary(null);
    setSearchResults(null);
    
    // Clear errors
    setErrors({
      stats: null,
      timeSeries: null,
      network: null,
      sentiment: null,
      topics: null,
      aiSummary: null,
      search: null,
    });
    
    // Clear cache status
    setCacheStatus({
      stats: false,
      timeSeries: false,
      network: false,
      sentiment: false,
      topics: false,
      aiSummary: false,
      search: false,
    });
    
    // Clear API cache
    clearCache();
  }, []);
  
  // Function to refresh a specific data type with fresh data
  const refreshData = useCallback((dataType) => {
    const options = { forceRefresh: true };
    
    switch (dataType) {
      case 'stats':
        fetchBasicStats(options);
        break;
      case 'timeSeries':
        fetchTimeSeriesData(searchParams, options);
        break;
      case 'network':
        fetchNetworkGraphData(searchParams, 'subreddit', options);
        break;
      case 'sentiment':
        fetchSentimentData(searchParams, options);
        break;
      case 'topics':
        fetchTopicData(searchParams, 5, options);
        break;
      case 'aiSummary':
        fetchAISummaryData(searchParams, 'insights', '', options);
        break;
      case 'search':
        fetchSearchResults(searchParams, 0, 10, options);
        break;
      default:
        // Refresh all data
        fetchBasicStats(options);
        fetchTimeSeriesData(searchParams, options);
        fetchNetworkGraphData(searchParams, 'subreddit', options);
        fetchSentimentData(searchParams, options);
        fetchTopicData(searchParams, 5, options);
        fetchAISummaryData(searchParams, 'insights', '', options);
        fetchSearchResults(searchParams, 0, 10, options);
    }
  }, [
    fetchBasicStats, 
    fetchTimeSeriesData, 
    fetchNetworkGraphData, 
    fetchSentimentData, 
    fetchTopicData, 
    fetchAISummaryData, 
    fetchSearchResults, 
    searchParams
  ]);
  
  // Provided value
  const value = {
    // Data states
    stats,
    timeSeries,
    networkData,
    sentiment,
    topics,
    aiSummary,
    searchResults,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Cache status
    cacheStatus,
    
    // Search params
    searchParams,
    updateSearchParams,
    
    // Data fetching functions
    fetchBasicStats,
    fetchTimeSeriesData,
    fetchNetworkGraphData,
    fetchSentimentData,
    fetchTopicData,
    fetchAISummaryData,
    fetchSearchResults,
    
    // Cache and data management
    clearAllData,
    refreshData,
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};