# Backend Documentation

## 🎯 Overview

The backend of the Social Media Analysis Dashboard is built with FastAPI, providing a high-performance, async API with automatic OpenAPI documentation. It handles data processing, AI analysis, and real-time updates through WebSocket connections.

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/                 # API endpoints
│   │   ├── v1/             # API version 1
│   │   │   ├── ai.py      # AI analysis endpoints
│   │   │   ├── auth.py    # Authentication
│   │   │   ├── data.py    # Data endpoints
│   │   │   └── ws.py      # WebSocket handlers
│   ├── core/               # Core functionality
│   │   ├── config.py      # Configuration
│   │   ├── security.py    # Security utilities
│   │   └── events.py      # Event handlers
│   ├── db/                 # Database
│   │   ├── models.py      # SQLAlchemy models
│   │   └── session.py     # Database session
│   ├── ml/                # Machine learning
│   │   ├── sentiment.py   # Sentiment analysis
│   │   ├── topics.py      # Topic modeling
│   │   └── trends.py      # Trend detection
│   ├── schemas/           # Pydantic models
│   ├── services/         # Business logic
│   └── main.py          # Application entry
├── tests/              # Test suite
│   ├── api/           # API tests
│   ├── ml/           # ML tests
│   └── conftest.py   # Test configuration
├── alembic/          # Database migrations
├── requirements/     # Dependencies
│   ├── base.txt     # Base requirements
│   ├── dev.txt      # Development
│   └── prod.txt     # Production
├── scripts/         # Utility scripts
├── Dockerfile      # Docker configuration
└── README.md      # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL 13+
- Redis 6+
- Virtual environment tool

### Installation

1. Clone and navigate to backend:
```bash
git clone https://github.com/yourusername/social-media-dashboard.git
cd social-media-dashboard/backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements/dev.txt
```

4. Copy environment variables:
```bash
cp .env.example .env
```

5. Initialize database:
```bash
alembic upgrade head
```

6. Start development server:
```bash
uvicorn app.main:app --reload
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ASYNC_DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Settings
API_V1_PREFIX=/api/v1
PROJECT_NAME=Social Media Dashboard
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# ML Models
MODEL_PATH=/path/to/models
ENABLE_GPU=false

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=your-sentry-dsn
```

## 📚 API Documentation

### Authentication
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`

### Data Endpoints
- GET `/api/v1/data/stats`
- GET `/api/v1/data/search`
- GET `/api/v1/data/timeseries`
- GET `/api/v1/data/network`

### AI Analysis
- POST `/api/v1/ai/sentiment`
- POST `/api/v1/ai/topics`
- POST `/api/v1/ai/trends`
- POST `/api/v1/ai/insights`

### WebSocket
- WS `/api/v1/ws/updates`

## 🧪 Testing

### Run Tests
```bash
# All tests
pytest

# Specific test file
pytest tests/api/test_auth.py

# With coverage
pytest --cov=app
```

### Test Configuration
```python
# conftest.py
@pytest.fixture
def test_app():
    # Test app configuration
```

## 📦 Dependencies

### Core
- fastapi
- uvicorn
- sqlalchemy
- alembic
- pydantic
- python-jose
- passlib
- python-multipart

### Machine Learning
- numpy
- pandas
- scikit-learn
- torch
- transformers
- spacy

### Development
- pytest
- black
- flake8
- mypy
- pytest-cov

## 🔒 Security

### Authentication
- JWT tokens
- Password hashing
- Role-based access
- Session management

### API Security
- Rate limiting
- Input validation
- CORS configuration
- Security headers

### Data Protection
- Data encryption
- Secure connections
- Audit logging
- Error handling

## 🎯 Features

### Data Processing
- Batch processing
- Stream processing
- Data validation
- Data transformation

### Machine Learning
- Sentiment analysis
- Topic modeling
- Trend detection
- Text classification

### Real-time Updates
- WebSocket connections
- Event broadcasting
- Live metrics
- Status updates

## 📈 Performance

### Optimization
- Async operations
- Connection pooling
- Query optimization
- Caching strategy

### Monitoring
- Performance metrics
- Error tracking
- Resource usage
- API analytics

### Scaling
- Horizontal scaling
- Load balancing
- Database sharding
- Cache distribution

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t social-media-backend .

# Run container
docker run -p 5000:5000 social-media-backend
```

### Production Setup
```bash
# Install production dependencies
pip install -r requirements/prod.txt

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 📝 Code Style

### Formatting
```bash
# Format code
black app tests

# Check types
mypy app

# Lint code
flake8 app tests
```

### Style Guide
- PEP 8 compliance
- Type annotations
- Docstring format
- Import ordering

## 🔄 Database

### Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Models
```python
# Example model
class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    content = Column(Text)
```

## 📊 Monitoring

### Logging
```python
# Example logging
logger.info("Processing request", extra={"request_id": request_id})
```

### Metrics
- Request counts
- Response times
- Error rates
- Resource usage

### Alerts
- Error thresholds
- Performance alerts
- System health
- Custom triggers

## 🤝 Contributing

1. Follow Python style guide
2. Add tests for new features
3. Update documentation
4. Create pull request

## 📖 Documentation

- API documentation
- Code documentation
- Deployment guide
- Contributing guide

## 🐛 Debugging

- Logging setup
- Debug toolbar
- Error tracking
- Performance profiling

## 🔧 Scripts

```bash
# Development
./scripts/dev-setup.sh

# Database
./scripts/db-setup.sh

# Testing
./scripts/run-tests.sh

# Deployment
./scripts/deploy.sh
``` 