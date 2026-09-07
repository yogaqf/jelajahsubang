import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/sharelok-db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const orders = await getOrders(status, search);
    return NextResponse.json(orders);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed fetching orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
