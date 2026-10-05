import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createPortalEntry, deletePortalEntry, getPortalEntries, PORTAL_TYPES, updatePortalEntry } from "@/lib/portal-db";

function cleanUrl(value: unknown) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (text.startsWith("/")) return text;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function normalizeEmbedUrl(platform: string | null, value: unknown) {
  const cleaned = cleanUrl(value);
  if (!cleaned || !platform) return cleaned;

  if (platform === "TIKTOK") {
    let candidate = cleaned;
    const parsed = new URL(candidate);
    if (parsed.hostname === "vt.tiktok.com" || parsed.hostname === "vm.tiktok.com") {
      try {
        const response = await fetch(candidate, { method: "HEAD", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
        candidate = response.url || candidate;
      } catch {
        throw new Error("Link pendek TikTok tidak dapat dibaca. Gunakan link video penuh dari browser.");
      }
    }
    const videoId = candidate.match(/\/video\/(\d+)/)?.[1] || candidate.match(/\/player\/v1\/(\d+)/)?.[1];
    if (!videoId) throw new Error("Link TikTok harus mengarah ke satu video, bukan profil. Contoh: tiktok.com/@akun/video/123...");
    return `https://www.tiktok.com/player/v1/${videoId}?autoplay=0&loop=0`;
  }

  if (platform === "INSTAGRAM") {
    if (/\/embed\/?(?:\?|$)/.test(cleaned)) return cleaned;
    const match = cleaned.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
    if (!match) throw new Error("Link Instagram harus berupa link postingan atau Reel.");
    return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
  }

  if (platform === "YOUTUBE") {
    const url = new URL(cleaned);
    const videoId = url.hostname === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/)?.[1];
    if (!videoId) throw new Error("Link YouTube harus berupa link video atau Shorts.");
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return cleaned;
}

async function payload(body: Record<string, unknown>) {
  const type = String(body.type || "").toUpperCase();
  const platform = body.platform ? String(body.platform).toUpperCase() : null;
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!PORTAL_TYPES.includes(type as (typeof PORTAL_TYPES)[number])) throw new Error("Jenis konten tidak valid");
  if (!title || !slug) throw new Error("Judul dan slug wajib diisi");
  return {
    type,
    platform,
    title,
    slug,
    summary: body.summary ? String(body.summary).trim() : null,
    content: body.content ? String(body.content).trim() : null,
    imageUrl: cleanUrl(body.imageUrl),
    externalUrl: cleanUrl(body.externalUrl),
    embedUrl: await normalizeEmbedUrl(platform, body.embedUrl),
    location: body.location ? String(body.location).trim() : null,
    price: Math.max(0, Number(body.price) || 0),
    isPublished: body.isPublished !== false,
    sortOrder: Number(body.sortOrder) || 0,
    publishedAt: body.publishedAt ? new Date(String(body.publishedAt)) : new Date(),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    return NextResponse.json(await getPortalEntries({ type: url.searchParams.get("type") || undefined, publishedOnly: url.searchParams.get("published") === "true" }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat konten" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const created = await createPortalEntry(await payload(await request.json()));
    revalidatePath("/"); revalidatePath("/blog"); revalidatePath("/destinasi"); revalidatePath("/shop");
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menambah konten" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) throw new Error("ID konten wajib diisi");
    const updated = await updatePortalEntry(String(body.id), await payload(body));
    if (!updated) return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
    revalidatePath("/"); revalidatePath("/blog"); revalidatePath(`/blog/${updated.slug}`); revalidatePath("/destinasi"); revalidatePath("/shop");
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memperbarui konten" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) throw new Error("ID konten wajib diisi");
    const deleted = await deletePortalEntry(id);
    if (!deleted) return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
    revalidatePath("/"); revalidatePath("/blog"); revalidatePath("/destinasi"); revalidatePath("/shop");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus konten" }, { status: 400 });
  }
}
