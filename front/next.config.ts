import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// إنشاء الـ plugin بتاع next-intl
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.**',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '10.**',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
};

// تصدير الإعدادات بعد ما تمر على الـ plugin
export default withNextIntl(nextConfig);