import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.68.126",
    "192.168.*.*",
    "localhost",
  ],
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
