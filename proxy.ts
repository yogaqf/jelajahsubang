import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

function requiresAdminApi(pathname: string, method: string) {
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/portal/views/")) return false;
  if (pathname.startsWith("/api/uploads/")) return true;
  if (pathname === "/api/portal/entries") return true;
  if (pathname.startsWith("/api/sharelok/reports/") || pathname === "/api/sharelok/stats") return true;
  if (pathname === "/api/sharelok/drivers" || pathname.startsWith("/api/sharelok/orders/")) return true;
  if (pathname === "/api/sharelok/orders") return method !== "POST";
  if (pathname === "/api/sharelok/promos/validate" || pathname.startsWith("/api/sharelok/track/")) return false;
  if (pathname === "/api/sharelok/promos") return true;
  if (["/api/sharelok/areas", "/api/sharelok/categories", "/api/sharelok/merchants", "/api/sharelok/products"].includes(pathname)) return method !== "GET";
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/sharelok/admin")) {
    const remainder = pathname.slice("/sharelok/admin".length);
    return NextResponse.redirect(new URL(`/admin${remainder}${request.nextUrl.search}`, request.url), 308);
  }

  const session = await verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    return session ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/") || requiresAdminApi(pathname, request.method)) {
    if (session) return NextResponse.next();
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Sesi admin tidak valid atau sudah berakhir." }, { status: 401 });

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sharelok/admin/:path*", "/api/:path*"],
};
