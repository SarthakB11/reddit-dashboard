import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, Snackbar, Alert } from '@mui/material';
import { useData } from './context/DataContext';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Page components
import Dashboard from './pages/Dashboard';
import TimeSeriesAnalysis from './pages/TimeSeriesAnalysis';
import NetworkAnalysis from './pages/NetworkAnalysis';
import SentimentAnalysis from './pages/SentimentAnalysis';
import TopicModeling from './pages/TopicModeling';
import AISummary from './pages/AISummary';
import SearchResults from './pages/SearchResults';
import About from './pages/About';

// Loading components
import AppLoader from './components/common/AppLoader';

// Styles
import './App.css';

const App = () => {
  const { fetchBasicStats, errors } = useData();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Simulate initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Show loading screen for at least 2.5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch basic stats when the app loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchBasicStats();
      } catch (error) {
        setNotification({
          open: true,
          message: 'Failed to load initial data. Some features might not work correctly.',
          severity: 'error'
        });
      }
    };
    
    fetchData();
  }, [fetchBasicStats]);
  
  // Watch for global errors
  useEffect(() => {
    // Check if any errors exist
    const hasErrors = Object.values(errors).some(error => error);
    
    if (hasErrors) {
      setNotification({
        open: true,
        message: 'An error occurred while fetching data. Please try again later.',
        severity: 'error'
      });
    }
  }, [errors]);
  
  // Handle closing the notification
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      {/* Initial App Loading Screen */}
      <AppLoader loading={loading} message="Initializing dashboard..." />
      
      {/* Main App */}
      <Box sx={{ display: 'flex', minHeight: '100vh', visibility: loading ? 'hidden' : 'visible' }}>
        <CssBaseline />
        <Header />
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: '240px' },
            mt: '64px',
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timeseries" element={<TimeSeriesAnalysis />} />
            <Route path="/network" element={<NetworkAnalysis />} />
            <Route path="/sentiment" element={<SentimentAnalysis />} />
            <Route path="/topics" element={<TopicModeling />} />
            <Route path="/ai-summary" element={<AISummary />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
      
      {/* Global notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default App;