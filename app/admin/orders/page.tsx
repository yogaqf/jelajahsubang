"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  Bike,
  RefreshCw,
  X,
  User,
  Phone,
  MapPin,
  Store,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Pencil,
  Plus,
  Minus,
} from "lucide-react";
import { useAppAlert } from "@/components/ui/app-alert";

interface Order {
  id: string;
  orderNumber: string;
  trackingToken: string;
  areaId: string | null;
  area?: { id: string; name: string } | null;
  promoCode: string | null;
  merchantId: string;
  driverId: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string | null;
  source: string;
  status: string;
  merchantStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  adminNote: string | null;
  driverCommissionPercent: number | null;
  driverCommissionAmount: number | null;
  merchantPayoutAmount: number | null;
  platformRevenueAmount: number | null;
  completedAt: string | null;
  customerContactedAt?: string | null;
  merchantContactedAt?: string | null;
  merchantRespondedAt?: string | null;
  createdAt: string;
  merchant?: { name: string; phone?: string; whatsapp?: string } | null;
  driver?: { name: string; phone?: string; whatsapp?: string; vehiclePlate?: string; commissionPercent?: number } | null;
  items?: {
    id: string;
    productId: string | null;
    productName: string;
    costPrice: number;
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
  driverAssignments?: {
    id: string;
    driverId: string;
    status: string;
    reason?: string | null;
    createdAt: string;
    driver?: { name: string; phone?: string; whatsapp?: string } | null;
  }[];
}

interface DriverOption {
  id: string;
  areaId: string | null;
  name: string;
  phone: string;
  whatsapp?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  commissionPercent: number;
  isActive: boolean;
}

interface ProductOption {
  id: string;
  merchantId: string;
  name: string;
  costPrice: number;
  price: number;
  isAvailable: boolean;
}

interface EditableOrderItem {
  productId: string;
  productName: string;
  costPrice: number;
  price: number;
  quantity: number;
}

function fmt(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

const statusBadgeColor: Record<string, string> = {
  WAITING_CONFIRMATION: "bg-orange-100 text-orange-800 border-orange-200",
  CONTACTED: "bg-cyan-100 text-cyan-800 border-cyan-200",
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
  { id: "WAITING_CONFIRMATION", label: "Calon Order" },
  { id: "CONTACTED", label: "Dihubungi" },
  { id: "PENDING", label: "Menunggu" },
  { id: "CONFIRMED", label: "Dikonfirmasi" },
  { id: "PREPARING", label: "Dimasak" },
  { id: "READY", label: "Siap Diantar" },
  { id: "DELIVERING", label: "Diantar" },
  { id: "COMPLETED", label: "Selesai" },
  { id: "CANCELLED", label: "Dibatalkan" },
];

const statusMeta: Record<string, { label: string; description: string }> = {
  WAITING_CONFIRMATION: { label: "Menunggu konfirmasi", description: "Calon order masuk dari website." },
  CONTACTED: { label: "Customer dihubungi", description: "Admin sedang closing dengan customer." },
  PENDING: { label: "Menunggu konfirmasi", description: "Pesanan lama menunggu konfirmasi admin." },
  CONFIRMED: { label: "Pesanan dikonfirmasi", description: "Detail dan total sudah disepakati." },
  PREPARING: { label: "Sedang disiapkan", description: "Mitra sedang menyiapkan pesanan." },
  READY: { label: "Siap diambil", description: "Pesanan siap dijemput driver." },
  DELIVERING: { label: "Sedang diantar", description: "Driver sedang menuju alamat customer." },
  COMPLETED: { label: "Pesanan selesai", description: "Pesanan sudah diterima customer." },
  CANCELLED: { label: "Dibatalkan", description: "Pesanan dibatalkan." },
};

const workflowLanes = [
  {
    actor: "Customer",
    tone: "emerald",
    steps: [
      { number: 1, label: "Kirim pesanan", detail: "Order masuk" },
      { number: 3, label: "Konfirmasi menu & ongkir", detail: "Revisi bila perlu" },
      { number: 4, label: "Pembayaran", detail: "QRIS / transfer" },
      { number: 9, label: "Terima pesanan", detail: "Order selesai" },
    ],
  },
  {
    actor: "Mitra",
    tone: "amber",
    steps: [
      { number: 2, label: "Cek menu", detail: "Hubungi mitra" },
      { number: 5, label: "Siapkan", detail: "Mulai masak" },
      { number: 7, label: "Pickup ready", detail: "Siap diambil" },
    ],
  },
  {
    actor: "Driver",
    tone: "purple",
    steps: [
      { number: 6, label: "Pilih driver", detail: "Driver menerima" },
      { number: 8, label: "Antar pesanan", detail: "Menuju customer" },
    ],
  },
] as const;

function completedWorkflowSteps(order: Order) {
  const completed = new Set<number>([1]);
  if (["ACCEPTED", "PREPARING", "READY"].includes(order.merchantStatus)) completed.add(2);
  if (["CONTACTED", "CONFIRMED", "PREPARING", "READY", "DELIVERING", "COMPLETED"].includes(order.status)) completed.add(3);
  if (order.paymentStatus === "PAID") completed.add(4);
  if (["PREPARING", "READY", "DELIVERING", "COMPLETED"].includes(order.status)) completed.add(5);
  if (order.driverId) completed.add(6);
  if (["READY", "DELIVERING", "COMPLETED"].includes(order.status)) completed.add(7);
  if (["DELIVERING", "COMPLETED"].includes(order.status)) completed.add(8);
  if (order.status === "COMPLETED") completed.add(9);
  return completed;
}

function adminFocus(order: Order) {
  if (order.status === "CANCELLED") {
    return { step: 0, title: "Order sudah ditutup", detail: "Tidak ada tindakan lanjutan untuk order ini." };
  }
  if (order.status === "COMPLETED") {
    return { step: 9, title: "Closing selesai", detail: "Nilai pembayaran mitra, komisi driver, dan pendapatan Sharelok sudah dikunci di laporan harian." };
  }
  if (!["ACCEPTED", "PREPARING", "READY"].includes(order.merchantStatus)) {
    return { step: 2, title: order.merchantStatus === "CONTACTED" ? "Konfirmasi hasil cek menu" : "Hubungi mitra untuk cek menu", detail: "Pastikan semua menu tersedia dan minta estimasi waktu selesai." };
  }
  if (!["CONTACTED", "CONFIRMED", "PREPARING", "READY", "DELIVERING"].includes(order.status)) {
    return { step: 3, title: "Konfirmasi menu dan ongkir", detail: "Edit menu bila diperlukan, isi ongkir, lalu kirim total dan instruksi pembayaran." };
  }
  if (order.paymentStatus !== "PAID") {
    return { step: 4, title: "Verifikasi pembayaran", detail: "Cek dana masuk, pilih QRIS atau transfer bank, lalu tandai lunas." };
  }
  if (order.status === "CONFIRMED") {
    return { step: 5, title: "Minta mitra mulai menyiapkan", detail: "Mitra mulai memasak setelah pembayaran aman." };
  }
  if (["PREPARING", "READY"].includes(order.status) && !order.driverId) {
    const offered = order.driverAssignments?.some((item) => item.status === "OFFERED");
    return offered
      ? { step: 6, title: "Tunggu respons driver", detail: "Catat Terima atau Tolak pada penawaran driver yang masih aktif." }
      : { step: 6, title: "Pilih driver", detail: "Pilih driver sebelum pesanan dinyatakan pickup ready." };
  }
  if (order.status === "PREPARING") {
    return { step: 7, title: "Tandai pickup ready", detail: "Driver sudah dipilih. Tandai ketika pesanan siap diambil." };
  }
  if (order.status === "READY") {
    return { step: 8, title: "Mulai pengantaran", detail: "Pastikan driver sudah mengambil pesanan, lalu mulai pengantaran." };
  }
  return { step: 9, title: "Konfirmasi pesanan diterima", detail: "Setelah customer menerima pesanan, selesaikan order untuk mencatat closing." };
}

function whatsappNumber(value?: string) {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function formatOrderDateTime(value: string) {
  return `${new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value))} WIB`;
}

function openExternal(url: string) {
  const opened = window.open(url, "_blank");
  if (opened) opened.opener = null;
  else window.location.assign(url);
}

function whatsappUrl(phone: string | undefined, message: string) {
  const number = whatsappNumber(phone);
  if (!number) return "";
  const params = new URLSearchParams({ phone: number, text: message, type: "phone_number", app_absent: "0" });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

function openWhatsApp(phone: string | undefined, message: string) {
  const url = whatsappUrl(phone, message);
  if (!url) return false;
  openExternal(url);
  return true;
}

function trackingPath(order: Pick<Order, "trackingToken">) {
  return `/sharelok/pesanan/${encodeURIComponent(order.trackingToken)}`;
}

function trackingUrl(order: Pick<Order, "trackingToken">) {
  return `${window.location.origin}${trackingPath(order)}`;
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.3-4.2a8.5 8.5 0 1 1 15.7-4.6Z" />
      <path d="M8.2 7.8c.2-.5.5-.5.8-.5h.4l1 2.2c.1.3 0 .5-.2.7l-.7.8c.8 1.6 2 2.8 3.6 3.5l.8-1c.2-.2.4-.3.7-.2l2.1 1c.3.1.4.4.3.7-.3 1.3-1.3 2-2.6 2-3.8 0-7.5-3.6-7.5-7.4 0-.7.4-1.4 1.3-1.8Z" />
    </svg>
  );
}

export default function AdminOrdersPage() {
  const { notify } = useAppAlert();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [editingItems, setEditingItems] = useState<EditableOrderItem[] | null>(null);

  // Driver assign modal
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pricingForm, setPricingForm] = useState<{ deliveryFee: number | ""; paymentMethod: string }>({
    deliveryFee: "",
    paymentMethod: "",
  });

  async function fetchOrderDetail(orderId: string) {
    const response = await fetch(`/api/sharelok/orders/${orderId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Gagal memuat detail pesanan");
    return data as Order;
  }

  async function openOrderDetails(order: Order) {
    setDetailLoadingId(order.id);
    setActionError("");
    try {
      const detail = await fetchOrderDetail(order.id);
      setSelectedOrder(detail);
      setPricingForm({
        deliveryFee: Number(detail.deliveryFee || 0) > 0 ? Number(detail.deliveryFee) : "",
        paymentMethod: detail.paymentMethod && detail.paymentMethod !== "Belum disepakati" ? detail.paymentMethod : "",
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal memuat detail pesanan");
    } finally {
      setDetailLoadingId(null);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedStatus !== "ALL") q.set("status", selectedStatus);
      if (search) q.set("search", search);

      const [resOrders, resDrivers, resProducts, refreshedDetail] = await Promise.all([
        fetch(`/api/sharelok/orders?${q.toString()}`),
        drivers.length === 0 ? fetch("/api/sharelok/drivers") : Promise.resolve(null),
        products.length === 0 ? fetch("/api/sharelok/products") : Promise.resolve(null),
        selectedOrder ? fetchOrderDetail(selectedOrder.id) : Promise.resolve(null),
      ]);

      const dataOrders = await resOrders.json();
      const dataDrivers = resDrivers ? await resDrivers.json() : null;
      const dataProducts = resProducts ? await resProducts.json() : null;

      setOrders(Array.isArray(dataOrders) ? dataOrders : []);
      if (Array.isArray(dataDrivers)) setDrivers(dataDrivers);
      if (Array.isArray(dataProducts)) setProducts(dataProducts);
      if (refreshedDetail) setSelectedOrder(refreshedDetail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) return loadData(); });
    return () => { active = false; };
    // The list intentionally reloads only when the selected status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadData();
  }

  function openDeleteConfirmation(order: Order) {
    setDeletingOrder(order);
    setDeleteConfirmation("");
    setActionError("");
  }

  async function handleDeleteOrder() {
    if (!deletingOrder || deleteConfirmation !== deletingOrder.orderNumber) return;
    setIsSubmitting(true);
    setActionError("");
    try {
      const response = await fetch(`/api/sharelok/orders/${deletingOrder.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmOrderNumber: deleteConfirmation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus pesanan");
      setDeletingOrder(null);
      setSelectedOrder((current) => current?.id === deletingOrder.id ? null : current);
      setDeleteConfirmation("");
      await loadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal menghapus pesanan");
    } finally {
      setIsSubmitting(false);
    }
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

  function handleShareTracking(order: Order) {
    const opened = openWhatsApp(
      order.customerPhone,
      `Halo Kak ${order.customerName} 👋\n\nPantau riwayat dan status pesanan *${order.orderNumber}* melalui link berikut:\n${trackingUrl(order)}\n\nLink ini khusus untuk pesanan Kakak. Mohon tidak dibagikan ke orang lain ya 🙏`
    );
    if (!opened) setActionError("Nomor WhatsApp customer belum tersedia.");
  }

  function orderSummary(order: Order) {
    return (order.items || [])
      .map((item) => `• ${item.productName} x${item.quantity}`)
      .join("\n");
  }

  function openItemEditor(order: Order) {
    if (order.paymentStatus === "PAID") {
      setActionError("Menu tidak dapat diedit setelah pembayaran diverifikasi.");
      return;
    }
    setEditingItems((order.items || []).filter((item) => item.productId).map((item) => ({
      productId: item.productId!,
      productName: item.productName,
      costPrice: item.costPrice,
      price: item.price,
      quantity: item.quantity,
    })));
    setActionError("");
  }

  function addReplacementItem(productId: string) {
    if (!productId || !selectedOrder) return;
    const product = products.find((item) => item.id === productId && item.merchantId === selectedOrder.merchantId);
    if (!product) return;
    setEditingItems((current) => {
      const items = current || [];
      const existing = items.find((item) => item.productId === productId);
      if (existing) return items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...items, { productId: product.id, productName: product.name, costPrice: Number(product.costPrice), price: Number(product.price), quantity: 1 }];
    });
  }

  function changeEditedQuantity(productId: string, delta: number) {
    setEditingItems((current) => (current || [])
      .map((item) => item.productId === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  }

  async function saveEditedItems() {
    if (!selectedOrder || !editingItems?.length) {
      setActionError("Pesanan harus memiliki minimal satu menu.");
      return;
    }
    setIsSubmitting(true);
    setActionError("");
    try {
      const response = await fetch(`/api/sharelok/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: editingItems.map((item) => ({ productId: item.productId, quantity: item.quantity })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan perubahan menu");
      const refreshed = await fetchOrderDetail(selectedOrder.id);
      setSelectedOrder(refreshed);
      setEditingItems(null);
      await loadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal menyimpan perubahan menu");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSavePricing(order: Order) {
    setIsSubmitting(true);
    setActionError("");
    try {
      const response = await fetch(`/api/sharelok/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryFee: Number(pricingForm.deliveryFee),
          paymentStatus: order.paymentStatus === "PAID" ? "PAID" : "PENDING",
        }),
      });
      if (!response.ok) throw new Error("Gagal menyimpan ongkir dan pembayaran");
      await loadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal menyimpan rincian pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendInvoice(order: Order) {
    if (order.merchantStatus !== "ACCEPTED") {
      setActionError("Mitra harus menerima ketersediaan order sebelum total dikonfirmasi ke customer.");
      return;
    }
    const deliveryFee = Number(pricingForm.deliveryFee);
    if (!Number.isFinite(deliveryFee) || deliveryFee <= 0) {
      const message = "Ongkir wajib diisi dan harus lebih dari Rp0 sebelum lanjut ke customer.";
      setActionError(message);
      await notify(message, { title: "Ongkir belum valid", tone: "warning" });
      return;
    }
    const total = order.subtotal + deliveryFee - order.discount;
    openWhatsApp(
      order.customerPhone,
      `Halo Kak ${order.customerName} 👋\nPesanan *${order.orderNumber}* sudah dikonfirmasi.\n\n${orderSummary(order)}\n\nSubtotal: ${fmt(order.subtotal)}\nOngkir: ${fmt(deliveryFee)}\n${order.discount > 0 ? `Promo: -${fmt(order.discount)}\n` : ""}*Total: ${fmt(total)}*\n\nPembayaran tersedia melalui *QRIS* atau *transfer bank*. Nomor rekening dan gambar QRIS kami kirim setelah pesan ini. Setelah bayar, kirim bukti transfer di sini ya 🙏\n\nPantau pesanan:\n${trackingUrl(order)}`
    );
    await handleSavePricing(order);
    if (order.status === "WAITING_CONFIRMATION" || order.status === "PENDING") {
      await handleUpdateStatus(order.id, "CONTACTED", "Rincian menu, total, dan instruksi pembayaran dikirim ke customer");
    }
  }

  async function handleMarkPaid(order: Order) {
    if (!pricingForm.paymentMethod) {
      const message = "Pilih metode pembayaran yang benar-benar digunakan customer sebelum verifikasi.";
      setActionError(message);
      await notify(message, { title: "Metode pembayaran belum dipilih", tone: "warning" });
      return;
    }
    setIsSubmitting(true);
    setActionError("");
    try {
      const response = await fetch(`/api/sharelok/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: pricingForm.paymentMethod, paymentStatus: "PAID" }),
      });
      if (!response.ok) throw new Error("Gagal memperbarui pembayaran");
      await fetch(`/api/sharelok/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED", note: `Pembayaran ${pricingForm.paymentMethod === "QRIS" ? "QRIS" : "transfer bank"} telah diverifikasi admin` }),
      });
      await loadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal memperbarui pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  }

  function nextStepLabel(order: Order) {
    const step = adminFocus(order).step;
    if (step === 2) return order.merchantStatus === "CONTACTED" ? "Next · Menu tersedia" : "Next · Cek menu ke mitra";
    if (step === 3) return "Next · Kirim tagihan & pembayaran";
    if (step === 4) return "Next · Verifikasi pembayaran";
    if (step === 5) return "Next · Hubungi mitra mulai masak";
    if (step === 6) return order.driverAssignments?.some((item) => item.status === "OFFERED") ? "Menunggu jawaban driver" : "Next · Pilih driver";
    if (step === 7) return "Next · Pickup ready";
    if (step === 8) return "Next · Mulai diantar";
    if (step === 9) return "Next · Selesaikan order";
    return "Proses selesai";
  }

  async function handleNextStep(order: Order) {
    const step = adminFocus(order).step;
    setActionError("");
    if (step === 2) return order.merchantStatus === "CONTACTED" ? handleMerchantStatus(order.id, "ACCEPTED") : handleContactMerchant(order);
    if (step === 3) {
      const deliveryFee = Number(pricingForm.deliveryFee);
      if (!Number.isFinite(deliveryFee) || deliveryFee <= 0) {
        const message = "Ongkir wajib diisi dan harus lebih dari Rp0 sebelum menekan Next.";
        setActionError(message);
        await notify(message, { title: "Ongkir belum valid", tone: "warning" });
        return;
      }
      return handleSendInvoice(order);
    }
    if (step === 4) return handleMarkPaid(order);
    if (step === 5) return handleStartPreparing(order);
    if (step === 6) {
      if (order.driverAssignments?.some((item) => item.status === "OFFERED")) return;
      setAssigningOrder(order); setSelectedDriverId(""); setActionError("");
      return;
    }
    if (step === 7) return handleMerchantStatus(order.id, "READY");
    if (step === 8) return handleUpdateStatus(order.id, "DELIVERING", "Driver mulai mengantar pesanan");
    if (step === 9) return handleUpdateStatus(order.id, "COMPLETED", "Pesanan telah diterima customer");
  }

  async function handleMerchantStatus(orderId: string, merchantStatus: string) {
    const order = selectedOrder?.id === orderId ? selectedOrder : orders.find((item) => item.id === orderId);
    if (
      merchantStatus === "PREPARING" &&
      order &&
      order.paymentStatus !== "PAID"
    ) {
      setActionError("Pembayaran harus lunas sebelum mitra diminta mulai menyiapkan pesanan.");
      return;
    }
    setIsSubmitting(true);
    setActionError("");
    try {
      await fetch(`/api/sharelok/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantStatus }),
      });
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartPreparing(order: Order) {
    if (order.paymentStatus !== "PAID") {
      setActionError("Pembayaran harus diverifikasi sebelum mitra diminta mulai memasak.");
      return;
    }
    openWhatsApp(
      order.merchant?.whatsapp || order.merchant?.phone,
      `Halo Kak 👋 Pembayaran order *${order.orderNumber}* sudah terverifikasi.\n\n${orderSummary(order)}\n\nSilakan mulai disiapkan. Kabari kami jika pesanan sudah siap dijemput ya 🙏`
    );
    await handleMerchantStatus(order.id, "PREPARING");
  }

  async function handleContactMerchant(order: Order) {
    openWhatsApp(
      order.merchant?.whatsapp || order.merchant?.phone,
      `Halo Kak 👋 Ada order baru Sharelok\n*${order.orderNumber}*\n\n${orderSummary(order)}\n${order.customerNote ? `\nCatatan: ${order.customerNote}` : ""}\n\nTersedia? Balas *TERIMA* + estimasi waktu siap ya 🙏`
    );
    await handleMerchantStatus(order.id, "CONTACTED");
  }

  async function handleDriverResponse(orderId: string, assignmentId: string, assignmentStatus: "ACCEPTED" | "REJECTED") {
    setIsSubmitting(true);
    setActionError("");
    try {
      const response = await fetch(`/api/sharelok/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, assignmentStatus }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Gagal memperbarui respons driver");
      }
      await loadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal memperbarui respons driver");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAssignDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!assigningOrder || !selectedDriverId) return;

    setIsSubmitting(true);
    setActionError("");
    try {
      if (assigningOrder.paymentStatus !== "PAID") {
        throw new Error("Pembayaran harus lunas sebelum order ditawarkan ke driver.");
      }
      if (!["PREPARING", "READY"].includes(assigningOrder.status)) {
        throw new Error("Order baru dapat ditawarkan ke driver saat sedang disiapkan atau sudah siap.");
      }
      const driver = drivers.find((item) => item.id === selectedDriverId);
      if (!driver?.isActive) throw new Error("Pilih driver aktif terlebih dahulu.");
      openWhatsApp(
        driver?.whatsapp || driver?.phone,
        `Halo Kak ${driver?.name || "Driver"} 👋\nAda order antar *${assigningOrder.orderNumber}*\n\n📍 Ambil: ${assigningOrder.merchant?.name || "Mitra Sharelok"}\n🏠 Antar: ${assigningOrder.customerAddress}\n🛵 Komisi antar: *${fmt(Math.floor(assigningOrder.deliveryFee * (driver?.commissionPercent ?? 0) / 100))}*\n\nBalas *SIAP* jika bisa ambil ya.`
      );
      const response = await fetch(`/api/sharelok/orders/${assigningOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: selectedDriverId,
          driverAction: "OFFER",
          reason: assignReason || "Penawaran pengantaran via WhatsApp",
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Gagal mencatat penawaran driver");
      }
      setAssigningOrder(null);
      setSelectedDriverId("");
      setAssignReason("");
      await loadData();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Gagal menawarkan order ke driver");
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
                      <div className="text-[11px] text-zinc-400">{formatOrderDateTime(order.createdAt)}</div>
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
                        <span className="text-[11px] font-medium text-zinc-400">Belum dipilih</span>
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
                        onClick={() => openOrderDetails(order)}
                        disabled={detailLoadingId === order.id}
                        className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-200 transition"
                      >
                        {detailLoadingId === order.id ? "Memuat..." : "Detail"}
                      </button>

                      {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                        <button
                          onClick={() => openOrderDetails(order)}
                          disabled={detailLoadingId === order.id}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          {detailLoadingId === order.id ? "Memuat..." : "Proses order"}
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteConfirmation(order)}
                        aria-label={`Hapus ${order.orderNumber}`}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
              <div className="flex items-center gap-2">
                <a
                  href={trackingPath(selectedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Halaman customer
                </a>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {actionError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {actionError}
              </div>
            )}

            {(() => {
              const completed = completedWorkflowSteps(selectedOrder);
              const currentStep = [2, 3, 4, 5, 6, 7, 8, 9].find((number) => !completed.has(number));
              const focus = adminFocus(selectedOrder);
              const toneClasses = {
                emerald: { label: "bg-emerald-100 text-emerald-800", active: "border-emerald-500 bg-emerald-50 text-emerald-950", done: "border-emerald-200 bg-emerald-50/60 text-emerald-800" },
                amber: { label: "bg-amber-100 text-amber-800", active: "border-amber-500 bg-amber-50 text-amber-950", done: "border-amber-200 bg-amber-50/60 text-amber-800" },
                purple: { label: "bg-purple-100 text-purple-800", active: "border-purple-500 bg-purple-50 text-purple-950", done: "border-purple-200 bg-purple-50/60 text-purple-800" },
              } as const;
              return (
                <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 bg-emerald-50 px-4 py-3"><div><div className="flex items-center gap-2"><h4 className="text-sm font-black text-emerald-950">Tahap {focus.step || "-"} · {focus.title}</h4><span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold ${statusBadgeColor[selectedOrder.status] || "bg-zinc-100 text-zinc-700"}`}>{statusMeta[selectedOrder.status]?.label || selectedOrder.status}</span></div><p className="mt-1 text-[10px] text-emerald-800">{focus.detail}</p></div><span className="rounded-lg bg-white px-2.5 py-1.5 text-[9px] font-semibold text-zinc-500">Semua update masuk riwayat</span></div>
                  <div className="overflow-x-auto p-3">
                    <div className="min-w-[850px] space-y-2">
                      {workflowLanes.map((lane) => {
                        const tone = toneClasses[lane.tone];
                        return <div key={lane.actor} className="grid grid-cols-[92px_repeat(9,minmax(76px,1fr))] items-stretch gap-1.5"><div className={`flex items-center justify-center rounded-xl px-2 text-xs font-black ${tone.label}`}>{lane.actor}</div>{Array.from({ length: 9 }, (_, index) => {
                          const number = index + 1;
                          const step = lane.steps.find((item) => item.number === number);
                          if (!step) return <div key={number} className="min-h-16 rounded-lg bg-zinc-50/60" />;
                          const done = completed.has(number);
                          const active = currentStep === number && selectedOrder.status !== "CANCELLED";
                          return <div key={number} className={`relative min-h-16 rounded-xl border p-2 ${active ? `${tone.active} ring-2 ring-offset-1` : done ? tone.done : "border-zinc-200 bg-white text-zinc-400"}`}><span className={`absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black ${done ? "bg-zinc-900 text-white" : active ? "bg-white text-zinc-900 ring-2 ring-current" : "bg-zinc-200 text-zinc-500"}`}>{done ? "✓" : number}</span><div className="mt-1 text-[10px] font-black leading-tight">{step.label}</div><div className="mt-1 text-[8px] leading-tight opacity-70">{step.detail}</div></div>;
                        })}</div>;
                      })}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50 px-4 py-3"><button onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED", "Pesanan dibatalkan oleh admin")} disabled={isSubmitting || ["COMPLETED", "CANCELLED"].includes(selectedOrder.status)} className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 disabled:hidden">Batalkan</button>{(() => { const usesWhatsApp = (focus.step === 2 && selectedOrder.merchantStatus !== "CONTACTED") || focus.step === 3 || focus.step === 5; return <button onClick={() => handleNextStep(selectedOrder)} disabled={isSubmitting || ["COMPLETED", "CANCELLED"].includes(selectedOrder.status) || (focus.step === 6 && Boolean(selectedOrder.driverAssignments?.some((item) => item.status === "OFFERED")))} className={`ml-auto inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${usesWhatsApp ? "bg-[#25D366] hover:bg-[#20bd5a]" : "bg-zinc-950 hover:bg-zinc-800"}`}>{usesWhatsApp && <WhatsAppIcon className="h-4 w-4" />}{isSubmitting ? "Memproses..." : nextStepLabel(selectedOrder)} →</button>; })()}</div>
                </section>
              );
            })()}

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <User className="h-4 w-4 text-emerald-600" /> Pelanggan
                </div>
                <div className="text-sm font-semibold text-zinc-900">{selectedOrder.customerName}</div>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><MapPin className="h-3 w-3" /> Area {selectedOrder.area?.name || "Belum diatur"}</div>
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
                  <Store className="h-4 w-4 text-emerald-600" /> Mitra
                </div>
                <div className="text-xs">
                  <span className="text-zinc-400">Merchant:</span>{" "}
                  <span className="font-semibold text-zinc-800">{selectedOrder.merchant?.name || "-"}</span>
                </div>
                <div className="text-xs"><span className="text-zinc-400">Status mitra:</span> <span className="font-semibold text-zinc-800">{selectedOrder.merchantStatus}</span></div>
                <p className="mt-2 text-[10px] text-zinc-400">Aksi mitra mengikuti tombol Next pada alur pesanan.</p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-800"><Bike className="h-4 w-4 text-emerald-600" /> Driver</div>
                  <p className="mt-1 text-xs text-zinc-500">{selectedOrder.driver ? `${selectedOrder.driver.name} (${selectedOrder.driver.vehiclePlate || "Motor"})` : "Belum ada driver yang menerima"}</p>
                  {selectedOrder.driver && (
                    <p className="mt-1 text-[11px] font-semibold text-purple-700">
                      Komisi {selectedOrder.driver.commissionPercent ?? 0}% × {fmt(selectedOrder.deliveryFee)} = {fmt(Math.floor(selectedOrder.deliveryFee * (selectedOrder.driver.commissionPercent ?? 0) / 100))}
                    </p>
                  )}
                </div>
                <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[10px] font-semibold text-zinc-500">Dipilih pada tahap 6</span>
              </div>
              {selectedOrder.driverAssignments && selectedOrder.driverAssignments.length > 0 && (
                <div className="space-y-2 border-t border-zinc-100 pt-3">
                  {selectedOrder.driverAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs">
                      <div><span className="font-semibold text-zinc-800">{assignment.driver?.name || "Driver"}</span><span className="ml-2 text-zinc-500">{assignment.status}</span></div>
                      {assignment.status === "OFFERED" && (
                        <div className="flex gap-1">
                          <button onClick={() => handleDriverResponse(selectedOrder.id, assignment.id, "ACCEPTED")} className="rounded-md bg-emerald-600 px-2 py-1 font-bold text-white">Terima</button>
                          <button onClick={() => handleDriverResponse(selectedOrder.id, assignment.id, "REJECTED")} className="rounded-md bg-red-50 px-2 py-1 font-bold text-red-700">Tolak</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div><h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Item Makanan Dipesan</h4><p className="mt-1 text-[10px] text-zinc-500">Jika ada menu kosong, edit sesuai persetujuan customer sebelum mengirim tagihan.</p></div>
                <button type="button" onClick={() => openItemEditor(selectedOrder)} disabled={selectedOrder.paymentStatus === "PAID" || ["PREPARING", "READY", "DELIVERING", "COMPLETED", "CANCELLED"].includes(selectedOrder.status)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-[10px] font-black text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"><Pencil className="h-3.5 w-3.5" />Edit menu</button>
              </div>
              <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <div className="font-bold text-zinc-900">{item.productName}</div>
                        <div className="text-zinc-400">
                          Jual {fmt(item.price)} · HPP {fmt(item.costPrice)} · {item.quantity} item
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-zinc-800">{fmt(item.subtotal)}</div>
                        <div className="text-[10px] font-semibold text-blue-700">Margin {fmt((item.price - item.costPrice) * item.quantity)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-zinc-400">Tidak ada rincian item.</div>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-zinc-900">Ongkir & Pembayaran</h4>
                  <p className="mt-0.5 text-[11px] text-zinc-500">Tetapkan total setelah mitra memastikan menu tersedia.</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${selectedOrder.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {selectedOrder.paymentStatus === "PAID" ? "LUNAS" : "BELUM LUNAS"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="space-y-1 text-[11px] font-semibold text-zinc-600">
                  <span>Ongkir</span>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    placeholder="Masukkan nominal ongkir"
                    value={pricingForm.deliveryFee}
                    onChange={(event) => {
                      const value = event.target.value;
                      setPricingForm({ ...pricingForm, deliveryFee: value === "" ? "" : Number(value) });
                      if (Number(value) > 0) setActionError("");
                    }}
                    className={`w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-zinc-900 focus:outline-none ${Number(pricingForm.deliveryFee) <= 0 ? "border-red-300 focus:border-red-500" : "border-zinc-200 focus:border-emerald-500"}`}
                  />
                  {Number(pricingForm.deliveryFee) <= 0 && <span className="block text-[9px] font-semibold text-red-600">Wajib diisi sebelum Next</span>}
                </label>
                <label className="space-y-1 text-[11px] font-semibold text-zinc-600">
                  <span>Metode yang sudah dibayar</span>
                  <select value={pricingForm.paymentMethod} onChange={(event) => setPricingForm({ ...pricingForm, paymentMethod: event.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none">
                    <option value="">Pilih setelah cek pembayaran</option>
                    <option value="QRIS">QRIS</option>
                    <option value="BANK_TRANSFER">Transfer Bank</option>
                  </select>
                </label>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Pilih nominal cepat</span>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                  {[10000, 12000, 15000, 18000, 20000].map((amount) => {
                    const isSelected = Number(pricingForm.deliveryFee) === amount;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setPricingForm({ ...pricingForm, deliveryFee: amount });
                          setActionError("");
                        }}
                        className={`rounded-lg border px-2 py-2 text-[10px] font-extrabold transition-colors ${isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"}`}
                      >
                        {fmt(amount)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] font-semibold text-blue-700">Isi ongkir lalu kirim tagihan. Setelah customer mengirim bukti dan dana sudah dicek, pilih metode yang digunakan lalu tekan Verifikasi pembayaran.</div>
              <div className="border-t border-zinc-200 pt-3" />
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
              {selectedOrder.promoCode && <div className="flex justify-between text-[10px] text-emerald-700"><span>Kode promo</span><span className="font-bold">{selectedOrder.promoCode}</span></div>}
              <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-extrabold text-zinc-900">
                <span>Total Pembayaran:</span>
                <span className="text-emerald-700">{fmt(selectedOrder.total)}</span>
              </div>
              <div className="flex justify-between font-semibold text-blue-700">
                <span>Estimasi margin menu:</span>
                <span>{fmt((selectedOrder.items || []).reduce((sum, item) => sum + (item.price - item.costPrice) * item.quantity, 0))}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 space-y-1.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">Estimasi pembagian saat closing</div>
                <div className="flex justify-between text-amber-700"><span>Bayar ke mitra (total HPP)</span><span className="font-bold">{fmt((selectedOrder.items || []).reduce((sum, item) => sum + item.costPrice * item.quantity, 0))}</span></div>
                <div className="flex justify-between text-purple-700"><span>Komisi driver</span><span className="font-bold">{fmt(selectedOrder.driver ? Math.floor(selectedOrder.deliveryFee * (selectedOrder.driver.commissionPercent ?? 0) / 100) : 0)}</span></div>
                <div className="flex justify-between border-t border-zinc-100 pt-1.5 text-emerald-700"><span>Pendapatan Sharelok</span><span className="font-extrabold">{fmt(Math.max(0, selectedOrder.subtotal - (selectedOrder.items || []).reduce((sum, item) => sum + item.costPrice * item.quantity, 0) + selectedOrder.deliveryFee - (selectedOrder.driver ? Math.floor(selectedOrder.deliveryFee * (selectedOrder.driver.commissionPercent ?? 0) / 100) : 0) - selectedOrder.discount))}</span></div>
              </div>
              <div className="text-[11px] text-zinc-500 pt-1">
                Metode Pembayaran: <span className="font-semibold text-zinc-700">{selectedOrder.paymentMethod || "Belum ditentukan"}</span>
              </div>
            </div>

            {/* Status history is the single source for customer updates. */}
            <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50 px-4 py-3">
                <div><h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">Riwayat Status Pesanan</h4><p className="mt-0.5 text-[10px] text-emerald-700">Catatan perubahan status tersimpan otomatis dari alur pesanan.</p></div>
                <button onClick={() => handleShareTracking(selectedOrder)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"><WhatsAppIcon className="h-4 w-4" /> Bagikan link riwayat</button>
              </div>
              <div className="space-y-0 p-4 text-xs">
                {selectedOrder.statusHistory?.length ? selectedOrder.statusHistory.map((history, index) => (
                  <div key={history.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {index < selectedOrder.statusHistory!.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-emerald-200" />}
                    <span className={`relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-full border-4 ${index === 0 ? "border-emerald-200 bg-emerald-600" : "border-zinc-200 bg-white"}`} />
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-black text-zinc-900">{statusMeta[history.status]?.label || history.status}</span>{index === 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-black text-emerald-700">TERBARU</span>}<span className="ml-auto text-[9px] text-zinc-400">{formatOrderDateTime(history.createdAt)}</span></div><p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{history.note || statusMeta[history.status]?.description}</p></div>
                  </div>
                )) : <div className="py-5 text-center text-xs text-zinc-400">Belum ada riwayat status.</div>}
              </div>
            </section>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div>
                <div className="text-xs font-bold text-red-900">Zona berbahaya</div>
                <div className="mt-0.5 text-[11px] text-red-700">Hapus pesanan beserta item, riwayat status, dan penawaran driver.</div>
              </div>
              <button onClick={() => openDeleteConfirmation(selectedOrder)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700">
                <Trash2 className="h-3.5 w-3.5" /> Hapus pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && editingItems && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Revisi Pesanan</p><h3 className="mt-1 text-lg font-black text-zinc-900">Edit menu {selectedOrder.orderNumber}</h3><p className="mt-1 text-xs text-zinc-500">Hapus menu kosong, ubah jumlah, atau tambahkan menu pengganti dari mitra yang sama.</p></div>
              <button type="button" onClick={() => setEditingItems(null)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-4 space-y-2">
              {editingItems.map((item) => <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3">
                <div className="min-w-0 flex-1"><div className="truncate text-xs font-black text-zinc-900">{item.productName}</div><div className="mt-0.5 text-[10px] text-zinc-500">{fmt(item.price)} per item</div></div>
                <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
                  <button type="button" onClick={() => changeEditedQuantity(item.productId, -1)} aria-label={`Kurangi ${item.productName}`} className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-zinc-700 shadow-sm"><Minus className="h-3.5 w-3.5" /></button>
                  <strong className="w-8 text-center text-xs">{item.quantity}</strong>
                  <button type="button" onClick={() => changeEditedQuantity(item.productId, 1)} aria-label={`Tambah ${item.productName}`} className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <strong className="w-24 text-right text-xs text-emerald-700">{fmt(item.price * item.quantity)}</strong>
              </div>)}
              {!editingItems.length && <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-5 text-center text-xs font-semibold text-red-700">Semua menu terhapus. Tambahkan minimal satu menu pengganti.</div>}
            </div>

            <label className="mt-4 block text-xs font-bold text-zinc-700">Tambah menu pengganti
              <select value="" onChange={(event) => addReplacementItem(event.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-800 outline-none focus:border-orange-400">
                <option value="">Pilih menu dari {selectedOrder.merchant?.name || "mitra"}</option>
                {products.filter((product) => product.merchantId === selectedOrder.merchantId && product.isAvailable && !editingItems.some((item) => item.productId === product.id)).map((product) => <option key={product.id} value={product.id}>{product.name} — {fmt(Number(product.price))}</option>)}
              </select>
            </label>

            <div className="mt-4 rounded-xl bg-zinc-950 p-4 text-white"><div className="flex items-center justify-between text-xs"><span>Subtotal baru</span><strong className="text-base text-orange-300">{fmt(editingItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</strong></div><p className="mt-1 text-[10px] text-white/60">Promo dan total akhir akan dihitung ulang saat disimpan.</p></div>
            {actionError && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{actionError}</div>}
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditingItems(null)} disabled={isSubmitting} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600">Batal</button><button type="button" onClick={saveEditedItems} disabled={isSubmitting || editingItems.length === 0} className="rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-black text-white hover:bg-orange-700 disabled:opacity-40">{isSubmitting ? "Menyimpan..." : "Simpan & hitung ulang"}</button></div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN DRIVER */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">
                Tawarkan ke Driver ({assigningOrder.orderNumber})
              </h3>
              <button
                onClick={() => setAssigningOrder(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignDriver} className="space-y-4 text-xs">
              {actionError && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-700">{actionError}</div>}
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
                  {drivers.filter((d) => d.isActive && d.areaId === assigningOrder.areaId).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.vehiclePlate || "Motor"}) {d.isActive ? "🟢 Siaga" : "⚪ Nonaktif"}
                    </option>
                  ))}
                </select>
                {!drivers.some((driver) => driver.isActive && driver.areaId === assigningOrder.areaId) && <p className="mt-2 text-[11px] font-semibold text-amber-700">Belum ada driver aktif untuk area {assigningOrder.area?.name || "pesanan ini"}.</p>}
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Catatan Penawaran:
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
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 font-bold text-white hover:bg-[#20bd5a] disabled:opacity-50"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Buka WhatsApp & Catat Penawaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-black text-zinc-900">Hapus pesanan permanen?</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">
              Pesanan <strong>{deletingOrder.orderNumber}</strong>, item, riwayat status, dan data penawaran driver akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <label className="mt-5 block text-xs font-semibold text-zinc-700">
              Ketik <span className="select-all font-mono font-black text-red-700">{deletingOrder.orderNumber}</span> untuk verifikasi
              <input
                autoFocus
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder={deletingOrder.orderNumber}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 font-mono text-sm text-zinc-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>
            {actionError && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{actionError}</div>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setDeletingOrder(null); setDeleteConfirmation(""); setActionError(""); }} disabled={isSubmitting} className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50">Batal</button>
              <button onClick={handleDeleteOrder} disabled={isSubmitting || deleteConfirmation !== deletingOrder.orderNumber} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">
                <Trash2 className="h-3.5 w-3.5" /> {isSubmitting ? "Menghapus..." : "Hapus permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
