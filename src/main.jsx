import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb'
    },
    secondary: {
      main: '#0f766e'
    },
    background: {
      default: '#f3f4f6'
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h4: {
      letterSpacing: 0
    },
    h5: {
      letterSpacing: 0
    },
    h6: {
      letterSpacing: 0
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          minHeight: 38,
          borderRadius: 8
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 800,
          color: '#374151',
          backgroundColor: '#f9fafb'
        },
        root: {
          borderColor: '#e5e7eb'
        }
      }
    },
    MuiTable: {
      styleOverrides: {
        root: {
          minWidth: 720
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: 'auto'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined'
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
