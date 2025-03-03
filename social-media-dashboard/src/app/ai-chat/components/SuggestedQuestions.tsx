'use client';

import React from 'react';
import { Box, Chip, Typography, useTheme } from '@mui/material';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export default function SuggestedQuestions({ 
  questions, 
  onSelectQuestion 
}: SuggestedQuestionsProps) {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 2 }}>
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ display: 'block', mb: 1 }}
      >
        Suggested questions:
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1 
      }}>
        {questions.map((question, index) => (
          <Chip
            key={index}
            label={question}
            onClick={() => onSelectQuestion(question)}
            color="primary"
            variant="outlined"
            clickable
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.08)' 
                  : 'rgba(33, 150, 243, 0.08)',
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
} 