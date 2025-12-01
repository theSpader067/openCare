import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@sparticuz/chromium'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('chrome-aws-lambda');
      config.externals.push('@sparticuz/chromium');
    }
    return config;
  },
};

export default nextConfig;
