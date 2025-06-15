import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental features for performance (safe for Vercel)
  experimental: {
    optimizeServerReact: true,
    webpackBuildWorker: true,
    typedRoutes: false, // Skip type checking for staging
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300',
          },
        ],
      },
      {
        source: '/dashboard-v2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Exclude problematic external design-ai imports
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // Block all external design-ai imports
        '../website-generator-design-ai': false,
        '../../website-generator-design-ai': false,
        '../../../website-generator-design-ai': false,
      },
    };

    // Exclude specific problematic directories
    config.externals = config.externals || [];
    config.externals.push(/^\.\.\/website-generator-design-ai/);
    config.externals.push(/design-ai/);

    if (!dev && !isServer) {
      // Production client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
