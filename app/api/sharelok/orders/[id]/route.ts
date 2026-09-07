import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, assignDriver } from "@/lib/sharelok-db";
import { OrderStatus } from "@/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.status) {
      await updateOrderStatus(id, body.status as OrderStatus, body.note);
    }

    if (body.driverId) {
      await assignDriver(id, body.driverId, body.assignedBy, body.reason);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed updating order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
