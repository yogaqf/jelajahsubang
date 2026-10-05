import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getPortalEntryBySlug, incrementPortalArticleView } from "@/lib/portal-db";

const VIEW_WINDOW_SECONDS = 6 * 60 * 60;

function viewCookieName(slug: string) {
  const digest = createHash("sha1").update(slug).digest("hex").slice(0, 16);
  return `js_article_view_${digest}`;
}

export async function POST(request: NextRequest, context: RouteContext<"/api/portal/views/[slug]">) {
  const { slug } = await context.params;
  if (!/^[a-z0-9-]{1,255}$/.test(slug)) {
    return NextResponse.json({ error: "Slug artikel tidak valid." }, { status: 400 });
  }

  const entry = await getPortalEntryBySlug(slug);
  if (!entry || entry.type !== "BLOG" || !entry.isPublished) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  const cookieName = viewCookieName(slug);
  if (request.cookies.has(cookieName)) {
    return NextResponse.json({ viewCount: entry.viewCount, counted: false });
  }

  const viewCount = await incrementPortalArticleView(slug);
  if (viewCount === null) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  const response = NextResponse.json({ viewCount, counted: true });
  response.cookies.set(cookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VIEW_WINDOW_SECONDS,
    path: "/",
  });
  return response;
}
