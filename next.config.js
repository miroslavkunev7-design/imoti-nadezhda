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

function uploadUrlFromBridge() {
  const bridge = (process.env.DB_BRIDGE_URL ?? '').trim()
  if (!bridge) return ''
  return bridge.replace(/api\.php$/i, 'upload.php')
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_MEDIA_URL:
      (process.env.NEXT_PUBLIC_MEDIA_URL ?? '').trim() || mediaUrlFromBridge(),
    NEXT_PUBLIC_UPLOAD_BRIDGE_URL:
      (process.env.NEXT_PUBLIC_UPLOAD_BRIDGE_URL ?? '').trim() || uploadUrlFromBridge(),
    NEXT_PUBLIC_UPLOAD_BRIDGE_KEY:
      (process.env.NEXT_PUBLIC_UPLOAD_BRIDGE_KEY ?? process.env.DB_BRIDGE_KEY ?? '').trim(),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
