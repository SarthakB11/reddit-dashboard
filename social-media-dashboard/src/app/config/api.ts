// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
    HEALTH: `${API_BASE_URL}/api/health`,
    STATS: `${API_BASE_URL}/api/stats`,
    SEARCH: `${API_BASE_URL}/api/posts/search`,
    TIMESERIES: `${API_BASE_URL}/api/timeseries`,
    NETWORK: `${API_BASE_URL}/api/network`,
    SENTIMENT: `${API_BASE_URL}/api/sentiment`,
    TOPICS: `${API_BASE_URL}/api/topics`,
    AI_INSIGHTS: `${API_BASE_URL}/api/ai/insights`,
    CHAT: `${API_BASE_URL}/api/chat/message`
};

// Default fetch options
export const DEFAULT_FETCH_OPTIONS = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    mode: 'cors' as RequestMode,
    credentials: 'include' as RequestCredentials
};

// API Request Timeouts (in milliseconds)
export const API_TIMEOUTS = {
    HEALTH_CHECK: 3000,
    DEFAULT: 10000,
    LONG: 30000
};

// API Response Types
export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

// API Error Handler
export const handleApiError = (error: any): string => {
    if (error.response) {
        // Server responded with error
        return error.response.data?.error || 'Server error occurred';
    } else if (error.request) {
        // Request made but no response
        return 'No response from server';
    } else {
        // Request setup error
        return error.message || 'Error occurred while making request';
    }
};

// API Health Check
export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.HEALTH_CHECK);

        const response = await fetch(API_ENDPOINTS.HEALTH, {
            ...DEFAULT_FETCH_OPTIONS,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.error('API Health Check failed:', error);
        return false;
    }
}; 