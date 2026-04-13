import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/spherical",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/spherical",
  },
  output: "export",
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["jspdf"],
};

export default nextConfig;
