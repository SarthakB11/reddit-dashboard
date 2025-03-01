'use client';

import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type for search parameters
export interface SearchParams {
  keyword?: string;
  subreddit?: string;
  domain?: string;
  author?: string;
  startDate?: string;
  endDate?: string;
  offset?: number;
  limit?: number;
}

// Type for API options
export interface ApiOptions {
  skipCache?: boolean;
  forceRefresh?: boolean;
  cacheExpiration?: number;
}

// Cache storage
interface CacheItem {
  data: any;
  timestamp: number;
  expiration: number;
}

class ApiCache {
  private cache: Record<string, CacheItem> = {};
  private defaultExpiration = 5 * 60 * 1000; // 5 minutes
  
  // Set cache item
  set(key: string, data: any, expiration?: number): void {
    const expirationTime = expiration || this.defaultExpiration;
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiration: expirationTime,
    };
    
    // Auto cleanup after expiration
    setTimeout(() => {
      this.delete(key);
    }, expirationTime);
  }
  
  // Get cache item
  get(key: string): any | null {
    const item = this.cache[key];
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.timestamp + item.expiration) {
      this.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  // Check if key exists in cache
  has(key: string): boolean {
    return !!this.get(key);
  }
  
  // Delete cache item
  delete(key: string): void {
    delete this.cache[key];
  }
  
  // Clear all cache
  clear(): void {
    this.cache = {};
  }
}

const apiCache = new ApiCache();

// Generate cache key from endpoint and parameters
const generateCacheKey = (endpoint: string, params?: Record<string, any>): string => {
  const sortedParams = params 
    ? JSON.stringify(Object.entries(params).sort((a, b) => a[0].localeCompare(b[0])))
    : '';
  return `${endpoint}:${sortedParams}`;
};

/**
 * Fetch data with caching
 */
const fetchWithCache = async <T>(
  endpoint: string, 
  params: Record<string, any> = {}, 
  options: ApiOptions = {}
): Promise<T> => {
  const { skipCache = false, forceRefresh = false, cacheExpiration } = options;
  const cacheKey = generateCacheKey(endpoint, params);
  
  // Return cached data if available and not skipping cache or forcing refresh
  if (!skipCache && !forceRefresh && apiCache.has(cacheKey)) {
    console.log(`[Cache] Using cached data for ${endpoint}`);
    return apiCache.get(cacheKey);
  }
  
  try {
    console.log(`[API] Fetching data for ${endpoint}`);
    const response = await api.get<T>(endpoint, { params });
    
    // Cache the response if not skipping cache
    if (!skipCache) {
      apiCache.set(cacheKey, response.data, cacheExpiration);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// API service functions

/**
 * Fetch basic statistics about the dataset
 */
export const fetchStats = async (options: ApiOptions = {}) => {
  return fetchWithCache('/stats', {}, options);
};

/**
 * Fetch time series data based on provided parameters
 */
export const fetchTimeSeries = async (params: SearchParams = {}, options: ApiOptions = {}) => {
  return fetchWithCache('/timeseries', params, options);
};

/**
 * Fetch network graph data
 */
export const fetchNetworkData = async (
  params: SearchParams & { type?: 'subreddit' | 'author' } = {}, 
  options: ApiOptions = {}
) => {
  return fetchWithCache('/network', params, options);
};

/**
 * Fetch sentiment analysis data
 */
export const fetchSentimentAnalysis = async (params: SearchParams = {}, options: ApiOptions = {}) => {
  return fetchWithCache('/sentiment', params, options);
};

/**
 * Fetch topic modeling results
 */
export const fetchTopicModeling = async (
  params: SearchParams & { num_topics?: number } = {}, 
  options: ApiOptions = {}
) => {
  return fetchWithCache('/topics', params, options);
};

/**
 * Fetch AI-generated summary of data
 */
export const fetchAISummary = async (
  params: SearchParams & { type?: string, prompt?: string } = {}, 
  options: ApiOptions = {}
) => {
  return fetchWithCache('/ai/summary', params, options);
};

/**
 * Search posts with provided parameters
 */
export const searchPosts = async (params: SearchParams = {}, options: ApiOptions = {}) => {
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
  apiCache.clear();
};

export default api; 