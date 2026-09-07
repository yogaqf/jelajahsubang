import { NextResponse } from "next/server";
import { getSharelokStats } from "@/lib/sharelok-db";

export async function GET() {
  try {
    const stats = await getSharelokStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed fetching stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
