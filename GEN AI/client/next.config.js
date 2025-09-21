/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    unoptimized: true // Required for static export
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
  // Enable static export for GitHub Pages
  output: 'export',
  trailingSlash: true,
  // Configure for GitHub Pages subdirectory
  basePath: process.env.NODE_ENV === 'production' ? '/GenAI' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/GenAI' : '',
}

module.exports = nextConfig
