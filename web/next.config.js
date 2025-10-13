/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // appDir is now stable in Next.js 13+
  }
};

module.exports = nextConfig;
