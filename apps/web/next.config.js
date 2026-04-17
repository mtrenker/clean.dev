/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg'],
  images: {
    // Serve modern formats: AVIF first, WebP as fallback
    formats: ['image/avif', 'image/webp'],
    // Device sizes used when generating responsive srcsets
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Smaller breakpoints for image sizes (icons, avatars, thumbnails)
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 256, 280, 384],
  },
}

module.exports = nextConfig
