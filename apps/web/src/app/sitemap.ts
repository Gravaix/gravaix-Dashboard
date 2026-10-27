import type { MetadataRoute } from "next";

const BASIS = process.env.WEB_URL || "https://gravaix.de";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/veredelung", "/lasergravur-service", "/katalog", "/kontakt", "/impressum", "/datenschutz"].map((pfad) => ({
    url: `${BASIS}${pfad}`,
    changeFrequency: "monthly",
    priority: pfad === "" ? 1 : 0.7,
  }));
}
