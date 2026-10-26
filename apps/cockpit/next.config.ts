import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kein X-Powered-By-Header nach außen.
  poweredByHeader: false,
  // Mail-Bibliotheken nicht bündeln, sondern direkt aus node_modules laden.
  serverExternalPackages: ["imapflow", "mailparser"],
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
