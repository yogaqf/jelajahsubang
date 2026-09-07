import { NextRequest, NextResponse } from "next/server";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/sharelok-db";

export async function GET() {
  try {
    const cats = await getCategories();
    return NextResponse.json(cats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed fetching categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newCat = await createCategory(body);
    return NextResponse.json(newCat, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed creating category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const updated = await updateCategory(id, data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed updating category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed deleting category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
