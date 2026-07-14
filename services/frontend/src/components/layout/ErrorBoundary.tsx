import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Typography, Button, Paper } from '@mui/material';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 10 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>
              Oops, something went wrong.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </Typography>
            <Button variant="contained" onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
