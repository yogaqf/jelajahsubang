"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  Bike,
  CheckCircle2,
  RefreshCw,
  X,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  ChevronRight,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  merchantId: string;
  driverId: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string | null;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  adminNote: string | null;
  createdAt: string;
  merchant?: { name: string; phone?: string } | null;
  driver?: { name: string; phone?: string; vehiclePlate?: string } | null;
  items?: {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  statusHistory?: {
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }[];
}

interface DriverOption {
  id: string;
  name: string;
  phone: string;
  vehicleType?: string;
  vehiclePlate?: string;
  isActive: boolean;
}

function fmt(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

const statusBadgeColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PREPARING: "bg-purple-100 text-purple-800 border-purple-200",
  READY: "bg-indigo-100 text-indigo-800 border-indigo-200",
  DELIVERING: "bg-sky-100 text-sky-800 border-sky-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
};

const statusTabs = [
  { id: "ALL", label: "Semua" },
  { id: "PENDING", label: "Menunggu" },
  { id: "CONFIRMED", label: "Dikonfirmasi" },
  { id: "PREPARING", label: "Dimasak" },
  { id: "READY", label: "Siap Diantar" },
  { id: "DELIVERING", label: "Diantar" },
  { id: "COMPLETED", label: "Selesai" },
  { id: "CANCELLED", label: "Dibatalkan" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Driver assign modal
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedStatus !== "ALL") q.set("status", selectedStatus);
      if (search) q.set("search", search);

      const [resOrders, resDrivers] = await Promise.all([
        fetch(`/api/sharelok/orders?${q.toString()}`),
        fetch("/api/sharelok/drivers"),
      ]);

      const dataOrders = await resOrders.json();
      const dataDrivers = await resDrivers.json();

      setOrders(Array.isArray(dataOrders) ? dataOrders : []);
      setDrivers(Array.isArray(dataDrivers) ? dataDrivers : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadData();
  }

  async function handleUpdateStatus(orderId: string, newStatus: string, note?: string) {
    setIsSubmitting(true);
    try {
      await fetch(`/api/sharelok/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note }),
      });
      await loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAssignDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!assigningOrder || !selectedDriverId) return;

    setIsSubmitting(true);
    try {
      await fetch(`/api/sharelok/orders/${assigningOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: selectedDriverId,
          reason: assignReason || "Penugasan driver oleh admin",
          status: assigningOrder.status === "READY" ? "DELIVERING" : assigningOrder.status,
        }),
      });
      setAssigningOrder(null);
      setSelectedDriverId("");
      setAssignReason("");
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
            Manajemen Pesanan
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Pantau dan kelola alur status pemesanan makanan serta penugasan kurir.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              selectedStatus === tab.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari no pesanan, nama pelanggan, no telepon, atau merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-900 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
        >
          Cari
        </button>
      </form>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5">No. Pesanan</th>
                <th className="px-4 py-3.5">Pelanggan</th>
                <th className="px-4 py-3.5">Merchant</th>
                <th className="px-4 py-3.5">Driver</th>
                <th className="px-4 py-3.5">Total Biaya</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                    <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                    Tidak ada pesanan dengan kriteria ini.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900">{order.orderNumber}</div>
                      <div className="text-[11px] text-zinc-400">
                        {new Date(order.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900">{order.customerName}</div>
                      <div className="text-[11px] text-zinc-400">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-800 font-medium">
                      {order.merchant?.name || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      {order.driver?.name ? (
                        <div className="flex items-center gap-1.5">
                          <Bike className="h-3.5 w-3.5 text-emerald-600" />
                          <div>
                            <div className="font-medium text-zinc-900">{order.driver.name}</div>
                            <div className="text-[10px] text-zinc-400">{order.driver.vehiclePlate}</div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAssigningOrder(order);
                            setSelectedDriverId(order.driverId || "");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-emerald-400 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <Bike className="h-3 w-3" /> + Tugaskan
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      {fmt(order.total)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                          statusBadgeColor[order.status] || "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-200 transition"
                      >
                        Detail
                      </button>

                      {/* Contextual fast action based on status */}
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "CONFIRMED", "Admin mengonfirmasi pesanan")}
                          className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 transition"
                        >
                          Konfirmasi
                        </button>
                      )}
                      {order.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "PREPARING", "Resto mulai memasak")}
                          className="rounded-lg bg-purple-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-purple-700 transition"
                        >
                          Mulai Masak
                        </button>
                      )}
                      {order.status === "PREPARING" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "READY", "Makanan siap di-pickup")}
                          className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700 transition"
                        >
                          Siap Diantar
                        </button>
                      )}
                      {order.status === "READY" && !order.driverId && (
                        <button
                          onClick={() => {
                            setAssigningOrder(order);
                            setSelectedDriverId(order.driverId || "");
                          }}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          Pilih Driver
                        </button>
                      )}
                      {order.status === "DELIVERING" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "COMPLETED", "Pesanan telah diterima pelanggan")}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          Selesaikan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ORDER DETAIL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <div className="text-xs text-zinc-400">Rincian Lengkap Pesanan</div>
                <h3 className="text-lg font-bold text-zinc-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Change Bar */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Status Saat Ini:</span>
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                    statusBadgeColor[selectedOrder.status]
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERING", "COMPLETED", "CANCELLED"].map(
                  (st) => (
                    <button
                      key={st}
                      disabled={isSubmitting || selectedOrder.status === st}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                        selectedOrder.status === st
                          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      Set {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <User className="h-4 w-4 text-emerald-600" /> Pelanggan
                </div>
                <div className="text-sm font-semibold text-zinc-900">{selectedOrder.customerName}</div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Phone className="h-3.5 w-3.5" /> {selectedOrder.customerPhone}
                </div>
                <div className="flex items-start gap-1.5 text-xs text-zinc-600">
                  <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{selectedOrder.customerAddress}</span>
                </div>
                {selectedOrder.customerNote && (
                  <div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                    <span className="font-bold">Catatan:</span> {selectedOrder.customerNote}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <Bike className="h-4 w-4 text-emerald-600" /> Kurir & Merchant
                </div>
                <div className="text-xs">
                  <span className="text-zinc-400">Merchant:</span>{" "}
                  <span className="font-semibold text-zinc-800">{selectedOrder.merchant?.name || "-"}</span>
                </div>
                <div className="text-xs">
                  <span className="text-zinc-400">Kurir / Driver:</span>{" "}
                  {selectedOrder.driver ? (
                    <span className="font-semibold text-zinc-800">
                      {selectedOrder.driver.name} ({selectedOrder.driver.vehiclePlate})
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">Belum ada driver</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setAssigningOrder(selectedOrder);
                    setSelectedDriverId(selectedOrder.driverId || "");
                  }}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <Bike className="h-3.5 w-3.5" /> Ganti / Tugaskan Driver
                </button>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Item Makanan Dipesan
              </h4>
              <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <div className="font-bold text-zinc-900">{item.productName}</div>
                        <div className="text-zinc-400">
                          {fmt(item.price)} x {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-zinc-800">{fmt(item.subtotal)}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-zinc-400">Tidak ada rincian item.</div>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal Menu:</span>
                <span>{fmt(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Ongkos Kirim Subang:</span>
                <span>{fmt(selectedOrder.deliveryFee)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Diskon Promo:</span>
                  <span>-{fmt(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-extrabold text-zinc-900">
                <span>Total Pembayaran:</span>
                <span className="text-emerald-700">{fmt(selectedOrder.total)}</span>
              </div>
              <div className="text-[11px] text-zinc-500 pt-1">
                Metode Pembayaran: <span className="font-semibold text-zinc-700">{selectedOrder.paymentMethod || "Tunai / COD"}</span>
              </div>
            </div>

            {/* Status History */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Riwayat Status
                </h4>
                <div className="rounded-xl border border-zinc-200 p-3 space-y-2 text-xs">
                  {selectedOrder.statusHistory.map((h) => (
                    <div key={h.id} className="flex items-start gap-2 border-l-2 border-emerald-500 pl-3 py-1">
                      <div>
                        <div className="font-bold text-zinc-800">{h.status}</div>
                        <div className="text-[11px] text-zinc-500">{h.note}</div>
                        <div className="text-[10px] text-zinc-400">
                          {new Date(h.createdAt).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN DRIVER */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">
                Tugaskan Driver ({assigningOrder.orderNumber})
              </h3>
              <button
                onClick={() => setAssigningOrder(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignDriver} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Pilih Driver Aktif:
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Driver --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.vehiclePlate || "Motor"}) {d.isActive ? "🟢 Siaga" : "⚪ Nonaktif"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Alasan / Catatan Penugasan:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Driver terdekat di area resto"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningOrder(null)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-zinc-600 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDriverId}
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Tugaskan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
