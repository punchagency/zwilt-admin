/** @type {import('next').NextConfig} */
const nextConfig = {
    modularizeImports: {
        '@mui/icons-material': {
            transform: '@mui/icons-material/{{member}}',
        },
    },
    images: {
        domains: [
            'zwilt.s3.amazonaws.com',
            'zwilt-store.s3.amazonaws.com',
            'punch-zwilt.s3.amazonaws.com',
            'ui-avatars.com',
            'avatar.iran.liara.run',
        ],
    },
    reactStrictMode: true,
    generateBuildId: async () => {
        return Date.now().toString();
    },
    async rewrites() {
        // Proxy target: the zwilt-server API. Driven by NEXT_PUBLIC_API_URL so
        // prod (set in Vercel: https://api.zwilt.com) proxies correctly; falls
        // back to the local dev server when the var is unset.
        const apiBase =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';
        return [
            {
                source: '/api/:path*',
                destination: `${apiBase}/api/:path*`,
            },
            {
                source: '/graphql',
                destination: `${apiBase}/graphql`,
            },
        ];
    },
};

module.exports = nextConfig;
