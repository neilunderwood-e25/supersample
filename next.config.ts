import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Contentful asset CDN — all delivered images/video posters live here.
      { protocol: "https", hostname: "images.ctfassets.net" },
    ],
  },
};

export default nextConfig;
