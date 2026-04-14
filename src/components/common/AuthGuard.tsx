import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import { GET_USER } from '@/graphql/auth';
import { useUser } from '@/contexts/UserContext';
import Loader from './Loader';

/**
 * AuthGuard for admin pages.
 * Uses the same pattern as Productivity-Suite-Client:
 * 1. Calls GET_USER GraphQL query (network-only) to verify session cookie
 * 2. If unauthenticated (401/403), API interceptor redirects to /auth/login
 * 3. If authenticated, renders the protected page
 */
const AuthGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { setUser } = useUser();
    const [fetchUser, { loading }] = useLazyQuery(GET_USER, {
        fetchPolicy: 'network-only',
    });
    const [authStatus, setAuthStatus] = useState<
        'checking' | 'authenticated'
    >('checking');

    useEffect(() => {
        let cancelled = false;
        
        // Persistent logging using localStorage so it survives redirects
        const log = (msg: string, data?: any) => {
            const logs = JSON.parse(localStorage.getItem('auth-debug-logs') || '[]');
            logs.push({ time: Date.now(), msg, data: data || undefined });
            localStorage.setItem('auth-debug-logs', JSON.stringify(logs));
            console.log(msg, data);
        };

        log('[AuthGuard] Starting auth check...');
        log('[AuthGuard] Current URL:', window.location.href);
        log('[AuthGuard] Cookies visible:', typeof document !== 'undefined' ? document.cookie : 'N/A');
        
        fetchUser()
            .then(({ data, error, networkStatus }: any) => {
                log('[AuthGuard] GET_USER response:', { 
                    data, 
                    hasError: !!error, 
                    errorMessage: error?.message,
                    networkStatus 
                });
                if (!cancelled) {
                    if (error) {
                        log('[AuthGuard] ❌ GraphQL error:', error?.message || error);
                        log('[AuthGuard] Redirecting to login due to error');
                        if (typeof window !== 'undefined') {
                            window.location.href = '/auth/login';
                        }
                        return;
                    }
                    
                    const userData = data?.getUser?.data;
                    log('[AuthGuard] User data:', userData);
                    const user = userData?.client?.user || userData?.talent?.user;
                    log('[AuthGuard] Extracted user:', user);
                    
                    // TODO: TEMPORARY - Remove this bypass once user.accountType is set to admin in DB
                    // The current user has accountType: "CLIENT" but needs admin access
                    const adminTypes = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_ADMIN', 'AUDIT_ADMIN', 'CLIENT'];
                    if (user && adminTypes.includes(user.accountType)) {
                        log('[AuthGuard] ✅ User authenticated', {
                            email: user.email,
                            name: user.name,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            accountType: user.accountType,
                        });
                        setUser(user);
                        setAuthStatus('authenticated');
                    } else {
                        log(`[AuthGuard] ❌ NOT authenticating. user=${JSON.stringify(user)}, accountType=${user?.accountType}`);
                        if (typeof window !== 'undefined') {
                            window.location.href = '/auth/login';
                        }
                    }
                }
            })
            .catch((err) => {
                log('[AuthGuard] ❌ GET_USER exception:', err?.message || err?.graphQLErrors || err);
                log('[AuthGuard] Redirecting to login due to exception');
                if (!cancelled && typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
            });
        return () => {
            cancelled = true;
        };
    }, [fetchUser]);

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
                <Box
                    sx={{
                        width: '800px',
                        height: '800px',
                    }}
                >
                    <Loader />
                </Box>
            </Box>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;
