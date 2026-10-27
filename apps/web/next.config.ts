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
  // Alte Adressen der Onepage-Seite weiterleiten, damit Links und Google-Treffer funktionieren.
  async redirects() {
    return [{ source: "/rechtsdokument", destination: "/impressum", permanent: true }];
  },
};

export default nextConfig;
