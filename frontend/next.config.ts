import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    localPatterns: [
      {
        pathname: "/api/media",
      },
      {
        pathname: "/ads/generated/**",
      },
      {
        pathname: "/images/**",
      },
    ],
  },
  allowedDevOrigins: [
    "diariodigital.delioserver.duckdns.org",
    "dagendang.com",
    "www.dagendang.com",
  ],
};

export default nextConfig;
