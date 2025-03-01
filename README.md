# SocialMediaViz - Social Media Analysis Dashboard

A sophisticated interactive dashboard for analyzing and visualizing social media data, with a focus on how information spreads from potentially unreliable sources.

![Dashboard Screenshot](dashboard-screenshot.png)

## 🌟 Features

- **Interactive Visualizations:** Engaging, intuitive data visualizations including time series, network graphs, and sentiment analysis.
- **AI-Powered Analysis:** Machine learning models for topic modeling, sentiment analysis, and automated summaries.
- **Multi-dimensional Analysis:** Analyze data across various dimensions including time, communities, and content.
- **Responsive Design:** Beautiful, modern UI that works across all device sizes.
- **Advanced Filtering:** Powerful search and filtering capabilities to find exactly what you're looking for.

## 🚀 Demo

Check out the live demo:
- [Hosted Demo](https://socialmediaviz.example.com)
- [Video Demo](https://youtube.com/watch?v=demo)

## 📊 Visualization Types

### Time Series Analysis
- Track post volume over time
- Identify trends and spikes in activity
- Compare engagement metrics across different time periods

### Network Analysis
- Visualize connections between subreddits based on shared users
- Analyze author networks to identify influential posters
- Discover community clusters and information flow patterns

### Sentiment Analysis
- Track sentiment over time
- Compare sentiment across different subreddits or topics
- Identify emotional trends in social media discourse

### Topic Modeling
- Automatically identify key topics in the dataset
- Visualize topic prevalence over time
- Explore related terms and concepts within topics

### AI Summary
- Get AI-generated summaries of search results
- Highlight key findings and observations
- Receive intelligent insights about the data

## 🛠️ Technology Stack

### Frontend:
- React 18
- Material UI
- D3.js, Plotly, and Three.js for visualizations
- React Router for navigation
- Context API for state management

### Backend:
- Python Flask API
- DuckDB for high-performance queries
- scikit-learn for machine learning models
- TextBlob for sentiment analysis
- NetworkX for graph analysis

### ML/AI Features:
- Topic modeling with Latent Dirichlet Allocation
- Sentiment analysis using TextBlob
- Network analysis with community detection
- AI-powered summaries

## 🔧 Installation and Setup

### Prerequisites:
- Node.js (v14+)
- Python (v3.8+)
- pip

### Backend Setup:
```bash
# Create and activate virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
cd backend
python app.py
```

### Frontend Setup:
```bash
# Install dependencies
cd frontend
npm install

# Run the development server
npm start
```

The application will be available at http://localhost:3000.

## 📝 Usage Guide

1. **Dashboard:** Start with the main dashboard to get an overview of the data.
2. **Search & Filter:** Use the search box to find specific posts or topics.
3. **Time Series:** Analyze how topics or keywords trend over time.
4. **Network Analysis:** Explore the connections between users or communities.
5. **Sentiment Analysis:** Understand the emotional tone of conversations.
6. **Topic Modeling:** Discover the main themes and topics in the data.
7. **AI Summary:** Get an AI-powered summary of your search results.

## 🧩 Project Structure

```
socialmediaviz/
├── backend/                 # Flask API server
│   ├── app.py               # Main application entry point
│   ├── data_processor.py    # Data processing utilities
│   └── wsgi.py              # WSGI entry point for production
├── data/                    # Data files
│   └── data.jsonl           # Reddit data in JSONL format
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── api/             # API service functions
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React context for state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   └── utils/           # Utility functions
│   └── package.json         # Frontend dependencies
└── requirements.txt         # Backend dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or feedback, please reach out to [your email].

---

Developed for SimPPL Research - Understanding how information spreads on social media platforms.