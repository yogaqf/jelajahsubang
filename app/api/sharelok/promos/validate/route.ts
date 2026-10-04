import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/sharelok-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(await validatePromoCode(String(body.code || ""), Number(body.subtotal || 0)));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kode promo tidak valid" }, { status: 400 });
  }
}
