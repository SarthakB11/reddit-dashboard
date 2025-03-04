# Reddit Dashboard Tests

## 🚀 Overview
This directory contains the test suite for the Reddit Dashboard application, covering both frontend and backend components. The tests are organized into unit tests, integration tests, and end-to-end tests.

## 🏗️ Test Structure
```
tests/
├── api/                # Backend API tests
│   ├── test_health.py
│   ├── test_stats.py
│   ├── test_search.py
│   └── test_ai.py
├── timeseries/        # Time series analysis tests
│   ├── test_data.py
│   └── test_analysis.py
├── chat/             # Chat module tests
│   ├── test_routes.py
│   └── test_handlers.py
└── conftest.py      # Test configuration
```

## 🛠️ Tech Stack
- pytest
- pytest-cov
- pytest-asyncio
- requests
- httpx
- pytest-mock
- pytest-env

## 📦 Prerequisites
- Python 3.12+
- Node.js 18+
- pip
- npm or yarn

## 🚀 Running Tests

### Backend Tests
```bash
# Navigate to backend directory
cd backend

# Install test dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/api/test_health.py

# Run tests with verbose output
pytest -v
```

### Frontend Tests
```bash
# Navigate to frontend directory
cd social-media-dashboard

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/app/dashboard/__tests__/page.test.tsx
```

## 📝 Writing Tests

### Backend Test Example
```python
def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### Frontend Test Example
```typescript
describe('Dashboard Page', () => {
  it('renders dashboard components', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });
});
```

## 🧪 Test Categories

### Unit Tests
- Individual component testing
- Function testing
- Isolated behavior verification

### Integration Tests
- API endpoint testing
- Database interactions
- Component interactions

### End-to-End Tests
- User flow testing
- Full application testing
- Cross-component functionality

## 📊 Test Coverage
- Backend coverage target: 80%
- Frontend coverage target: 70%
- Critical paths: 90%

## 🔍 Testing Strategy

### Backend Testing
1. API endpoint validation
2. Data processing verification
3. Error handling
4. Authentication/Authorization
5. Performance testing

### Frontend Testing
1. Component rendering
2. User interactions
3. State management
4. API integration
5. UI/UX functionality

## 🚨 Continuous Integration
- Automated testing on push
- Coverage reports
- Performance benchmarks
- Integration testing

## 🐛 Debugging Tests
```bash
# Backend tests with debug output
pytest -vv --pdb

# Frontend tests with debug output
npm test -- --debug
```

## 🔒 Test Environment
- Isolated test database
- Mocked external services
- Controlled test data
- Environment variables

## 📈 Performance Testing
```bash
# Run performance tests
pytest tests/performance/

# Generate performance report
pytest --benchmark-only
```

## 🤝 Contributing
1. Write tests for new features
2. Maintain test coverage
3. Follow testing conventions
4. Update test documentation

## 📚 Resources
- [pytest Documentation](https://docs.pytest.org/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://docs.pytest.org/en/stable/goodpractices.html)

## 📝 License
MIT License 