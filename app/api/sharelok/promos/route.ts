import { NextRequest, NextResponse } from "next/server";
import { createPromoCode, deletePromoCode, getPromoCodes, updatePromoCode } from "@/lib/sharelok-db";

export async function GET() {
  try {
    return NextResponse.json(await getPromoCodes());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat promo" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(await createPromoCode({ ...body, expiresAt: new Date(body.expiresAt) }), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat promo" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, expiresAt, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: "ID promo wajib diisi" }, { status: 400 });
    return NextResponse.json(await updatePromoCode(id, { ...data, ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}) }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memperbarui promo" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID promo wajib diisi" }, { status: 400 });
    return NextResponse.json(await deletePromoCode(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus promo" }, { status: 400 });
  }
}
