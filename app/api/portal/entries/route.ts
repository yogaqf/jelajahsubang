import { NextResponse } from "next/server";
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

function payload(body: Record<string, unknown>) {
  const type = String(body.type || "").toUpperCase();
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!PORTAL_TYPES.includes(type as (typeof PORTAL_TYPES)[number])) throw new Error("Jenis konten tidak valid");
  if (!title || !slug) throw new Error("Judul dan slug wajib diisi");
  return {
    type,
    platform: body.platform ? String(body.platform).toUpperCase() : null,
    title,
    slug,
    summary: body.summary ? String(body.summary).trim() : null,
    content: body.content ? String(body.content).trim() : null,
    imageUrl: cleanUrl(body.imageUrl),
    externalUrl: cleanUrl(body.externalUrl),
    embedUrl: cleanUrl(body.embedUrl),
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
    return NextResponse.json(await createPortalEntry(payload(await request.json())), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menambah konten" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) throw new Error("ID konten wajib diisi");
    const updated = await updatePortalEntry(String(body.id), payload(body));
    if (!updated) return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
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
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus konten" }, { status: 400 });
  }
}
