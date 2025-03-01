# Social Media Analysis Dashboard

An interactive dashboard for analyzing and visualizing social media data to uncover insights and trends in how information spreads across platforms.

![Dashboard Preview](https://ik.imagekit.io/youraccountname/dashboard-preview.png "Social Media Analysis Dashboard")

## Features

### Interactive Data Visualization
- **Time Series Analysis**: Track post volume and engagement patterns over time
- **Network Analysis**: Visualize connections between users, subreddits, and content
- **Sentiment Analysis**: Track emotional tone across conversations and topics
- **Topic Modeling**: Discover key themes and topics through advanced text analysis
- **Word Clouds**: Visualize most frequent terms and their relationships
- **AI-powered Insights**: Get automatic summaries and trend detection

### Comprehensive Search & Filtering
- Filter by date range, subreddit, author, sentiment, and keyword
- Save and share search parameters via URL
- Export results in various formats

### Modern Responsive Interface
- Clean, intuitive design that works on all devices
- Dark/light mode toggle for user preference
- Interactive charts and visualizations

## Tech Stack

### Frontend
- **Next.js**: React framework for server-side rendering and routing
- **TypeScript**: For type safety and better developer experience  
- **Material UI**: Component library for consistent UI design
- **Plotly.js**: Interactive charting library
- **D3.js**: Data visualization library
- **react-wordcloud**: Word cloud visualization
- **Axios**: HTTP client for API requests

### Data Processing (Not included in this repo)
- **Python**: Backend language for data processing
- **PRAW**: Reddit API wrapper
- **NLTK/spaCy**: Natural language processing
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning for topic modeling and sentiment analysis

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Frontend Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/social-media-analysis-dashboard.git
cd social-media-analysis-dashboard
```

2. Install dependencies:
```bash
npm install
# or with yarn
yarn install
```

3. Start development server:
```bash
npm run dev
# or with yarn
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Dashboard
The main dashboard provides an overview of the analyzed social media data, including:
- Total post count
- Distribution of posts across subreddits
- Sentiment distribution
- Recent activity trends
- Quick access to all analysis tools

### Search Results
Use the search functionality to find specific posts by:
- Keywords or phrases
- Date range
- Subreddit
- Author
- Sentiment

### Analysis Pages
- **Time Series Analysis**: Track how post volume and engagement change over time
- **Network Analysis**: Discover connection patterns between users and communities
- **Sentiment Analysis**: Understand emotional tone across conversations
- **Topic Modeling**: Identify key themes and how they relate
- **AI Summary**: Get AI-generated insights about the data

## API Documentation

### `/api/stats`
Returns overall statistics about the dataset.

### `/api/search`
Searches for posts matching the specified criteria.
- Parameters: `q` (query), `after`, `before`, `subreddit`, `author`, `sentiment`

### `/api/timeseries`
Returns time series data for post volume.
- Parameters: `after`, `before`, `subreddit`, `author`, `interval`

### `/api/network`
Returns network data showing connections between entities.
- Parameters: `type` (subreddit/author), `limit`

### `/api/sentiment`
Returns sentiment analysis data.
- Parameters: `after`, `before`, `subreddit`, `author`

### `/api/topics`
Returns topic modeling results.
- Parameters: `after`, `before`, `subreddit`, `num_topics`

### `/api/ai-summary`
Returns AI-generated insights about the dataset.
- Parameters: `after`, `before`, `subreddit`

## Project Structure

```
/app                         # Next.js app directory
  /(dashboard)               # Dashboard routes
    /dashboard               # Main dashboard
    /search                  # Search results
    /timeseries              # Time series analysis
    /network                 # Network analysis
    /sentiment               # Sentiment analysis
    /topics                  # Topic modeling
    /ai-summary              # AI-generated insights
  /components                # Reusable components
    /common                  # Common UI components
  /hooks                     # Custom React hooks
  /lib                       # Utility functions and API services
  /globals.css               # Global styles
/public                      # Static assets
```

## Lessons Learned & Implementation Notes

This project demonstrates several key concepts:

1. **Modern React Patterns**: Heavy use of hooks for state management and side effects
2. **Data Visualization Best Practices**: Interactive, responsive visualizations with appropriate chart types
3. **API Integration**: Structured approach to data fetching with caching and error handling
4. **Responsive Design**: Mobile-first approach that works on all devices
5. **Performance Optimization**: Code splitting, dynamic imports, and server-side rendering

## Future Improvements

- Add user authentication for personalized dashboards
- Implement real-time data updates
- Add more advanced ML models for deeper insights
- Create comparison tools for tracking changes over time
- Add bookmark functionality for saving interesting findings
- Implement more advanced filtering options

## Contributors

- Your Name - Main Developer

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material UI for the component library
- Plotly.js and D3.js for visualization capabilities
- The Next.js team for the excellent framework