import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
// ... other imports ...

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

// ... rest of App.js