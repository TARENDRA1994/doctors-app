/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        instrumentationHook: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    output: 'standalone',
}

module.exports = nextConfig