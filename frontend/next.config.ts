import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*', // Docker internal network
      },
      {
        source: '/uploads/:path*',
        destination: 'http://backend:8000/uploads/:path*', // Proxy images
      },
    ]
  },
};

export default nextConfig;
