import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.mzstatic.com",   // wszystkie subdomeny Apple Music
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",         // Spotify (jeśli masz stare dane)
      },
    ],
  },
};

export default nextConfig;