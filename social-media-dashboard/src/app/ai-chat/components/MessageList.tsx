'use client';

import React from 'react';
import { Box, Typography, Avatar, Paper, useTheme } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

// Message type definition
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const theme = useTheme();
  
  return (
    <>
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            mb: 2,
            alignItems: 'flex-start',
          }}
        >
          <Avatar
            sx={{
              bgcolor: message.role === 'assistant' ? 'primary.main' : 'secondary.main',
              mr: 2,
            }}
          >
            {message.role === 'assistant' ? <SmartToyIcon /> : <PersonIcon />}
          </Avatar>
          
          <Paper
            elevation={1}
            sx={{
              p: 2,
              maxWidth: '80%',
              borderRadius: 2,
              bgcolor: message.role === 'assistant' 
                ? theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'
                : theme.palette.primary.main,
              color: message.role === 'assistant' 
                ? 'text.primary' 
                : '#fff',
            }}
          >
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            
            <Typography 
              variant="caption" 
              color={message.role === 'assistant' ? 'text.secondary' : 'rgba(255,255,255,0.7)'}
              sx={{ display: 'block', mt: 1, textAlign: 'right' }}
            >
              {formatTime(message.timestamp)}
            </Typography>
          </Paper>
        </Box>
      ))}
    </>
  );
}

// Helper function to format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
} 