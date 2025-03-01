# Social Media Analysis Dashboard

An interactive dashboard for analyzing and visualizing social media data to uncover insights and trends in how information spreads across platforms.

## Features

### Interactive Data Visualization
- **Time Series Analysis**: Track post volume and engagement patterns over time
- **Network Analysis**: Visualize connections between users, subreddits, and content
- **Sentiment Analysis**: Track emotional tone across conversations and topics
- **Topic Modeling**: Discover key themes and topics through advanced text analysis
- **AI-powered Insights**: Get automatic summaries and trend detection

### Modern UI with Theme Support
- **Dark/Light Mode Toggle**: Switch between dark and light themes with a single click
- **Persistent Preferences**: Your theme preference is saved in localStorage
- **System Preference Detection**: Automatically detects and applies your system's theme preference
- **Smooth Transitions**: Enjoy smooth animations when switching between themes
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Comprehensive Search & Filtering
- Filter by date range, subreddit, author, sentiment, and keyword
- Save and share search parameters via URL

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Usage

1. Navigate to the dashboard to see an overview of key metrics
2. Use the sidebar to navigate between different analysis tools
3. Toggle between dark and light mode using the theme button in the sidebar
4. Explore data through the interactive visualizations and filters
5. Search for specific content using the search functionality

## Technology Stack

- **Next.js**: React framework for server-side rendering and routing
- **TypeScript**: Type safety and improved developer experience
- **Material UI**: Component library for consistent UI design
- **React**: UI library for building user interfaces
- **LocalStorage**: For user preference persistence

## Project Structure

```
/src
  /app                  # Next.js App Router
    /components         # Reusable components
      /ThemeRegistry.tsx # Theme context and provider
      /ThemeToggle.tsx  # Dark/light mode toggle
    /dashboard          # Dashboard page
    /network            # Network analysis page
    /sentiment          # Sentiment analysis page
    /timeseries         # Time series analysis page
    /topics             # Topic modeling page
    layout.tsx          # Root layout with sidebar
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com/material-ui/getting-started/overview/)

## Deployment

The dashboard can be deployed on Vercel or any other platform that supports Next.js applications.
