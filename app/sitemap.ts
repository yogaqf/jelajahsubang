import type { MetadataRoute } from "next";

import { getManagedBlogPosts } from "@/lib/blog";
import { getMerchants } from "@/lib/sharelok-db";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, merchants] = await Promise.all([getManagedBlogPosts(), getMerchants()]);
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/destinasi"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/sharelok"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/sharelok/app"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/tentang"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
  const articlePages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.8,
    images: post.imageUrl ? [post.imageUrl.startsWith("http") ? post.imageUrl : absoluteUrl(post.imageUrl)] : undefined,
  }));
  const merchantPages: MetadataRoute.Sitemap = merchants
    .filter((merchant) => merchant.isActive && merchant.area?.isActive)
    .map((merchant) => ({
      url: absoluteUrl(`/sharelok/app/toko/${merchant.slug}`),
      lastModified: merchant.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
      images: merchant.imageUrl ? [merchant.imageUrl.startsWith("http") ? merchant.imageUrl : absoluteUrl(merchant.imageUrl)] : undefined,
    }));
  return [...staticPages, ...articlePages, ...merchantPages];
}
