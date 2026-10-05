import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_DURATION_SECONDS, createAdminSessionToken, isAdminAuthConfigured } from "@/lib/admin-auth";

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "Login admin belum dikonfigurasi pada environment server." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const expectedEmail = process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD!;

  if (!safeEqual(email, expectedEmail) || !safeEqual(password, expectedPassword)) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return NextResponse.json({ error: "Email atau password tidak sesuai." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(expectedEmail), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
    path: "/",
    priority: "high",
  });
  return response;
}
