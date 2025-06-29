import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Externalize @prisma/client for Edge runtime
    if (isServer && nextRuntime === 'edge') {
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
    }
    return config;
  }
};

export default nextConfig;