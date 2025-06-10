import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import QuickQuoteManager from './components/QuickQuoteManager';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QuickQuoteManager />
    </ThemeProvider>
  );
}

export default App; 