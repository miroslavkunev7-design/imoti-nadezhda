/** @type {import('next').NextConfig} */

const nextConfig = {
  async redirects() {
    return [{ source: '/contacts', destination: '/contact', permanent: true }]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
