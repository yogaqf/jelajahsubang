import { Navbar } from "@/components/navbar";
import { PortalHome, type PortalEntryView } from "@/components/portal-home";
import Footer from "@/components/footer";
import { getPortalEntries } from "@/lib/portal-db";
import { getProducts } from "@/lib/sharelok-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [databaseEntries, sharelokProducts] = await Promise.all([
    getPortalEntries({ publishedOnly: true }),
    getProducts(),
  ]);
  const entries: PortalEntryView[] = databaseEntries.map((entry) => ({
    id: entry.id, type: entry.type, platform: entry.platform, title: entry.title, slug: entry.slug,
    summary: entry.summary, content: entry.content, imageUrl: entry.imageUrl, externalUrl: entry.externalUrl,
    embedUrl: entry.embedUrl, location: entry.location, price: entry.price, sortOrder: entry.sortOrder,
    publishedAt: entry.publishedAt.toISOString(),
  }));
  const availableFoods = sharelokProducts.filter((product) => product.isAvailable && product.merchant?.isActive);
  const curatedFoods = availableFoods
    .filter((product) => product.showOnHomepage && product.homepagePosition)
    .sort((a, b) => (a.homepagePosition || 99) - (b.homepagePosition || 99));
  const curatedIds = new Set(curatedFoods.map((product) => product.id));
  const featuredFoods = [...curatedFoods, ...availableFoods.filter((product) => !curatedIds.has(product.id))]
    .slice(0, 3)
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      merchantName: product.merchant?.name || "Mitra Sharelok",
      merchantSlug: product.merchant?.slug || "",
      badge: product.showOnHomepage ? product.homepageBadge || "Pilihan Hari Ini" : "Pilihan Hari Ini",
      badgeColor: product.showOnHomepage ? product.homepageBadgeColor || "orange" : "orange",
    }));

  return <div className="min-h-screen w-full max-w-full overflow-x-clip"><Navbar /><PortalHome entries={entries} featuredFoods={featuredFoods} /><Footer /></div>;
}
