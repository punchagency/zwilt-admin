import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useRouter } from 'next/router';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * General Error Boundary that catches runtime errors and show a friendly page
 * with a "Go Home" button instead of a white screen of death.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error);
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F8F9FA',
                        padding: 2,
                    }}
                >
                    <Paper
                        sx={{
                            p: 6,
                            maxWidth: 500,
                            textAlign: 'center',
                            border: '1.2px solid',
                            borderColor: '#0000001A',
                            borderRadius: 3,
                        }}
                    >
                        <ErrorOutlineIcon
                            sx={{ fontSize: 64, color: '#D32F2F', mb: 2 }}
                        />
                        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                            Something went wrong
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            An unexpected error occurred.
                        </Typography>
                        {this.state.error && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mb: 3,
                                    p: 2,
                                    backgroundColor: '#F8F9FA',
                                    borderRadius: 1,
                                    fontFamily: 'monospace',
                                    fontSize: '0.8125rem',
                                    textAlign: 'left',
                                    overflow: 'auto',
                                    maxHeight: 120,
                                }}
                            >
                                {this.state.error.message}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            size="large"
                            href="/"
                            sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
                        >
                            Go Home
                        </Button>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
