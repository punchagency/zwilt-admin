import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';

const NotFoundPage: React.FC = () => {
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
                <SearchIcon sx={{ fontSize: 64, color: '#607D8B', mb: 2 }} />
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: '7rem',
                        fontWeight: 900,
                        lineHeight: 1,
                        color: '#50589F',
                        mb: 1,
                    }}
                >
                    404
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    Page not found
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </Typography>
                <Link href="/" passHref>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<HomeIcon />}
                        component="a"
                        sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
                    >
                        Back to Home
                    </Button>
                </Link>
            </Paper>
        </Box>
    );
};

(NotFoundPage as any).requireAuth = false;
(NotFoundPage as any).getLayout = (page: React.ReactElement) => page;

export default NotFoundPage;
