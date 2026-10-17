import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
