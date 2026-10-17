import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Dev only: lets a phone on the local network load the dev server's JS (otherwise taps do nothing).
  allowedDevOrigins: ["192.168.*.*"],
  // The reverse proxy may rewrite Host; allow Server Actions (incl. login) from the public domain.
  experimental: {
    serverActions: { allowedOrigins: ["eccomi.hsdscp.duckdns.org"] },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
