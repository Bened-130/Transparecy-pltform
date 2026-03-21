/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost', 'ipfs.io', 'gateway.ipfs.io'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
    WS_URL: process.env.WS_URL || 'ws://localhost:3001',
  },
}

module.exports = nextConfig