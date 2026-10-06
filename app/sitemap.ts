import type { MetadataRoute } from "next";

import { getManagedBlogPosts } from "@/lib/blog";
import { getMerchants } from "@/lib/sharelok-db";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 3600;

function sitemapImageUrl(value: string | null | undefined) {
  if (!value) return undefined;

  try {
    const normalizedUrl = value.startsWith("http")
      ? new URL(value).toString()
      : absoluteUrl(value);

    // Next.js currently writes image sitemap URLs without escaping query separators.
    // Escaping ampersands keeps externally managed image URLs valid XML.
    return normalizedUrl.replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, "&amp;");
  } catch {
    return undefined;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, merchants] = await Promise.all([getManagedBlogPosts(), getMerchants()]);
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/destinasi"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/sharelok"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/sharelok/app"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/shop"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/tentang"), changeFrequency: "monthly", priority: 0.6 },
  ];
  const articlePages: MetadataRoute.Sitemap = posts.map((post) => {
    const imageUrl = sitemapImageUrl(post.imageUrl);

    return {
      url: absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.8,
      images: imageUrl ? [imageUrl] : undefined,
    };
  });
  const merchantPages: MetadataRoute.Sitemap = merchants
    .filter((merchant) => merchant.isActive && merchant.area?.isActive)
    .map((merchant) => {
      const imageUrl = sitemapImageUrl(merchant.imageUrl);

      return {
        url: absoluteUrl(`/sharelok/app/toko/${encodeURIComponent(merchant.slug)}`),
        lastModified: merchant.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
        images: imageUrl ? [imageUrl] : undefined,
      };
    });
  return [...staticPages, ...articlePages, ...merchantPages];
}
