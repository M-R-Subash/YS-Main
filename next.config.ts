import type { NextConfig } from "next";

const adminOrigin = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

const allowedAncestors = Array.from(
  new Set([
    "'self'",
    adminOrigin,
    adminOrigin.includes("localhost")
      ? adminOrigin.replace("localhost", "127.0.0.1")
      : null,
  ])
)
  .filter(Boolean)
  .join(" ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${allowedAncestors};`,
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ysinnovations.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
