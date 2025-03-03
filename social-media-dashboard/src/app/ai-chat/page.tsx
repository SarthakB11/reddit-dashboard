'use client';

import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import ChatInterface from './components/ChatInterface';

export default function AIChatPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Chat Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Chat with our AI assistant to analyze Reddit data and discover insights. Ask questions about trends, 
          engagement patterns, sentiment analysis, or specific subreddits.
        </Typography>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 0, 
          height: 'calc(100vh - 250px)', 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        <ChatInterface />
      </Paper>
    </Container>
  );
} 