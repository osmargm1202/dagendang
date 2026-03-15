import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "diariodigital.delioserver.duckdns.org",
    "dagendang.com",
    "www.dagendang.com",
  ],
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
