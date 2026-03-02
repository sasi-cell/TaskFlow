import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { DatabaseProvider } from './database/provider';
import { AuthProvider } from './auth/AuthContext';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <DatabaseProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </DatabaseProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
