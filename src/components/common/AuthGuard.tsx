import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useUser } from '@/contexts/UserContext';
import Loader from './Loader';
import api from '@/services/api';

const ADMIN_ACCOUNT_TYPES = [
    'SUPER_ADMIN', 'STAFF_ADMIN',
    // Legacy types
    'ADMIN', 'SUPPORT_ADMIN', 'AUDIT_ADMIN',
    // Temporary: allow all until accountTypes are properly set in DB
    'CLIENT_OWNER', 'MEMBER', 'CLIENT',
];

const AuthGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { setUser } = useUser();
    const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'error'>('checking');
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        let cancelled = false;

        api.get('/api/admin/me')
            .then(({ data }) => {
                if (cancelled) return;

                const user = data?.data;
                // Authorized if they have a systemRole OR a legacy admin accountType
                const isAuthorized =
                    data?.success &&
                    user &&
                    (user.systemRole || ADMIN_ACCOUNT_TYPES.includes(user.accountType));

                if (isAuthorized) {
                    setUser(user);
                    setAuthStatus('authenticated');
                } else {
                    console.warn('[AuthGuard] Not authorized:', user);
                    window.location.href = '/auth/login';
                }
            })
            .catch((err) => {
                if (cancelled) return;
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    // Definitively not authenticated — redirect to login
                    window.location.href = '/auth/login';
                } else {
                    // Server error or network issue — show error, don't redirect
                    console.error('[AuthGuard] /api/admin/me error:', err?.message);
                    setAuthError(err?.message || 'Could not reach server');
                    setAuthStatus('error');
                }
            });

        return () => { cancelled = true; };
    }, []);

    if (authStatus === 'error') {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                <Box sx={{ color: 'text.secondary', fontSize: '1rem' }}>
                    Could not connect to the server. Please try again.
                </Box>
                <Box
                    component="button"
                    onClick={() => window.location.reload()}
                    sx={{
                        mt: 1,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                    }}
                >
                    Retry
                </Box>
            </Box>
        );
    }

    if (authStatus !== 'authenticated') {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box sx={{ width: '800px', height: '800px' }}>
                    <Loader />
                </Box>
            </Box>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;
