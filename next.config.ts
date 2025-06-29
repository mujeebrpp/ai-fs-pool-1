import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize @prisma/client for server-side builds
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
    } else {
      // Prevent @prisma/client from being bundled on the client-side
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['@prisma/client'] = false;
    }
    return config;
  }
};

export default nextConfig;