/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true", // Enable the analyzer only when ANALYZE env is set to true
});

const nextConfig = {
  compress: true,
  output: "standalone",
  reactStrictMode: false,
  experimental: {
    reactCompiler: true,
    // ppr: "incremental",
    serverActions: {
      bodySizeLimit: "5mb",
      allowedOrigins: ["192.168.4.12", "stickerboop.phuongchau.com", "172.16.16.29"],
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com", // Chấp nhận mọi subdomain của Vercel Blob
      },
      {
        protocol: "http",
        hostname: "172.16.16.29",
        port: "1338",
      },
      {
        protocol: "https",
        hostname: "letsenhance.io",
      },
      {
        protocol: "http",
        hostname: "media.phuongchau.com",
        port: "3838",
      },
      {
        protocol: "https",
        hostname: "sg.portal-pokemon.com",
      },
      {
        protocol: "https",
        hostname: "fonts.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "assets.pokemon.com",
      },
      {
        protocol: "https",
        hostname: "chart.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "archives.bulbagarden.net",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: "default",
    minimumCacheTTL: 60,
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
