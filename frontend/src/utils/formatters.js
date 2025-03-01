import { format, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param {string} dateStr - Date string in ISO format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, formatStr = 'MMM d, yyyy') => {
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
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '';
  return new Intl.NumberFormat().format(num);
};

/**
 * Format a number as a percentage
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercent = (num, decimals = 1) => {
  if (num === null || num === undefined) return '';
  return `${(num * 100).toFixed(decimals)}%`;
};

/**
 * Truncate a string to a certain length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

/**
 * Format a sentiment score to a human-readable category
 * @param {number} score - Sentiment score (-1 to 1)
 * @returns {string} Sentiment category
 */
export const formatSentiment = (score) => {
  if (score === null || score === undefined) return 'Unknown';
  if (score > 0.05) return 'Positive';
  if (score < -0.05) return 'Negative';
  return 'Neutral';
};

/**
 * Get a color for a sentiment score
 * @param {number} score - Sentiment score (-1 to 1)
 * @returns {string} Color in hex format
 */
export const getSentimentColor = (score) => {
  if (score === null || score === undefined) return '#888888';
  if (score > 0.05) return '#4caf50';
  if (score < -0.05) return '#f44336';
  return '#ff9800';
};

/**
 * Format time series data for Plotly
 * @param {Array} data - Time series data
 * @param {string} xKey - Key for x values
 * @param {string} yKey - Key for y values
 * @returns {Object} Formatted data for Plotly
 */
export const formatTimeSeriesForPlotly = (data, xKey = 'period', yKey = 'post_count') => {
  if (!data || !Array.isArray(data)) return { x: [], y: [] };
  
  return {
    x: data.map(item => item[xKey]),
    y: data.map(item => item[yKey]),
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: '#1976d2' },
  };
};

/**
 * Format network data for force graph
 * @param {Object} data - Network data
 * @returns {Object} Formatted data for force graph
 */
export const formatNetworkForForceGraph = (data) => {
  if (!data || !data.nodes || !data.links) {
    return { nodes: [], links: [] };
  }
  
  // Format nodes
  const nodes = data.nodes.map(node => ({
    id: node.id,
    name: node.name,
    val: Math.sqrt(node.value) + 1, // Size based on sqrt of value
    color: node.community !== undefined 
      ? `hsl(${(node.community * 137) % 360}, 70%, 60%)` // Color based on community
      : '#1976d2',
  }));
  
  // Format links
  const links = data.links.map(link => ({
    source: link.source,
    target: link.target,
    value: link.value,
  }));
  
  return { nodes, links };
};

/**
 * Format topic data for visualization
 * @param {Array} topics - Topic data
 * @returns {Array} Formatted topics for visualization
 */
export const formatTopicsForVisualization = (topics) => {
  if (!topics || !Array.isArray(topics)) return [];
  
  return topics.map((topic, index) => ({
    id: topic.id,
    label: `Topic ${topic.id + 1}`,
    words: topic.words.join(', '),
    topWords: topic.words.slice(0, 5).join(', '),
    prevalence: topic.prevalence,
    color: `hsl(${(index * 137) % 360}, 70%, 60%)`,
  }));
};

/**
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain
 */
export const extractDomain = (url) => {
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
 * @param {string} str - String to generate color from
 * @returns {string} Color in hex format
 */
export const stringToColor = (str) => {
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