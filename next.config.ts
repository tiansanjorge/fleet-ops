import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
