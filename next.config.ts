import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  webpack: (config, { isServer }) => {
    // Externalize @prisma/client for all server-side builds
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
    }
    return config;
  }
};

export default nextConfig;