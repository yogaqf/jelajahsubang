import { NextRequest, NextResponse } from "next/server";
import { createServiceArea, deleteServiceArea, getServiceAreas, updateServiceArea } from "@/lib/sharelok-db";

export async function GET() {
  try {
    return NextResponse.json(await getServiceAreas());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat area" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(await createServiceArea(await request.json()), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat area" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: "ID area wajib diisi" }, { status: 400 });
    return NextResponse.json(await updateServiceArea(id, data));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memperbarui area" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID area wajib diisi" }, { status: 400 });
    return NextResponse.json(await deleteServiceArea(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus area" }, { status: 400 });
  }
}
