/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://bookbee-backend-excw.onrender.com',
  },
  // Ensure images work on Vercel
  images: {
    unoptimized: true
  },
  // Redirect from root to dashboard
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig