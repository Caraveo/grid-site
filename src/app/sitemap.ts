import type { MetadataRoute } from "next";
import { canonicalUrl, SEO_PAGES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return SEO_PAGES.filter((page) => !page.noIndex).map((page) => ({
    url: canonicalUrl(page.path),
    lastModified: now,
    changeFrequency:
      page.path === "/" || page.path === "/news" || page.path === "/explorer"
        ? "daily"
        : "weekly",
    priority: page.path === "/" ? 1 : page.path.startsWith("/docs") ? 0.8 : 0.7,
    images: [`https://grid-compute.com${page.path === "/" ? "/downloads/og/home.png" : `/downloads/og/${page.path.slice(1).replaceAll("/", "-")}.png`}`],
  }));
}
