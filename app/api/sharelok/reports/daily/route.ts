import { NextRequest, NextResponse } from "next/server";
import { getDailyClosingReport } from "@/lib/sharelok-db";

function todayInJakarta() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date") || todayInJakarta();
    return NextResponse.json(await getDailyClosingReport(date));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat laporan closing";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
