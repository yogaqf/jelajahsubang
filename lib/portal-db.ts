import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, store } from "@/db";
import { portalEntries, type NewPortalEntry, type PortalEntry } from "@/db/schema";

export const PORTAL_TYPES = ["HERO", "BLOG", "DESTINATION", "SHOP", "SOCIAL"] as const;
export type PortalContentType = (typeof PORTAL_TYPES)[number];

const now = new Date();
const defaultPortalEntriesWithoutViews: Omit<PortalEntry, "viewCount">[] = [
  {
    id: "portal-hero-1", type: "HERO", platform: null, title: "Subang, cerita indah di setiap perjalanan", slug: "hero-jelajah-subang", summary: "Temukan wisata alam, cerita lokal, kuliner, dan produk pilihan Subang dalam satu portal.", content: null, imageUrl: "/images/hero.jpg", externalUrl: "/destinasi", ctaLabel: null, embedUrl: null, location: "Kabupaten Subang", price: 0, isPublished: true, sortOrder: 1, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-hero-2", type: "HERO", platform: null, title: "Dari pegunungan hingga pesisir", slug: "hero-alam-subang", summary: "Susun perjalananmu dan kenali sisi Subang yang belum pernah kamu lihat.", content: null, imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85", externalUrl: "/destinasi", ctaLabel: null, embedUrl: null, location: "Jelajah Subang", price: 0, isPublished: true, sortOrder: 2, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-destination-1", type: "DESTINATION", platform: null, title: "Pemandian Air Panas Ciater", slug: "pemandian-air-panas-ciater", summary: "Relaksasi di kawasan sejuk kaki Gunung Tangkuban Parahu.", content: null, imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80", externalUrl: null, ctaLabel: null, embedUrl: null, location: "Ciater", price: 0, isPublished: true, sortOrder: 1, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-destination-2", type: "DESTINATION", platform: null, title: "Kebun Teh Subang", slug: "kebun-teh-subang", summary: "Hamparan hijau dan udara pegunungan untuk perjalanan singkat yang menyegarkan.", content: null, imageUrl: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1000&q=80", externalUrl: null, ctaLabel: null, embedUrl: null, location: "Ciater", price: 0, isPublished: true, sortOrder: 2, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-destination-3", type: "DESTINATION", platform: null, title: "Curug Cijalu", slug: "curug-cijalu", summary: "Air terjun di tengah rimbunnya alam untuk kamu yang ingin beristirahat dari keramaian.", content: null, imageUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80", externalUrl: null, ctaLabel: null, embedUrl: null, location: "Cijambe", price: 0, isPublished: true, sortOrder: 3, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-shop-1", type: "SHOP", platform: null, title: "Merchandise Jelajah Subang", slug: "merchandise-jelajah-subang", summary: "Bawa pulang cerita Subang melalui koleksi merchandise pilihan.", content: null, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80", externalUrl: "/shop", ctaLabel: null, embedUrl: null, location: null, price: 150000, isPublished: true, sortOrder: 1, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-shop-2", type: "SHOP", platform: null, title: "Tote Bag Jelajah", slug: "tote-bag-jelajah", summary: "Tas kanvas simpel untuk teman perjalanan dan aktivitas harian.", content: null, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80", externalUrl: "/shop", ctaLabel: null, embedUrl: null, location: null, price: 100000, isPublished: true, sortOrder: 2, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-shop-3", type: "SHOP", platform: null, title: "Mug Cerita Subang", slug: "mug-cerita-subang", summary: "Mug koleksi dengan ilustrasi lanskap dan ikon khas Subang.", content: null, imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=80", externalUrl: "/shop", ctaLabel: null, embedUrl: null, location: null, price: 80000, isPublished: true, sortOrder: 3, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-shop-4", type: "SHOP", platform: null, title: "Paket Oleh-oleh Lokal", slug: "paket-oleh-oleh-lokal", summary: "Kurasi produk UMKM lokal untuk buah tangan keluarga di rumah.", content: null, imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=1000&q=80", externalUrl: "/shop", ctaLabel: null, embedUrl: null, location: null, price: 125000, isPublished: true, sortOrder: 4, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-social-instagram", type: "SOCIAL", platform: "INSTAGRAM", title: "Cerita terbaru dari Instagram", slug: "instagram-jelajah-subang", summary: "Ikuti perjalanan terbaru Jelajah Subang.", content: null, imageUrl: null, externalUrl: "https://www.instagram.com/jelajahsubang/", ctaLabel: null, embedUrl: "https://www.instagram.com/jelajahsubang/embed", location: null, price: 0, isPublished: true, sortOrder: 1, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-social-tiktok", type: "SOCIAL", platform: "TIKTOK", title: "Subang dalam video singkat", slug: "tiktok-jelajah-subang", summary: "Lihat rekomendasi tempat dan pengalaman lokal.", content: null, imageUrl: null, externalUrl: "https://www.tiktok.com/@jelajahsubang", ctaLabel: null, embedUrl: "https://www.tiktok.com/player/v1/", location: null, price: 0, isPublished: true, sortOrder: 2, publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: "portal-social-youtube", type: "SOCIAL", platform: "YOUTUBE", title: "Eksplorasi lengkap di YouTube", slug: "youtube-jelajah-subang", summary: "Nikmati cerita perjalanan Subang dengan durasi lebih panjang.", content: null, imageUrl: null, externalUrl: "https://www.youtube.com/@jelajahsubang", ctaLabel: null, embedUrl: "https://www.youtube.com/embed?listType=user_uploads&list=jelajahsubang", location: null, price: 0, isPublished: true, sortOrder: 3, publishedAt: now, createdAt: now, updatedAt: now,
  },
];

