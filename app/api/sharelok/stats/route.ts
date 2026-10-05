import { NextRequest, NextResponse } from "next/server";
import { getSharelokStats } from "@/lib/sharelok-db";

function optionalDate(value: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Filter tanggal tidak valid");
  return date;
}

export async function GET(req: NextRequest) {
  try {
    const stats = await getSharelokStats(
      optionalDate(req.nextUrl.searchParams.get("from")),
      optionalDate(req.nextUrl.searchParams.get("to"))
    );
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed fetching stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
