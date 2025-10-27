import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for Railway
  output: 'standalone',
  
  // External packages configuration
  serverExternalPackages: [],

  // Environment configuration
  env: {
    PORT: process.env.PORT || '3000'
  },

  // Asset optimization
  images: {
    unoptimized: true // Railway handles image optimization
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Enable tree shaking
        providedExports: true,
        // Optimize chunk splitting
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5
            }
          }
        }
      };
    }

    // Development optimizations
    if (dev) {
      // Faster development builds
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
      };
    }

    return config;
  },

  // Additional Railway optimizations
  poweredByHeader: false,
  compress: true,
  
  // Compiler optimizations
  compiler: {
    // Remove console statements in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // TypeScript build optimizations
  typescript: {
    // Ignore type errors during build (handled by separate type checking)
    ignoreBuildErrors: false
  }

  // Note: ESLint configuration removed - no longer supported in next.config.ts
  // Use next lint command directly instead
};

export default nextConfig;
