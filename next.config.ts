import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  basePath: '/popi-warning-app',
  assetPrefix: '/popi-warning-app/',
  images: {
    unoptimized: true
  },
  serverExternalPackages: ['firebase']
};

// PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  buildExcludes: [/middleware-manifest\.json$/],
});

export default withPWA(nextConfig);
