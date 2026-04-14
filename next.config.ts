import type { NextConfig } from "next";

const nextConfig = {
  // 1. Force Webpack to ignore the massive 3D libraries during intensive linting
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.1.10:3000'],
  // 2. Disable the problematic experimental cache
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;