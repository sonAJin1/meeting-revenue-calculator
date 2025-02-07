import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ToastContainer } from 'react-toastify';
import Calculator from './components/Calculator';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="App">
          <Calculator />
          <ToastContainer position="bottom-right" />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;