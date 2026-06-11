import axios from 'axios';

// In dev: Next.js proxy at /api → localhost:5000/api (same-origin, cookies work)
// In prod: use the actual server URL via env var
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send zwilt session cookie
});

// Redirect to login on 401 (unauthenticated) or 403 (forbidden/admin-only)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Unauthenticated or non-admin (no administrative systemRole). The
            // server gates every admin route on systemRole, so a 401/403 means
            // this session has no business in the admin app — send to login.
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    },
);

export default api;
