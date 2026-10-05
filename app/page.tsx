import { Navbar } from "@/components/navbar";
import { PortalHome, type PortalEntryView } from "@/components/portal-home";
import Footer from "@/components/footer";
import { getLatestBlogPosts } from "@/lib/blog";
import { defaultPortalEntries, getPortalEntries } from "@/lib/portal-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const databaseEntries = await getPortalEntries({ publishedOnly: true });
  const managedTypes = new Set(databaseEntries.map((entry) => entry.type));
  const sourceEntries = [
    ...databaseEntries,
    ...defaultPortalEntries.filter((entry) => !managedTypes.has(entry.type)),
  ];
  const entries: PortalEntryView[] = sourceEntries.map((entry) => ({
    id: entry.id, type: entry.type, platform: entry.platform, title: entry.title, slug: entry.slug,
    summary: entry.summary, content: entry.content, imageUrl: entry.imageUrl, externalUrl: entry.externalUrl,
    embedUrl: entry.embedUrl, location: entry.location, price: entry.price, sortOrder: entry.sortOrder,
    publishedAt: entry.publishedAt.toISOString(),
  }));

  if (!entries.some((entry) => entry.type === "BLOG")) {
    entries.push(...getLatestBlogPosts(3).map((post, index) => ({
      id: `markdown-${post.slug}`, type: "BLOG", platform: null, title: post.title, slug: post.slug,
      summary: post.excerpt, content: null, imageUrl: null, externalUrl: `/blog/${post.slug}`,
      embedUrl: null, location: null, price: 0, sortOrder: index + 1,
      publishedAt: new Date(post.date).toISOString(),
    })));
  }

  return <div className="min-h-screen"><Navbar /><PortalHome entries={entries} /><Footer /></div>;
}
