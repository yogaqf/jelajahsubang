import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { portalEntries, type NewPortalEntry } from "./schema";
import { defaultPortalEntries } from "../lib/portal-db";

async function seedPortal() {
  if (!db) throw new Error("DATABASE_URL belum dikonfigurasi");

  const defaults: NewPortalEntry[] = defaultPortalEntries
    .filter((entry) => entry.type !== "SOCIAL")
    .map((entry) => Object.fromEntries(Object.entries(entry).filter(([key]) => key !== "id")) as NewPortalEntry);

  const blogDir = path.join(process.cwd(), "content", "blog");
  const blogs: NewPortalEntry[] = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter((file) => file.endsWith(".mdx")).map((file, index) => {
        const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
        const { data, content } = matter(raw);
        const slug = String(data.slug || file.replace(/\.mdx$/, ""));
        const publishedAt = data.date ? new Date(String(data.date)) : new Date();
        return {
          type: "BLOG",
          platform: null,
          title: String(data.title || slug),
          slug,
          summary: String(data.excerpt || ""),
          content,
          imageUrl: data.image ? String(data.image) : null,
          externalUrl: `/blog/${slug}`,
          embedUrl: null,
          location: null,
          price: 0,
          isPublished: Boolean(data.published ?? true),
          sortOrder: index + 1,
          publishedAt,
        };
      })
    : [];

  const rows = [...defaults, ...blogs];
  if (rows.length) await db.insert(portalEntries).values(rows).onConflictDoNothing({ target: portalEntries.slug });

  const tiktokEntries = await db.select().from(portalEntries).where(and(eq(portalEntries.type, "SOCIAL"), eq(portalEntries.platform, "TIKTOK")));
  let normalized = 0;
  for (const entry of tiktokEntries) {
    if (!entry.embedUrl || entry.embedUrl.includes("/player/v1/")) continue;
    let candidate = entry.embedUrl;
    if (candidate.includes("vt.tiktok.com") || candidate.includes("vm.tiktok.com")) {
      const response = await fetch(candidate, { method: "HEAD", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
      candidate = response.url || candidate;
    }
    const videoId = candidate.match(/\/video\/(\d+)/)?.[1];
    if (!videoId) continue;
    await db.update(portalEntries).set({ embedUrl: `https://www.tiktok.com/player/v1/${videoId}`, externalUrl: entry.externalUrl || candidate, updatedAt: new Date() }).where(eq(portalEntries.id, entry.id));
    normalized += 1;
  }

  console.log(`Portal CMS siap: ${rows.length} konten bawaan diproses, ${normalized} link TikTok diperbaiki.`);
}

seedPortal().catch((error) => {
  console.error(error);
  process.exit(1);
});
