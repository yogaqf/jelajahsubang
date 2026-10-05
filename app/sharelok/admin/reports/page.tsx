"use client";

import { useEffect, useState } from "react";
import { BarChart3, Bike, CalendarDays, FileDown, ImageDown, Loader2, MapPinned, RefreshCw, Store, WalletCards } from "lucide-react";
import { downloadDailyReportPdf } from "@/lib/sharelok-daily-report-pdf";

interface DailyReport {
  date: string;
  totals: {
    orders: number;
    customerPayments: number;
    merchantPayouts: number;
    driverCommissions: number;
    platformRevenue: number;
  };
  merchants: { merchantId: string; merchantName: string; orders: number; sales: number; payout: number }[];
  drivers: { driverId: string; driverName: string; orders: number; deliveryFees: number; commission: number }[];
  areas: { areaId: string | null; areaName: string; orders: number; customerPayments: number; platformRevenue: number }[];
  menus: { productId: string | null; productName: string; merchantName: string; orders: number; quantity: number; sales: number }[];
  closings: {
    id: string;
    orderNumber: string;
    closedAt: string;
    customerName: string;
    merchantId: string;
    driverId: string | null;
    areaName: string;
    merchantName: string;
    driverName: string;
    subtotal: number;
    deliveryFee: number;
    customerPayment: number;
    merchantPayout: number;
    driverCommissionPercent: number;
    driverCommission: number;
    platformRevenue: number;
  }[];
}

function jakartaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function money(value: number) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T12:00:00+07:00`));
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

async function createSettlementJpeg(options: {
  kind: "merchant" | "driver";
  name: string;
  date: string;
  orders: number;
  primaryLabel: string;
  primaryValue: number;
  secondaryLabel: string;
  secondaryValue: number;
  rows: { orderNumber: string; meta: string; amount: number; suffix?: string }[];
}) {
  const width = 1080;
  const height = Math.max(1350, 1010 + options.rows.length * 96);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser tidak mendukung pembuatan gambar.");

  const accent = options.kind === "merchant" ? "#d97706" : "#7e22ce";
  const accentSoft = options.kind === "merchant" ? "#fffbeb" : "#faf5ff";
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#f0fdf4");
  background.addColorStop(0.5, "#ffffff");
  background.addColorStop(1, accentSoft);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const header = context.createLinearGradient(0, 0, width, 380);
  header.addColorStop(0, "#052e16");
  header.addColorStop(1, "#047857");
  context.fillStyle = header;
  context.fillRect(0, 0, width, 390);
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.beginPath(); context.arc(940, 70, 250, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(110, 360, 170, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#ffffff";
  context.font = "900 48px Arial, sans-serif";
  context.fillText("Share", 70, 92);
  const shareWidth = context.measureText("Share").width;
  context.fillStyle = "#fb7185";
  context.fillText("lok", 70 + shareWidth, 92);
  context.fillStyle = "#a7f3d0";
  context.font = "700 22px Arial, sans-serif";
  context.fillText("KULINER LOKAL SUBANG", 72, 128);

  context.fillStyle = "#ffffff";
  context.font = "900 43px Arial, sans-serif";
  context.fillText(options.kind === "merchant" ? "RINCIAN PEMBAYARAN MITRA" : "RINCIAN KOMISI DRIVER", 70, 226);
  context.fillStyle = "rgba(255,255,255,0.72)";
  context.font = "600 26px Arial, sans-serif";
  context.fillText(displayDate(options.date), 70, 273);

  roundedRect(context, 70, 315, 940, 150, 30);
  context.fillStyle = "#ffffff";
  context.shadowColor = "rgba(15,23,42,0.12)";
  context.shadowBlur = 28;
  context.shadowOffsetY = 10;
  context.fill();
  context.shadowColor = "transparent";
  context.fillStyle = "#71717a";
  context.font = "800 19px Arial, sans-serif";
  context.fillText(options.kind === "merchant" ? "MITRA" : "DRIVER", 110, 365);
  context.fillStyle = "#18181b";
  context.font = "900 36px Arial, sans-serif";
  context.fillText(options.name, 110, 415, 840);

  const summaryY = 510;
  const summaryItems = [
    { label: "ORDER SELESAI", value: `${options.orders} order`, color: "#18181b" },
    ...(options.kind === "driver" ? [{ label: options.secondaryLabel, value: money(options.secondaryValue), color: "#2563eb" }] : []),
    { label: options.primaryLabel, value: money(options.primaryValue), color: accent },
  ];
  const summaryGap = 30;
  const boxWidth = (940 - summaryGap * (summaryItems.length - 1)) / summaryItems.length;
  summaryItems.forEach((item, index) => {
    const x = 70 + index * (boxWidth + summaryGap);
    roundedRect(context, x, summaryY, boxWidth, 150, 24);
    context.fillStyle = "#ffffff";
    context.fill();
    context.strokeStyle = "#e4e4e7";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "#a1a1aa";
    context.font = "800 17px Arial, sans-serif";
    context.fillText(item.label, x + 24, summaryY + 48, boxWidth - 48);
    context.fillStyle = item.color;
    context.font = "900 27px Arial, sans-serif";
    context.fillText(item.value, x + 24, summaryY + 103, boxWidth - 48);
  });

  const listY = 720;
  context.fillStyle = "#18181b";
  context.font = "900 29px Arial, sans-serif";
  context.fillText("Rincian order", 70, listY);
  context.fillStyle = "#71717a";
  context.font = "500 19px Arial, sans-serif";
  context.fillText("Perhitungan berdasarkan order yang selesai pada tanggal laporan.", 70, listY + 35);

  options.rows.forEach((row, index) => {
    const y = listY + 75 + index * 96;
    roundedRect(context, 70, y, 940, 78, 18);
    context.fillStyle = index % 2 === 0 ? "#ffffff" : "#fafafa";
    context.fill();
    context.strokeStyle = "#e4e4e7";
    context.lineWidth = 1.5;
    context.stroke();
    context.fillStyle = "#27272a";
    context.font = "800 21px Arial, sans-serif";
    context.fillText(row.orderNumber, 96, y + 31);
    context.fillStyle = "#a1a1aa";
    context.font = "600 16px Arial, sans-serif";
    context.fillText(row.meta, 96, y + 57, 560);
    context.textAlign = "right";
    context.fillStyle = accent;
    context.font = "900 22px Arial, sans-serif";
    context.fillText(money(row.amount), 984, y + 34);
    if (row.suffix) {
      context.fillStyle = "#a1a1aa";
      context.font = "700 15px Arial, sans-serif";
      context.fillText(row.suffix, 984, y + 58);
    }
    context.textAlign = "left";
  });

  const footerY = height - 165;
  context.strokeStyle = "#d4d4d8";
  context.lineWidth = 2;
  context.beginPath(); context.moveTo(70, footerY); context.lineTo(1010, footerY); context.stroke();
  context.fillStyle = "#047857";
  context.font = "900 22px Arial, sans-serif";
  context.fillText("Terima kasih telah menjadi bagian dari Sharelok.", 70, footerY + 50);
  context.fillStyle = "#71717a";
  context.font = "500 16px Arial, sans-serif";
  context.fillText(`Dibuat otomatis ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`, 70, footerY + 85);
  context.textAlign = "right";
  context.fillText("Laporan closing harian", 1010, footerY + 85);
  context.textAlign = "left";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Gagal membuat JPEG.")), "image/jpeg", 0.94);
  });
}

export default function DailyClosingReportPage() {
  const [date, setDate] = useState(jakartaToday);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharingKey, setSharingKey] = useState("");
  const [shareNotice, setShareNotice] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadReport() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/sharelok/reports/daily?date=${date}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Gagal memuat laporan");
        if (active) setReport(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat laporan");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadReport();
    return () => { active = false; };
  }, [date]);

  const cards = report ? [
    { label: "Order closing", value: `${report.totals.orders} order`, tone: "text-zinc-900" },
    { label: "Pembayaran customer", value: money(report.totals.customerPayments), tone: "text-blue-700" },
    { label: "Bayar ke mitra", value: money(report.totals.merchantPayouts), tone: "text-amber-700" },
    { label: "Komisi driver", value: money(report.totals.driverCommissions), tone: "text-purple-700" },
    { label: "Pendapatan Sharelok", value: money(report.totals.platformRevenue), tone: "text-emerald-700" },
  ] : [];

  async function downloadSettlement(kind: "merchant" | "driver", partnerId: string) {
    if (!report || sharingKey) return;
    const key = `${kind}-${partnerId}`;
    setSharingKey(key);
    setShareNotice("");
    try {
      let name: string;
      let orders: number;
      let primaryValue: number;
      let secondaryValue: number;
      if (kind === "merchant") {
        const merchant = report.merchants.find((item) => item.merchantId === partnerId);
        if (!merchant) throw new Error("Data rincian mitra tidak ditemukan.");
        name = merchant.merchantName;
        orders = merchant.orders;
        primaryValue = merchant.payout;
        secondaryValue = merchant.sales;
      } else {
        const driver = report.drivers.find((item) => item.driverId === partnerId);
        if (!driver) throw new Error("Data rincian driver tidak ditemukan.");
        name = driver.driverName;
        orders = driver.orders;
        primaryValue = driver.commission;
        secondaryValue = driver.deliveryFees;
      }

      const closings = report.closings.filter((item) =>
        kind === "merchant" ? item.merchantId === partnerId : item.driverId === partnerId
      );
      const blob = await createSettlementJpeg({
        kind,
        name,
        date: report.date,
        orders,
        primaryLabel: kind === "merchant" ? "TOTAL DIBAYARKAN" : "TOTAL KOMISI",
        primaryValue,
        secondaryLabel: kind === "merchant" ? "TOTAL PENJUALAN" : "RATA-RATA / ORDER",
        secondaryValue: kind === "merchant" ? secondaryValue : Math.floor(primaryValue / Math.max(1, orders)),
        rows: closings.map((item) => ({
          orderNumber: item.orderNumber,
          meta: `${new Date(item.closedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} · ${item.areaName}`,
          amount: kind === "merchant" ? item.merchantPayout : item.driverCommission,
        })),
      });
      const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const filename = `sharelok-${kind}-${safeName}-${report.date}.jpg`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setShareNotice(`JPEG ${name} berhasil diunduh dengan nama ${filename}.`);
    } catch (caught) {
      setShareNotice(caught instanceof Error ? caught.message : "Gagal membuat rincian JPEG.");
    } finally {
      setSharingKey("");
    }
  }

  async function handleDownloadPdf() {
    if (!report || exportingPdf) return;
    setExportingPdf(true);
    setShareNotice("");
    try {
      await downloadDailyReportPdf(report);
      setShareNotice(`Daily Report PDF ${displayDate(report.date)} berhasil diunduh.`);
    } catch (caught) {
      setShareNotice(caught instanceof Error ? caught.message : "Gagal membuat Daily Report PDF.");
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-zinc-900">Laporan Closing Harian</h2>
          <p className="text-sm text-zinc-500">Rekap order selesai, pembayaran mitra, komisi driver, dan pendapatan Sharelok.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="bg-transparent text-zinc-900 outline-none" />
            {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          </label>
          <button type="button" onClick={handleDownloadPdf} disabled={!report || loading || exportingPdf} className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
            {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Unduh Daily Report PDF
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
        <strong>Rumus:</strong> bayar mitra = total HPP item. Komisi driver = persentase driver × ongkir. Pendapatan Sharelok = margin menu + sisa ongkir − diskon. Nilai dikunci saat order diselesaikan.
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {shareNotice && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"><ImageDown className="h-4 w-4 shrink-0" /> {shareNotice}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{card.label}</div>
            <div className={`mt-2 text-xl font-black ${card.tone}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 font-bold text-zinc-900"><BarChart3 className="h-4 w-4 text-red-600" /> Ranking Menu by Order</h3><p className="mt-1 text-xs text-zinc-500">Diurutkan dari jumlah order selesai, lalu jumlah item terjual.</p></div><span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-700">TOP 10</span></div>
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {report?.menus.length ? report.menus.slice(0, 10).map((menu, index) => (
            <div key={`${menu.productId || menu.productName}-${index}`} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${index < 3 ? "bg-red-600 text-white" : "bg-white text-zinc-500"}`}>#{index + 1}</span>
              <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-zinc-900">{menu.productName}</div><div className="truncate text-[10px] text-zinc-400">{menu.merchantName} · {menu.quantity} item · {money(menu.sales)}</div></div>
              <div className="text-right"><div className="text-sm font-black text-red-700">{menu.orders}</div><div className="text-[9px] font-bold text-zinc-400">ORDER</div></div>
            </div>
          )) : <div className="py-6 text-center text-xs text-zinc-400">Belum ada ranking menu pada tanggal ini.</div>}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="flex items-center gap-2 font-bold text-zinc-900"><Store className="h-4 w-4 text-amber-600" /> Pembayaran Mitra</h3>
          <div className="mt-4 divide-y divide-zinc-100">
            {report?.merchants.length ? report.merchants.map((item) => (
              <div key={item.merchantId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                <div><div className="font-bold text-zinc-900">{item.merchantName}</div><div className="text-zinc-400">{item.orders} order · penjualan {money(item.sales)}</div></div>
                <div className="ml-auto text-right"><div className="text-[10px] text-zinc-400">Harus dibayar</div><div className="font-extrabold text-amber-700">{money(item.payout)}</div></div>
                <button type="button" onClick={() => downloadSettlement("merchant", item.merchantId)} disabled={Boolean(sharingKey)} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-[10px] font-black text-amber-800 hover:bg-amber-200 disabled:opacity-50">
                  {sharingKey === `merchant-${item.merchantId}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageDown className="h-3.5 w-3.5" />} Unduh JPEG
                </button>
              </div>
            )) : <div className="py-8 text-center text-xs text-zinc-400">Belum ada closing pada tanggal ini.</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="flex items-center gap-2 font-bold text-zinc-900"><Bike className="h-4 w-4 text-purple-600" /> Komisi Driver</h3>
          <div className="mt-4 divide-y divide-zinc-100">
            {report?.drivers.length ? report.drivers.map((item) => (
              <div key={item.driverId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                <div><div className="font-bold text-zinc-900">{item.driverName}</div><div className="text-zinc-400">{item.orders} order · ongkir {money(item.deliveryFees)}</div></div>
                <div className="ml-auto text-right"><div className="text-[10px] text-zinc-400">Komisi diterima</div><div className="font-extrabold text-purple-700">{money(item.commission)}</div></div>
                <button type="button" onClick={() => downloadSettlement("driver", item.driverId)} disabled={Boolean(sharingKey)} className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-2 text-[10px] font-black text-purple-800 hover:bg-purple-200 disabled:opacity-50">
                  {sharingKey === `driver-${item.driverId}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageDown className="h-3.5 w-3.5" />} Unduh JPEG
                </button>
              </div>
            )) : <div className="py-8 text-center text-xs text-zinc-400">Belum ada komisi driver.</div>}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5"><h3 className="flex items-center gap-2 font-bold"><MapPinned className="h-4 w-4 text-emerald-600" /> Closing per Area</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{report?.areas.length ? report.areas.map((area) => <div key={area.areaId || "unassigned"} className="rounded-xl bg-zinc-50 p-3"><div className="font-bold text-zinc-900">{area.areaName}</div><div className="mt-1 text-xs text-zinc-500">{area.orders} order · pembayaran {money(area.customerPayments)}</div><div className="mt-2 text-xs font-bold text-emerald-700">Pendapatan {money(area.platformRevenue)}</div></div>) : <div className="text-xs text-zinc-400">Belum ada data area.</div>}</div></section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4 font-bold text-zinc-900"><WalletCards className="h-4 w-4 text-emerald-600" /> Rincian Closing</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Mitra / Driver</th><th className="px-4 py-3 text-right">Customer bayar</th><th className="px-4 py-3 text-right">Bayar mitra</th><th className="px-4 py-3 text-right">Komisi driver</th><th className="px-4 py-3 text-right">Sharelok</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {report?.closings.map((item) => (
                <tr key={item.id}><td className="px-4 py-3"><div className="font-bold text-zinc-900">{item.orderNumber}</div><div className="text-[10px] text-zinc-400">{new Date(item.closedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · {item.customerName}</div></td><td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{item.areaName}</span></td><td className="px-4 py-3"><div className="font-semibold text-zinc-800">{item.merchantName}</div><div className="text-[10px] text-zinc-400">{item.driverName}</div></td><td className="px-4 py-3 text-right font-bold">{money(item.customerPayment)}</td><td className="px-4 py-3 text-right font-bold text-amber-700">{money(item.merchantPayout)}</td><td className="px-4 py-3 text-right font-bold text-purple-700">{money(item.driverCommission)} <span className="text-[10px] font-normal text-zinc-400">({item.driverCommissionPercent}%)</span></td><td className="px-4 py-3 text-right font-extrabold text-emerald-700">{money(item.platformRevenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
