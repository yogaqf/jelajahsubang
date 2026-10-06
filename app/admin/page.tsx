"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  Bike,
  Store,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  CalendarDays,
} from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveringOrders: number;
  completedOrders: number;
  activeDrivers: number;
  activeMerchants: number;
  activeAreas: number;
  isLiveDb: boolean;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  total: number;
  createdAt: string;
  merchant?: { name: string } | null;
  driver?: { name: string } | null;
}

function fmt(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

type PeriodId = "all" | "today" | "yesterday" | "7d" | "30d" | "custom";

const periodOptions: { id: PeriodId; label: string }[] = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Hari Ini" },
  { id: "yesterday", label: "Kemarin" },
  { id: "7d", label: "7 Hari Terakhir" },
  { id: "30d", label: "30 Hari Terakhir" },
  { id: "custom", label: "Rentang Tanggal" },
];

const jakartaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function jakartaToday() {
  return jakartaDateFormatter.format(new Date());
}

function shiftJakartaDate(value: string, days: number) {
  const timestamp = new Date(`${value}T00:00:00+07:00`).getTime() + days * 86_400_000;
  return jakartaDateFormatter.format(new Date(timestamp));
}

function periodQuery(period: PeriodId, customFrom: string, customTo: string) {
  if (period === "all") return "";
  const today = jakartaToday();
  const selectedDate = period === "yesterday" ? shiftJakartaDate(today, -1) : today;
  const rangeStart = customFrom || today;
  const rangeEnd = customTo || rangeStart;
  const startDate = period === "7d"
    ? shiftJakartaDate(today, -6)
    : period === "30d"
      ? shiftJakartaDate(today, -29)
      : period === "custom"
        ? rangeStart
        : selectedDate;
  const endDate = period === "custom"
    ? shiftJakartaDate(rangeEnd, 1)
    : period === "yesterday"
      ? shiftJakartaDate(selectedDate, 1)
    : shiftJakartaDate(today, 1);
  return new URLSearchParams({
    from: `${startDate}T00:00:00+07:00`,
    to: `${endDate}T00:00:00+07:00`,
  }).toString();
}

