import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kein X-Powered-By-Header nach außen.
  poweredByHeader: false,
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
