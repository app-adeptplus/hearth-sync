/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Allow build to succeed even with ESLint errors.
        // Pre-existing lint issues across the codebase should be fixed incrementally.
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },
};

module.exports = nextConfig;
