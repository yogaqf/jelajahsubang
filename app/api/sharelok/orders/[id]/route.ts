import { NextRequest, NextResponse } from "next/server";
import {
  addOrderHistoryNote,
  assignDriver,
  offerDriver,
  respondToDriverOffer,
  updateMerchantOrderStatus,
  updateOrderPaymentDetails,
  updateOrderItems,
  updateOrderStatus,
  updateOrderArea,
  deleteOrder,
  getOrderById,
} from "@/lib/sharelok-db";
import { MerchantOrderStatus, OrderStatus } from "@/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat pesanan" }, { status: 500 });
  }
}

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

    if (body.areaId) {
      await updateOrderArea(id, body.areaId);
    }

    if (body.driverId) {
      if (body.driverAction === "OFFER") {
        await offerDriver(id, body.driverId, body.assignedBy, body.reason);
      } else {
        await assignDriver(id, body.driverId, body.assignedBy, body.reason);
      }
    }

    if (body.merchantStatus) {
      await updateMerchantOrderStatus(id, body.merchantStatus as MerchantOrderStatus);
    }

    if (body.assignmentId && body.assignmentStatus) {
      await respondToDriverOffer(body.assignmentId, body.assignmentStatus);
    }

    if (body.historyNote) {
      await addOrderHistoryNote(id, String(body.historyNote));
    }

    if (Array.isArray(body.items)) {
      await updateOrderItems(id, body.items);
    }

    if (
      body.deliveryFee !== undefined ||
      body.discount !== undefined ||
      body.paymentMethod !== undefined ||
      body.paymentStatus !== undefined
    ) {
      await updateOrderPaymentDetails(id, {
        deliveryFee: body.deliveryFee,
        discount: body.discount,
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentStatus,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed updating order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (typeof body.confirmOrderNumber !== "string") {
      return NextResponse.json({ error: "Nomor pesanan wajib diketik untuk verifikasi." }, { status: 400 });
    }
    const result = await deleteOrder(id, body.confirmOrderNumber);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus pesanan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
