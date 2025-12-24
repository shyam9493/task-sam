import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack (default in Next.js 16)
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
      encoding: "./empty-module.js",
    },
  },
};

export default nextConfig;
