import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/_next/data/"],
    },
    sitemap: "https://mocknetic.com/sitemap.xml",
  };
}
