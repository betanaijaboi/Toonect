import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toonect.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/messages",
        "/settings",
        "/portfolio",
        "/projects/new",
        "/projects/*/edit",
        "/auth/callback",
        "/auth/logout",
        "/auth/verify-email",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
