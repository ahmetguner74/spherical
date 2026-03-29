import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/selimin-dunyasi",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