function formatRangeDate(value: string) {
  const safeValue = value || jakartaToday();
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${safeValue}T00:00:00+07:00`));
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodId>("all");
  const [customFrom, setCustomFrom] = useState(jakartaToday);
  const [customTo, setCustomTo] = useState(jakartaToday);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const query = periodQuery(period, customFrom, customTo);
      const suffix = query ? `?${query}` : "";
      const [resStats, resOrders] = await Promise.all([
        fetch(`/api/sharelok/stats${suffix}`),
        fetch(`/api/sharelok/orders${suffix}`),
      ]);
      const dataStats = await resStats.json();
      const dataOrders = await resOrders.json();
      setStats(dataStats);
      setRecentOrders(Array.isArray(dataOrders) ? dataOrders.slice(0, 5) : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [customFrom, customTo, period]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const activePeriodLabel = period === "custom"
    ? `${formatRangeDate(customFrom)} – ${formatRangeDate(customTo)}`
    : periodOptions.find((item) => item.id === period)?.label || "All Time";

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Dashboard Sharelok
          </h2>
          <p className="mt-1 text-sm text-emerald-100">
            Monitoring pesanan, merchant, driver, dan {stats?.activeAreas || 0} area layanan aktif.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold backdrop-blur-sm transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CalendarDays className="h-4 w-4" /></span><div><div className="text-xs font-black text-zinc-900">Filter Periode Dashboard</div><div className="text-[10px] text-zinc-400">Statistik dan pesanan terbaru mengikuti periode: <span className="font-bold text-emerald-700">{activePeriodLabel}</span></div></div></div>
          <div className="flex flex-wrap items-center gap-2">
            {periodOptions.map((option) => (
              <button key={option.id} type="button" onClick={() => setPeriod(option.id)} className={`rounded-xl px-3 py-2 text-[11px] font-bold transition ${period === option.id ? "bg-emerald-700 text-white shadow-sm" : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-emerald-300 hover:text-emerald-700"}`}>{option.label}</button>
            ))}
            {period === "custom" && <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
              <label className="text-[10px] font-bold text-zinc-500">Dari<input required type="date" value={customFrom} onChange={(event) => { const value = event.target.value; if (!value) return; setCustomFrom(value); if (customTo < value) setCustomTo(value); }} max={customTo || jakartaToday()} className="mt-1 w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[11px] font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-100" /></label>
              <label className="text-[10px] font-bold text-zinc-500">Sampai<input required type="date" value={customTo} onChange={(event) => { if (event.target.value) setCustomTo(event.target.value); }} min={customFrom} max={jakartaToday()} className="mt-1 w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[11px] font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-100" /></label>
            </div>}
          </div>
        </div>
      </section>

      {/* Database Integration Notice */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-emerald-900">
            <span className="font-bold">Status Database: </span>
            {stats?.isLiveDb ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Terhubung langsung ke Neon PostgreSQL via Drizzle ORM.
              </span>
            ) : (
              <span>
                Berjalan dengan Fallback Store (Siap terhubung). Untuk menghubungkan ke Neon live, cantumkan <code className="bg-white/80 px-1 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">DATABASE_URL</code> pada file <code className="bg-white/80 px-1 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">.env.local</code> dan jalankan <code className="bg-white/80 px-1 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">npx drizzle-kit push</code>.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Total Omzet</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-zinc-900">
            {fmt(stats?.totalRevenue || 0)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
            <span>Dari pesanan selesai · {activePeriodLabel}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Total Pesanan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-zinc-900">
            {stats?.totalOrders || 0}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
            <span className="font-semibold text-amber-600">{stats?.pendingOrders || 0} pending</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Mitra Merchant</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-zinc-900">
            {stats?.activeMerchants || 0}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Warung & Resto aktif</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Driver Siaga</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Bike className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-zinc-900">
            {stats?.activeDrivers || 0}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Kurir aktif mengantar</div>
        </div>
      </div>

      {/* Orders pipeline status overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Menunggu Konfirmasi</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-amber-900">
            {stats?.pendingOrders || 0}
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800">Sedang Dimasak</span>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-purple-900">
            {stats?.preparingOrders || 0}
          </div>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800">Dalam Pengantaran</span>
            <Bike className="h-4 w-4 text-sky-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-sky-900">
            {stats?.deliveringOrders || 0}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Selesai / Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-emerald-900">
            {stats?.completedOrders || 0}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Pesanan Terbaru</h3>
            <p className="text-xs text-zinc-500">Transaksi terakhir pada periode {activePeriodLabel}</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            Lihat Semua Pesanan <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                <th className="pb-3 font-semibold">No. Pesanan</th>
                <th className="pb-3 font-semibold">Pelanggan</th>
                <th className="pb-3 font-semibold">Merchant</th>
                <th className="pb-3 font-semibold">Driver</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">
                    Belum ada data pesanan.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition">
                    <td className="py-3.5 font-bold text-zinc-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-zinc-900">{order.customerName}</div>
                      <div className="text-[11px] text-zinc-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-3.5 text-zinc-600">
                      {order.merchant?.name || "Merchant"}
                    </td>
                    <td className="py-3.5">
                      {order.driver?.name ? (
                        <span className="flex items-center gap-1 text-zinc-700 font-medium">
                          <Bike className="h-3 w-3 text-emerald-600" /> {order.driver.name}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">Belum ditugaskan</span>
                      )}
                    </td>
                    <td className="py-3.5 font-bold text-emerald-700">
                      {fmt(order.total)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                          statusBadgeColor[order.status] || "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href="/admin/orders"
                        className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-200 transition"
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
