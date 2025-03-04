# Reddit Dashboard - Social Media Analysis Platform

## 🌐 Live Demo
- **Frontend**: [https://reddit-dashboard-one.vercel.app/](https://reddit-dashboard-one.vercel.app/)
- **Backend API**: [https://reddit-dashboard-purple-hill-3043.fly.dev/](https://reddit-dashboard-purple-hill-3043.fly.dev/)

## 🚀 Overview
A comprehensive full-stack application for analyzing Reddit data using AI-powered insights, interactive visualizations, and real-time analytics. The platform provides deep insights into social media trends, sentiment analysis, and user engagement patterns.

## Demo Video 
https://drive.google.com/file/d/1H48_XLk1vdFovn049T3iJLWT9CJ7S9CJ/view?usp=drive_link

## ✨ Features

### 🤖 AI-Powered Analytics
- Real-time sentiment analysis
- Topic modeling and trend detection
- Engagement pattern analysis
- Content quality assessment
- AI-driven recommendations

### 📊 Interactive Visualizations
- Time series analysis
- Network graphs
- Heat maps
- Word clouds
- Interactive charts

### 🎨 Modern UI/UX
- Responsive Material UI design
- Dark/Light theme support
- Real-time updates
- Interactive filters
- Cross-platform compatibility

## 🚀 Screesnhots
![Screenshot from 2025-03-05 00-48-49](https://github.com/user-attachments/assets/232c7ebf-541c-44b8-a1d1-fc019dff512b)
![Screenshot from 2025-03-05 00-49-12](https://github.com/user-attachments/assets/4e46ac48-3df0-4fe6-82bf-69bab5eb15e5)
![Screenshot from 2025-03-05 00-49-46](https://github.com/user-attachments/assets/e56ca6e5-45e7-4f47-9f3d-54fbe5458a4a)
![Screenshot from 2025-03-05 00-52-31](https://github.com/user-attachments/assets/e4b3675d-2edc-4102-a8fb-12258a7b1444)
![Screenshot from 2025-03-05 00-52-57](https://github.com/user-attachments/assets/ec7b4c7f-372e-4388-878f-b2bb5a77581b)
![Screenshot from 2025-03-05 00-53-17](https://github.com/user-attachments/assets/04d6eabf-423f-49c5-9371-4ebd819a0d40)
![Screenshot from 2025-03-05 00-53-40](https://github.com/user-attachments/assets/be6171aa-9e7a-40f5-adb7-681dfd8865eb)
![Screenshot from 2025-03-05 00-54-12](https://github.com/user-attachments/assets/1e1f3835-6670-4078-a6c0-6a3939dc6016)
![Screenshot from 2025-03-05 00-54-30](https://github.com/user-attachments/assets/8c135b98-a4dd-4fbf-a861-0727722dcf09)
![Screenshot from 2025-03-05 00-59-20](https://github.com/user-attachments/assets/c91df2e3-2b33-4db3-bb51-dbf4d76b55a3)
![Screenshot from 2025-03-05 01-01-24](https://github.com/user-attachments/assets/195175da-edaa-4b52-a209-8f794f2f4ccb)

## 🛠️ Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Material-UI (MUI)
- React Query
- Plotly.js
- React Force Graph

### Backend
- Python 3.12
- Flask
- DuckDB
- NLTK
- scikit-learn
- Google Gemini AI
- Flask-CORS

### DevOps & Deployment
- Vercel (Frontend)
- Fly.io (Backend)
- Docker
- GitHub Actions

## 🏗️ Project Structure
```
/
├── backend/                # Flask backend service
│   ├── app.py             # Main application file
│   ├── data/              # Data storage
│   └── requirements.txt   # Python dependencies
├── social-media-dashboard/ # Next.js frontend
│   ├── src/               # Source code
│   └── public/            # Static assets
├── tests/                 # Integration & unit tests
└── README.md             # Main documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker (optional)

### Frontend Setup
```bash
cd social-media-dashboard
npm install --legacy-peer-deps
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python app.py
```

### Environment Variables
Create `.env.local` for frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create `.env` for backend:
```env
GEMINI_API_KEY=your_api_key_here
```

## 📚 Documentation

### API Endpoints
- `/api/health` - Health check
- `/api/stats` - Basic statistics
- `/api/sentiment` - Sentiment analysis
- `/api/network` - Network analysis
- `/api/topics` - Topic modeling
- `/api/timeseries` - Time series data
- `/api/ai/insights` - AI-powered insights

### Features Documentation
- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./social-media-dashboard/README.md)
- [Testing Documentation](./tests/README.md)

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd social-media-dashboard
vercel deploy
```

### Backend (Fly.io)
```bash
cd backend
fly deploy
```

## 🧪 Testing
```bash
# Run frontend tests
cd social-media-dashboard
npm test

# Run backend tests
cd backend
pytest

# Run integration tests
cd tests
pytest
```

## 🔒 Security Features
- CORS configuration
- Rate limiting
- Input validation
- Error handling
- API key protection

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
This project is licensed under the MIT License.

## 👥 Authors
- Sarthak Bhardwaj

## 🙏 Acknowledgments
- Material-UI for the component library
- Flask for the backend framework
- Next.js for the frontend framework
- Vercel and Fly.io for hosting
