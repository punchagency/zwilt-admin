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
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5005/api/:path*',
            },
            {
                source: '/graphql',
                destination: 'http://localhost:5005/graphql',
            },
        ];
    },
};

module.exports = nextConfig;
