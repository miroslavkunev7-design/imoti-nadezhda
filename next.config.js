/** @type {import('next').NextConfig} */

function mediaUrlFromBridge() {
  const bridge = (process.env.DB_BRIDGE_URL ?? '').trim()
  if (!bridge) return ''
  try {
    return new URL(bridge).origin
  } catch {
    return ''
  }
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_MEDIA_URL:
      (process.env.NEXT_PUBLIC_MEDIA_URL ?? '').trim() || mediaUrlFromBridge(),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
