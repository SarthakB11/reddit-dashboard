# Social Media Dashboard Tests

This directory contains test scripts and utilities for testing the Social Media Dashboard application.

## Directory Structure

- `tests/` - Main testing directory
  - `api/` - Tests for the API endpoints
    - `test_backend.py` - Tests all backend API endpoints
  - `timeseries/` - Tests for the timeseries functionality
    - `test_timeseries.py` - Tests the timeseries API endpoint with daily data
    - `test_hourly.py` - Tests the timeseries API endpoint with hourly data
    - `open_timeseries.py` - Opens the timeseries page in a browser for manual testing
    - `open_hourly_timeseries.py` - Opens the timeseries page with hourly view in a browser

## Running Tests

### API Tests

To test all backend API endpoints:

```bash
# From the project root
python -m tests.api.test_backend
```

To test the timeseries API endpoint specifically:

```bash
# From the project root
python -m tests.timeseries.test_timeseries
python -m tests.timeseries.test_hourly
```

### Browser Tests

To open the timeseries page in a browser for manual testing:

```bash
# From the project root
python -m tests.timeseries.open_timeseries
python -m tests.timeseries.open_hourly_timeseries
```

## Notes

- Ensure that both the backend Flask server and frontend Next.js server are running before running the tests.
- The backend should be running on `http://localhost:5000`
- The frontend should be running on `http://localhost:3000` 