export const defaultPortalEntries: PortalEntry[] = defaultPortalEntriesWithoutViews.map((entry) => ({ ...entry, viewCount: 0 }));

function fallbackEntries() {
  return store.portalEntries.length ? store.portalEntries : defaultPortalEntries;
}

export async function getPortalEntries(options: { type?: string; publishedOnly?: boolean } = {}) {
  const { type, publishedOnly = false } = options;
  if (db) {
    try {
      const filters = [type ? eq(portalEntries.type, type) : undefined, publishedOnly ? eq(portalEntries.isPublished, true) : undefined].filter(Boolean);
      return await db.select().from(portalEntries).where(filters.length ? and(...filters) : undefined).orderBy(asc(portalEntries.sortOrder), desc(portalEntries.publishedAt));
    } catch (error) {
      console.warn("Portal CMS database belum siap, memakai konten bawaan:", error);
    }
  }
  return fallbackEntries().filter((entry) => (!type || entry.type === type) && (!publishedOnly || entry.isPublished)).sort((a, b) => a.sortOrder - b.sortOrder || b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getPortalEntryBySlug(slug: string) {
  if (db) {
    try {
      const [entry] = await db.select().from(portalEntries).where(eq(portalEntries.slug, slug)).limit(1);
      return entry || null;
    } catch (error) {
      console.warn("Gagal membaca konten portal:", error);
    }
  }
  return fallbackEntries().find((entry) => entry.slug === slug) || null;
}

export async function createPortalEntry(input: NewPortalEntry) {
  if (db) {
    const [created] = await db.insert(portalEntries).values(input).returning();
    return created;
  }
  const created: PortalEntry = { id: crypto.randomUUID(), platform: null, summary: null, content: null, imageUrl: null, externalUrl: null, ctaLabel: null, embedUrl: null, location: null, price: 0, viewCount: 0, isPublished: true, sortOrder: 0, publishedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), ...input };
  store.portalEntries.push(created);
  return created;
}

export async function updatePortalEntry(id: string, input: Partial<NewPortalEntry>) {
  if (db) {
    const [updated] = await db.update(portalEntries).set({ ...input, updatedAt: new Date() }).where(eq(portalEntries.id, id)).returning();
    return updated || null;
  }
  const index = store.portalEntries.findIndex((entry) => entry.id === id);
  if (index < 0) return null;
  store.portalEntries[index] = { ...store.portalEntries[index], ...input, updatedAt: new Date() };
  return store.portalEntries[index];
}

export async function deletePortalEntry(id: string) {
  if (db) {
    const [deleted] = await db.delete(portalEntries).where(eq(portalEntries.id, id)).returning();
    return deleted || null;
  }
  const index = store.portalEntries.findIndex((entry) => entry.id === id);
  if (index < 0) return null;
  return store.portalEntries.splice(index, 1)[0];
}

export async function incrementPortalArticleView(slug: string) {
  if (db) {
    const [updated] = await db
      .update(portalEntries)
      .set({ viewCount: sql`${portalEntries.viewCount} + 1` })
      .where(and(eq(portalEntries.slug, slug), eq(portalEntries.type, "BLOG"), eq(portalEntries.isPublished, true)))
      .returning({ viewCount: portalEntries.viewCount });
    return updated?.viewCount ?? null;
  }

  const entry = fallbackEntries().find((item) => item.slug === slug && item.type === "BLOG" && item.isPublished);
  if (!entry) return null;
  entry.viewCount += 1;
  return entry.viewCount;
}
