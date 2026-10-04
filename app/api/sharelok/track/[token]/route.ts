import { NextRequest, NextResponse } from "next/server";
import { getPublicOrderByTrackingToken } from "@/lib/sharelok-db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!/^[a-zA-Z0-9-]{24,64}$/.test(token)) {
      return NextResponse.json({ error: "Link pesanan tidak valid" }, { status: 404 });
    }

    const order = await getPublicOrderByTrackingToken(token);
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(order, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memuat status pesanan" },
      { status: 500 }
    );
  }
}
