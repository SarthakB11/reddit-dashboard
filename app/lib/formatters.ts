import { format, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param dateStr - Date string in ISO format
 * @param formatStr - Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string, formatStr = 'MMM d, yyyy'): string => {
  try {
    if (!dateStr) return '';
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr || '';
  }
};

/**
 * Format a number with commas as thousands separators
 * @param num - Number to format
 * @returns Formatted number
 */
export const formatNumber = (num: number | undefined | null): string => {
  if (num === null || num === undefined) return '';
  return new Intl.NumberFormat().format(num);
};

/**
 * Format a number as a percentage
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted percentage
 */
export const formatPercent = (num: number | undefined | null, decimals = 1): string => {
  if (num === null || num === undefined) return '';
  return `${(num * 100).toFixed(decimals)}%`;
};

/**
 * Truncate a string to a certain length
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 */
export const truncateString = (str: string, length = 50): string => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

/**
 * Format a sentiment score to a human-readable category
 * @param score - Sentiment score (-1 to 1)
 * @returns Sentiment category
 */
export const formatSentiment = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return 'Unknown';
  if (score > 0.05) return 'Positive';
  if (score < -0.05) return 'Negative';
  return 'Neutral';
};

/**
 * Get a color for a sentiment score
 * @param score - Sentiment score (-1 to 1)
 * @returns Color in hex format
 */
export const getSentimentColor = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return '#888888';
  if (score > 0.05) return '#4caf50';
  if (score < -0.05) return '#f44336';
  return '#ff9800';
};

/**
 * Extract domain from URL
 * @param url - URL to extract domain from
 * @returns Domain
 */
export const extractDomain = (url: string): string => {
  if (!url) return '';
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch (error) {
    return url;
  }
};

/**
 * Generate random color based on string
 * @param str - String to generate color from
 * @returns Color in hex format
 */
export const stringToColor = (str: string): string => {
  if (!str) return '#888888';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}; 