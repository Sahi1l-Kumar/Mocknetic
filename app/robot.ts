import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/classroom/",
          "/_next/",
          "/profile/edit/",
          "/mock-interview/feedback/",
          "/skill-assessment/result/",
        ],
      },
    ],
    sitemap: "https://mocknetic.com/sitemap.xml",
  };
}
