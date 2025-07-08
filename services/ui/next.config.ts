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

  // Additional Railway optimizations
  poweredByHeader: false,
  compress: true
};

export default nextConfig;
