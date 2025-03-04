# Reddit Dashboard Backend

## 🌐 Live API
[https://reddit-dashboard-purple-hill-3043.fly.dev/](https://reddit-dashboard-purple-hill-3043.fly.dev/)

## 🚀 Overview
The backend service for the Reddit Dashboard application, built with Flask and powered by DuckDB for efficient data processing. Features AI-powered analytics using Google's Gemini AI, sentiment analysis, and advanced topic modeling.

## 🛠️ Tech Stack
- Python 3.12
- Flask
- DuckDB
- NLTK
- scikit-learn
- Google Gemini AI
- Flask-CORS
- Plotly
- NetworkX
- TextBlob
- pandas
- numpy

## 📦 Prerequisites
- Python 3.12+
- pip
- virtualenv or venv
- Git

## 🚀 Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
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
pip install -r requirements.txt
```

4. Create .env file:
```bash
touch .env
# Add the following:
GEMINI_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
python app.py
```

The server will start at http://localhost:5000

## 🐳 Docker Setup

1. Build the image:
```bash
docker build -t reddit-dashboard-backend .
```

2. Run the container:
```bash
docker run -p 5000:5000 -e GEMINI_API_KEY=your_api_key_here reddit-dashboard-backend
```

## 🚀 Deployment (Fly.io)

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login to Fly:
```bash
fly auth login
```

3. Deploy:
```bash
fly deploy
```

## 📚 API Documentation

### Health Check
```
GET /api/health
```
Response:
```json
{
    "status": "healthy",
    "data_loaded": true
}
```

### Basic Statistics
```
GET /api/stats
```
Response:
```json
{
    "total_posts": 8799,
    "top_subreddits": [...],
    "posts_over_time": [...],
    "top_domains": [...],
    "top_authors": [...]
}
```

### Search Posts
```
GET /api/posts/search
Query params: keyword, subreddit, author, domain, start_date, end_date, limit, offset
```

### Time Series Analysis
```
GET /api/timeseries
Query params: interval (hour, day, week, month)
```

### Network Analysis
```
GET /api/network
Query params: type (subreddit, author), keyword
```

### Sentiment Analysis
```
GET /api/sentiment
Query params: keyword, subreddit, domain
```

### Topic Modeling
```
GET /api/topics
Query params: subreddit, after, before, num_topics
```

### AI Insights
```
GET /api/ai/insights
Query params: keyword, subreddit, domain
```

## 🗄️ Data Processing
- Uses DuckDB for efficient in-memory data processing
- JSONL data format for Reddit posts
- Automatic data loading and preprocessing
- Memory-efficient data handling

## 🧪 Testing
```bash
pytest
```

## 🔒 Security Features
- CORS configuration
- Rate limiting
- Input validation
- Error handling
- API key protection

## 📦 Project Structure
```
backend/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── Dockerfile         # Docker configuration
├── data/             # Data directory
│   └── data.jsonl    # Reddit data
├── chat/             # Chat module
├── tests/            # Test files
└── README.md         # Documentation
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License
MIT License 