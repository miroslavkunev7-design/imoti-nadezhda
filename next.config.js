/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    NEXT_PUBLIC_MEDIA_URL:
      (process.env.NEXT_PUBLIC_MEDIA_URL ?? '').trim() ||
      (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim() ||
      '',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
