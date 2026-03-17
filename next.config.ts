import type { NextConfig } from "next";

const nextConfig = {
  // 1. Force Webpack to ignore the massive 3D libraries during intensive linting
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  
  // 2. Disable the problematic experimental cache
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;