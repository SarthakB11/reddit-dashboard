# Reddit Dashboard Frontend

## 🌐 Live Demo
[https://reddit-dashboard-one.vercel.app/](https://reddit-dashboard-one.vercel.app/)

## 🚀 Overview
The frontend application for the Reddit Dashboard, built with Next.js and Material-UI. Features interactive data visualizations, real-time analytics, and AI-powered insights.

## 🛠️ Tech Stack
- Next.js 14
- TypeScript
- Material-UI (MUI)
- React Query
- Plotly.js
- React Force Graph
- React Hook Form
- Axios
- Day.js

## 📦 Prerequisites
- Node.js 18+
- npm or yarn
- Git

## 🚀 Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd social-media-dashboard
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
# or
yarn install --legacy-peer-deps
```

3. Create .env.local file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

## 🏗️ Project Structure
```
social-media-dashboard/
├── src/
│   ├── app/                 # App router pages
│   │   ├── ai-chat/        # AI chat interface
│   │   ├── ai-insights/    # AI insights page
│   │   ├── dashboard/      # Main dashboard
│   │   ├── network/        # Network analysis
│   │   ├── search/         # Search functionality
│   │   ├── sentiment/      # Sentiment analysis
│   │   ├── timeseries/     # Time series analysis
│   │   └── topics/         # Topic modeling
│   ├── components/         # Shared components
│   └── config/            # Configuration files
├── public/               # Static assets
└── styles/              # Global styles
```

## 📱 Features

### Dashboard
- Overview statistics
- Quick search
- Navigation to analysis tools
- Real-time updates

### Data Analysis Tools
- Time Series Analysis
  - Post volume trends
  - Interactive charts
  - Custom date ranges

- Network Analysis
  - Interactive network graphs
  - Community detection
  - Connection strength visualization

- Sentiment Analysis
  - Sentiment distribution
  - Temporal sentiment trends
  - Subreddit sentiment comparison

- Topic Modeling
  - Topic discovery
  - Keyword visualization
  - Topic trends

### AI Features
- AI Chat Interface
  - Natural language queries
  - Context-aware responses
  - Data-driven insights

- AI Insights
  - Automated analysis
  - Pattern detection
  - Recommendations

## 🚀 Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel deploy
```

## 🧪 Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🔒 Security Features
- Environment variable protection
- API request validation
- Error boundaries
- Type safety with TypeScript

## 🎨 Styling
- Material-UI theming
- Dark/Light mode support
- Responsive design
- Custom components

## 📦 Available Scripts
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License
MIT License 