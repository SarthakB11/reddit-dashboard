import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache storage
const cache = {
  data: {},
  timeouts: {},
  
  // Cache expiration in milliseconds (default: 5 minutes)
  defaultExpiration: 5 * 60 * 1000,
  
  // Cache a response
  set: function(key, data, expiration) {
    this.data[key] = data;
    
    // Clear any existing timeout
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
    }
    
    // Set expiration timeout
    const timeout = expiration || this.defaultExpiration;
    this.timeouts[key] = setTimeout(() => {
      this.delete(key);
    }, timeout);
  },
  
  // Get cached response
  get: function(key) {
    return this.data[key];
  },
  
  // Check if cache exists
  has: function(key) {
    return !!this.data[key];
  },
  
  // Delete cached response
  delete: function(key) {
    delete this.data[key];
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
      delete this.timeouts[key];
    }
  },
  
  // Clear all cache
  clear: function() {
    Object.keys(this.timeouts).forEach(key => {
      clearTimeout(this.timeouts[key]);
    });
    this.data = {};
    this.timeouts = {};
  }
};

// Generate a cache key from the request
const generateCacheKey = (endpoint, params) => {
  const sortedParams = params ? JSON.stringify(
    Object.entries(params).sort((a, b) => a[0].localeCompare(b[0]))
  ) : '';
  return `${endpoint}:${sortedParams}`;
};

/**
 * Fetch data with caching
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @param {Object} options - Request options including caching configuration
 */
const fetchWithCache = async (endpoint, params = {}, options = {}) => {
  const { 
    skipCache = false, 
    cacheExpiration = null,
    forceRefresh = false 
  } = options;
  
  const cacheKey = generateCacheKey(endpoint, params);
  
  // Return cached data if available and not skipping cache or forcing refresh
  if (!skipCache && !forceRefresh && cache.has(cacheKey)) {
    console.log(`[Cache] Using cached data for ${endpoint}`);
    return cache.get(cacheKey);
  }
  
  try {
    console.log(`[API] Fetching data for ${endpoint}`);
    const response = await api.get(endpoint, { params });
    
    // Cache the response if not skipping cache
    if (!skipCache) {
      cache.set(cacheKey, response.data, cacheExpiration);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch basic statistics about the dataset
 * @param {Object} options - Request options
 */
export const fetchStats = async (options = {}) => {
  return fetchWithCache('/stats', {}, options);
};

/**
 * Fetch time series data based on provided parameters
 * @param {Object} params - Query parameters
 * @param {Object} options - Request options
 */
export const fetchTimeSeries = async (params = {}, options = {}) => {
  return fetchWithCache('/timeseries', params, options);
};

/**
 * Fetch network graph data
 * @param {Object} params - Query parameters including type (subreddit or author)
 * @param {Object} options - Request options
 */
export const fetchNetworkData = async (params = {}, options = {}) => {
  return fetchWithCache('/network', params, options);
};

/**
 * Fetch sentiment analysis data
 * @param {Object} params - Query parameters
 * @param {Object} options - Request options
 */
export const fetchSentimentAnalysis = async (params = {}, options = {}) => {
  return fetchWithCache('/sentiment', params, options);
};

/**
 * Fetch topic modeling results
 * @param {Object} params - Query parameters including num_topics
 * @param {Object} options - Request options
 */
export const fetchTopicModeling = async (params = {}, options = {}) => {
  return fetchWithCache('/topics', params, options);
};

/**
 * Fetch AI-generated summary of data
 * @param {Object} params - Query parameters
 * @param {Object} options - Request options
 */
export const fetchAISummary = async (params = {}, options = {}) => {
  return fetchWithCache('/ai/summary', params, options);
};

/**
 * Search posts with provided parameters
 * @param {Object} params - Query parameters including offset and limit for pagination
 * @param {Object} options - Request options
 */
export const searchPosts = async (params = {}, options = {}) => {
  // Search results typically shouldn't be cached for too long
  const searchOptions = { 
    ...options,
    cacheExpiration: 2 * 60 * 1000 // 2 minutes
  };
  return fetchWithCache('/posts/search', params, searchOptions);
};

/**
 * Clear all cached data
 */
export const clearCache = () => {
  cache.clear();
};

export default api;