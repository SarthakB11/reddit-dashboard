# Social Media Analysis Dashboard

A comprehensive full-stack application for analyzing social media data using AI-powered insights, interactive visualizations, and real-time analytics.

## 🌟 Features

### AI-Powered Analytics
- Real-time sentiment analysis
- Topic modeling and trend detection
- Engagement pattern analysis
- Content quality assessment
- Automated recommendations

### Interactive Visualizations
- Time series analysis
- Network graphs
- Heat maps
- Word clouds
- Interactive charts

### Modern UI/UX
- Responsive Material UI design
- Dark/Light theme support
- Real-time updates
- Interactive filters
- Cross-platform compatibility

## 🏗️ Project Structure

```
/
├── frontend/                # Next.js frontend application
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── README.md          # Frontend documentation
├── backend/                # FastAPI backend service
│   ├── app/               # Application code
│   ├── tests/            # Backend tests
│   └── README.md         # Backend documentation
├── tests/                 # Integration tests
│   ├── e2e/              # End-to-end tests
│   ├── integration/      # Integration tests
│   └── README.md         # Testing documentation
├── docker/                # Docker configuration
│   ├── frontend/         # Frontend Dockerfile
│   └── backend/          # Backend Dockerfile
├── docker-compose.yml    # Docker Compose configuration
├── .env.example          # Environment variables template
└── README.md             # Main documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Docker and Docker Compose (optional)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/social-media-dashboard.git
cd social-media-dashboard
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start with Docker (recommended):
```bash
docker-compose up
```

Or start services individually:

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/docs

## 🔧 Configuration

### Environment Variables

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## 🧪 Testing

Run all tests:
```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
pytest

# Run integration tests
cd tests
pytest
```

## 📦 Deployment

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

Frontend:
```bash
cd frontend
npm run build
npm start
```

Backend:
```bash
cd backend
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

## 🔒 Security

- JWT authentication
- Rate limiting
- CORS configuration
- Input validation
- XSS protection
- CSRF protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- Documentation: [/docs](./docs)
- Issue Tracker: [/issues](./issues)
- Wiki: [/wiki](./wiki)

## 🙏 Acknowledgments

- Material-UI for the component library
- FastAPI for the backend framework
- Next.js for the frontend framework
- All contributors who have helped with the project