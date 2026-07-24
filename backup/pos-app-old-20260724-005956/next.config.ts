import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isCapacitorBuild ? "export" : undefined,
  images: {
    unoptimized: isCapacitorBuild,
  },
  trailingSlash: isCapacitorBuild,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
