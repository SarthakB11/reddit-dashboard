# Frontend Documentation

## 🎯 Overview

The frontend of the Reddit Analysis Dashboard is built with Next.js 13+, utilizing the App Router, Server Components, and Material UI for a modern, responsive user interface.

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── ai-insights/      # AI Insights feature
│   │   ├── dashboard/        # Dashboard feature
│   │   ├── network/          # Network analysis
│   │   ├── sentiment/        # Sentiment analysis
│   │   └── topics/          # Topic modeling
│   ├── components/           # Reusable components
│   │   ├── common/          # Common UI components
│   │   ├── charts/          # Chart components
│   │   ├── layout/          # Layout components
│   │   └── ThemeRegistry/   # Theme configuration
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── services/            # API services
│   ├── styles/              # Global styles
│   └── types/              # TypeScript types
├── public/                 # Static assets
├── tests/                 # Frontend tests
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/             # End-to-end tests
├── .env.example         # Environment variables template
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository and navigate to frontend:
```bash
git clone https://github.com/yourusername/social-media-dashboard.git
cd social-media-dashboard/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true

# Third Party Services
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
```

## 📚 Key Features

### 1. Theme System
- Dark/Light mode support
- Custom Material UI theme
- CSS-in-JS with emotion
- Global styles and typography

### 2. Data Visualization
- Interactive charts with Plotly.js
- Network graphs with D3.js
- Real-time updates
- Responsive layouts

### 3. State Management
- React Context for global state
- Custom hooks for local state
- SWR for data fetching
- WebSocket integration

### 4. Performance
- Server-side rendering
- Dynamic imports
- Image optimization
- Bundle optimization

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## 📦 Building for Production

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## 🔍 Code Quality

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Format Code
```bash
npm run format
```

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

## 🔒 Security

- CSRF protection
- XSS prevention
- Content Security Policy
- Secure HTTP headers
- Input sanitization

## 🎯 Best Practices

### Performance
- Code splitting
- Tree shaking
- Lazy loading
- Memoization
- Debouncing/Throttling

### Accessibility
- ARIA labels
- Keyboard navigation
- Color contrast
- Screen reader support
- Focus management

### SEO
- Meta tags
- Semantic HTML
- Structured data
- Sitemap
- robots.txt

## 📚 Component Library

### Common Components
- Button
- Card
- Dialog
- TextField
- Select
- Table
- Tabs
- Alert

### Chart Components
- LineChart
- BarChart
- PieChart
- NetworkGraph
- HeatMap
- WordCloud

### Layout Components
- Sidebar
- Header
- Footer
- Grid
- Container

## 🔄 State Management

### Global State
- Theme preferences
- User settings
- Authentication
- Notifications

### API Integration
- REST endpoints
- WebSocket connections
- Error handling
- Loading states
- Cache management

## 📈 Analytics

- Page views
- User interactions
- Error tracking
- Performance monitoring
- Custom events

## 🌐 Internationalization

- Multiple language support
- RTL layout support
- Date/time formatting
- Number formatting
- Currency handling

## 📱 PWA Support

- Service worker
- Offline functionality
- Push notifications
- App manifest
- Install prompts

## 🤝 Contributing

1. Follow the code style guide
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation
5. Create pull requests

## 📖 Documentation

- Component documentation
- API documentation
- State management
- Testing guide
- Deployment guide

## 🐛 Debugging

- Chrome DevTools
- React DevTools
- Network monitoring
- Performance profiling
- Error boundaries

## 📦 Dependencies

### Core
- next: ^13.0.0
- react: ^18.0.0
- @mui/material: ^5.0.0
- typescript: ^5.0.0

### Data Visualization
- plotly.js
- d3.js
- react-wordcloud

### Development
- jest
- @testing-library/react
- cypress
- eslint
- prettier

## 🔧 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "e2e": "cypress run",
  "format": "prettier --write ."
}
``` 