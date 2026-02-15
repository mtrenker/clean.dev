/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', 'puppeteer'],
}

module.exports = nextConfig
