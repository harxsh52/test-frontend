import { Alert, Box, Button, Typography } from '@mui/material';
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f3f4f6', px: 2 }}>
        <Alert
          severity="error"
          sx={{
            maxWidth: 560,
            width: '100%',
            alignItems: 'center'
          }}
          action={
            <Button color="inherit" size="small" onClick={this.handleReset}>
              Reload
            </Button>
          }
        >
          <Typography sx={{ fontWeight: 700 }}>Something went wrong.</Typography>
          <Typography variant="body2">The page could not be rendered. Reload and try again.</Typography>
        </Alert>
      </Box>
    );
  }
}

export default ErrorBoundary;
