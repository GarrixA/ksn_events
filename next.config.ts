import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler: true, // Temporarily disabled
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
