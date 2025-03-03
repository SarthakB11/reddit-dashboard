# Testing Documentation

## 🎯 Overview

This directory contains all test suites for the Social Media Analysis Dashboard, including unit tests, integration tests, and end-to-end tests for both frontend and backend components.

## 🏗️ Project Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── cypress/           # Cypress tests
│   └── playwright/       # Playwright tests
├── frontend/             # Frontend tests
│   ├── unit/            # Unit tests
│   │   ├── components/  # Component tests
│   │   ├── hooks/      # Hook tests
│   │   └── utils/     # Utility tests
│   └── integration/   # Integration tests
├── backend/           # Backend tests
│   ├── unit/         # Unit tests
│   │   ├── api/     # API tests
│   │   ├── ml/     # ML tests
│   │   └── utils/  # Utility tests
│   └── integration/ # Integration tests
├── fixtures/        # Test fixtures
├── mocks/          # Mock data
└── utils/          # Test utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (Frontend tests)
- Python 3.8+ (Backend tests)
- Chrome/Firefox (E2E tests)
- Docker (Optional)

### Installation

1. Install frontend test dependencies:
```bash
cd frontend
npm install
```

2. Install backend test dependencies:
```bash
cd backend
pip install -r requirements/test.txt
```

3. Install E2E test dependencies:
```bash
npm install -g cypress playwright
```

## 🧪 Running Tests

### Frontend Tests

```bash
# Run all frontend tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test src/components/Button.test.tsx

# Watch mode
npm run test:watch
```

### Backend Tests

```bash
# Run all backend tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/api/test_auth.py

# Run marked tests
pytest -m "slow"
```

### E2E Tests

```bash
# Run Cypress tests
npm run cypress:run

# Run Playwright tests
npm run playwright:test

# Open Cypress UI
npm run cypress:open
```

## 📚 Testing Frameworks

### Frontend
- Jest
- React Testing Library
- MSW (Mock Service Worker)
- jest-dom
- Testing Library User Event

### Backend
- pytest
- pytest-asyncio
- pytest-cov
- pytest-mock
- factory_boy

### E2E
- Cypress
- Playwright
- Selenium (legacy)

## 🎯 Testing Strategies

### Unit Testing
- Component testing
- Hook testing
- Utility function testing
- API endpoint testing
- Service testing

### Integration Testing
- Component integration
- API integration
- Database integration
- Service integration

### E2E Testing
- User flows
- Critical paths
- Cross-browser testing
- Mobile responsiveness

## 🔧 Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Pytest Configuration
```python
# pytest.ini
[pytest]
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
testpaths = tests
python_files = test_*.py
```

### Cypress Configuration
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
  },
};
```

## 📝 Writing Tests

### Frontend Example
```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Backend Example
```python
# test_auth.py
import pytest
from fastapi.testclient import TestClient

def test_login(client: TestClient):
    response = client.post("/api/v1/auth/login", json={
        "username": "test",
        "password": "test123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

### E2E Example
```javascript
// login.spec.js
describe('Login Flow', () => {
  it('successfully logs in', () => {
    cy.visit('/login');
    cy.get('[data-testid=username]').type('testuser');
    cy.get('[data-testid=password]').type('password123');
    cy.get('[data-testid=submit]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## 🔍 Test Coverage

### Coverage Goals
- Frontend: 80% coverage
- Backend: 90% coverage
- E2E: Critical path coverage

### Coverage Report
```bash
# Frontend coverage
npm run test:coverage

# Backend coverage
pytest --cov=app --cov-report=html
```

## 🛠️ Testing Tools

### Mocking
- Jest Mock Functions
- Mock Service Worker
- pytest-mock
- factory_boy

### Assertions
- jest-dom
- pytest assertions
- Cypress assertions
- Custom matchers

### Utilities
- Test data generators
- Fixture factories
- Helper functions
- Custom commands

## 📊 Test Reporting

### HTML Reports
```bash
# Generate HTML coverage report
pytest --cov=app --cov-report=html

# View Jest coverage
npm run test:coverage -- --coverageReporter=html
```

### CI Integration
- GitHub Actions
- Jenkins
- CircleCI
- GitLab CI

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm install
          npm test
```

## 🐛 Debugging Tests

### Frontend
- Jest Debug Mode
- Chrome DevTools
- React DevTools
- console.log

### Backend
- pytest-pdb
- logging
- debugpy
- print statements

### E2E
- Cypress Debug
- Playwright Debug
- Screenshots
- Video recording

## 📈 Performance Testing

### Load Testing
- k6
- Apache JMeter
- Locust

### Benchmark Testing
```bash
# Run benchmark tests
pytest --benchmark-only
```

## 🔒 Security Testing

### Tools
- OWASP ZAP
- Safety
- Bandit
- npm audit

### Checks
- Dependency scanning
- Static analysis
- Vulnerability testing
- Penetration testing

## 📖 Best Practices

1. Follow AAA pattern (Arrange, Act, Assert)
2. Use meaningful test descriptions
3. Keep tests independent
4. Mock external dependencies
5. Use appropriate assertions
6. Maintain test data
7. Regular test maintenance
8. Document test cases

## 🤝 Contributing

1. Write tests for new features
2. Maintain existing tests
3. Update test documentation
4. Follow style guide
5. Create pull requests 