import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@fleetops/types"],
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
