"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Search,
} from "lucide-react";
import { Product, Merchant, Category } from "@/db/schema";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { useAppAlert } from "@/components/ui/app-alert";

interface ProductWithRelations extends Product {
  merchant?: Merchant | null;
  category?: Category | null;
}

function fmt(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

const homepageBadgeOptions = ["Menu Baru", "Paling Laris", "Favorit", "Rekomendasi", "Promo"];
const homepageBadgeColors = [
  { value: "orange", label: "Oranye", className: "bg-orange-500 ring-orange-200" },
  { value: "red", label: "Merah", className: "bg-red-500 ring-red-200" },
  { value: "green", label: "Hijau", className: "bg-emerald-500 ring-emerald-200" },
  { value: "blue", label: "Biru", className: "bg-blue-500 ring-blue-200" },
  { value: "purple", label: "Ungu", className: "bg-purple-500 ring-purple-200" },
  { value: "dark", label: "Gelap", className: "bg-zinc-800 ring-zinc-300" },
];

export default function AdminProductsPage() {
  const { ask, notify } = useAppAlert();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    merchantId: "",
    categoryId: "",
    description: "",
    costPrice: 10000,
    price: 15000,
    imageUrl: "",
    sortOrder: 0,
    isAvailable: true,
    showOnHomepage: false,
    homepagePosition: 1,
    homepageBadge: "Menu Baru",
    homepageBadgeColor: "green",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [resProd, resMerch, resCat] = await Promise.all([
        fetch("/api/sharelok/products"),
        fetch("/api/sharelok/merchants"),
        fetch("/api/sharelok/categories"),
      ]);
      const dataProd = await resProd.json();
      const dataMerch = await resMerch.json();
      const dataCat = await resCat.json();

      setProducts(Array.isArray(dataProd) ? dataProd : []);
      setMerchants(Array.isArray(dataMerch) ? dataMerch : []);
      setCategories(Array.isArray(dataCat) ? dataCat : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/sharelok/products"),
      fetch("/api/sharelok/merchants"),
      fetch("/api/sharelok/categories"),
    ]).then(async ([resProd, resMerch, resCat]) => {
      const [dataProd, dataMerch, dataCat] = await Promise.all([resProd.json(), resMerch.json(), resCat.json()]);
      if (!active) return;
      setProducts(Array.isArray(dataProd) ? dataProd : []);
      setMerchants(Array.isArray(dataMerch) ? dataMerch : []);
      setCategories(Array.isArray(dataCat) ? dataCat : []);
    }).catch(console.error).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  function handleOpenAdd() {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      merchantId: merchants[0]?.id || "",
      categoryId: categories[0]?.id || "",
      description: "",
      costPrice: 12000,
      price: 20000,
      imageUrl: "",
      sortOrder: products.length + 1,
      isAvailable: true,
      showOnHomepage: false,
      homepagePosition: 1,
      homepageBadge: "Menu Baru",
      homepageBadgeColor: "green",
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(p: ProductWithRelations) {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      slug: p.slug,
      merchantId: p.merchantId,
      categoryId: p.categoryId || "",
      description: p.description || "",
      costPrice: p.costPrice,
      price: p.price,
      imageUrl: p.imageUrl || "",
      sortOrder: p.sortOrder,
      isAvailable: p.isAvailable,
      showOnHomepage: p.showOnHomepage,
      homepagePosition: p.homepagePosition || 1,
      homepageBadge: p.homepageBadge || "Menu Baru",
      homepageBadgeColor: p.homepageBadgeColor || "orange",
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.merchantId) {
      await notify("Pilih merchant terlebih dahulu sebelum menyimpan menu.", { title: "Merchant belum dipilih", tone: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      let response: Response;
      if (editingId) {
        response = await fetch("/api/sharelok/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
      } else {
        response = await fetch("/api/sharelok/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan menu");
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      await notify(e instanceof Error ? e.message : "Gagal menyimpan menu", { title: "Menu belum tersimpan", tone: "danger", confirmLabel: "Coba lagi" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!await ask("Menu ini akan dihapus permanen dari daftar produk.", { title: "Hapus menu?", tone: "danger", confirmLabel: "Ya, hapus" })) return;
    try {
      await fetch(`/api/sharelok/products?id=${id}`, { method: "DELETE" });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleAvailable(p: ProductWithRelations) {
    try {
      await fetch("/api/sharelok/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, isAvailable: !p.isAvailable }),
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.merchant?.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    );
  });
  const homepageConflict = formData.showOnHomepage
    ? products.find((product) => product.id !== editingId && product.showOnHomepage && product.homepagePosition === formData.homepagePosition)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
            Katalog Produk & Menu
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Daftar kuliner yang dapat dipesan pelanggan di aplikasi Sharelok.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            Tambah Menu
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari nama menu makanan, nama merchant, atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-900 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5">Menu Makanan</th>
                <th className="px-4 py-3.5">Merchant</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">HPP</th>
                <th className="px-4 py-3.5">Harga Jual</th>
                <th className="px-4 py-3.5">Margin</th>
                <th className="px-4 py-3.5">Ketersediaan</th>
                <th className="px-4 py-3.5">Beranda</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-zinc-400">
                    <UtensilsCrossed className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                    Belum ada data menu kuliner.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 shrink-0 rounded-xl border border-zinc-200 object-cover object-center"
                            style={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold" style={{ width: 40, height: 40 }}>
                            <UtensilsCrossed className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-zinc-900">{p.name}</div>
                          <div className="max-w-xs truncate text-[11px] text-zinc-400">
                            {p.description || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-zinc-800">
                      {p.merchant?.name || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                        {p.category?.name || "Umum"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-600">
                      {fmt(p.costPrice)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      {fmt(p.price)}
                    </td>
                    <td className={`px-4 py-3.5 font-bold ${p.price - p.costPrice >= 0 ? "text-blue-700" : "text-red-700"}`}>
                      {fmt(p.price - p.costPrice)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleAvailable(p)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                          p.isAvailable
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        }`}
                      >
                        {p.isAvailable ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Tersedia
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-rose-600" /> Habis
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.showOnHomepage ? <div className="space-y-1"><span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black text-orange-700">POSISI {p.homepagePosition}</span><div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500"><span className={`h-2.5 w-2.5 rounded-full ${homepageBadgeColors.find((color) => color.value === p.homepageBadgeColor)?.className.split(" ")[0] || "bg-orange-500"}`} />{p.homepageBadge}</div></div> : <span className="text-[11px] text-zinc-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">
                {editingId ? "Edit Menu Makanan" : "Tambah Menu Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Nama Menu Kuliner *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Soto Subang Daging Spesial"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    setFormData({
                      ...formData,
                      name,
                      slug: editingId ? formData.slug : slug,
                    });
                  }}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Slug (URL unik) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="soto-subang-spesial"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs font-mono text-zinc-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Mitra Resto / Merchant *
                  </label>
                  <select
                    required
                    value={formData.merchantId}
                    onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Merchant --</option>
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Kategori Menu
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Tanpa Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Harga HPP (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={500}
                    value={formData.costPrice || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Harga Jual Customer (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={500}
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className={`rounded-xl px-3 py-2 text-xs font-semibold ${formData.price - formData.costPrice >= 0 ? "bg-blue-50 text-blue-800" : "bg-red-50 text-red-700"}`}>
                Margin per item: {fmt(formData.price - formData.costPrice)}
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Urutan Sort</label>
                <input
                  type="number"
                  value={formData.sortOrder || ""}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Deskripsi Menu / Komposisi
                </label>
                <textarea
                  rows={2}
                  placeholder="Daging sapi empuk, kuah santan kuning gurih, taburan emping..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <ImageUploadField
                value={formData.imageUrl}
                onChange={(imageUrl) => setFormData((current) => ({ ...current, imageUrl }))}
                folder="jelajah-subang/sharelok/menu"
                label="Foto menu"
                helpText="Gunakan foto persegi agar kartu menu tampil rapi. Maksimal 5 MB."
              />

              <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span><strong className="block text-xs text-zinc-900">Tampilkan di beranda Jelajah Subang</strong><small className="mt-0.5 block leading-5 text-zinc-500">Maksimal tiga menu pilihan ditampilkan pada section Pesan Makanan.</small></span>
                </label>

                {formData.showOnHomepage && <div className="mt-4 space-y-3 border-t border-orange-200 pt-4">
                  <div>
                    <span className="mb-2 block font-semibold text-zinc-700">Posisi kartu</span>
                    <div className="grid grid-cols-3 gap-2">{[1, 2, 3].map((position) => <button key={position} type="button" onClick={() => setFormData({ ...formData, homepagePosition: position })} className={`rounded-xl border px-3 py-2.5 font-black transition ${formData.homepagePosition === position ? "border-orange-500 bg-orange-500 text-white" : "border-orange-200 bg-white text-zinc-600 hover:border-orange-400"}`}>Posisi {position}</button>)}</div>
                  </div>
                  <div>
                    <label htmlFor="homepage-badge" className="mb-1 block font-semibold text-zinc-700">Label kartu</label>
                    <input id="homepage-badge" list="homepage-badge-options" maxLength={50} value={formData.homepageBadge} onChange={(e) => setFormData({ ...formData, homepageBadge: e.target.value })} placeholder="Contoh: Menu Baru" className="w-full rounded-xl border border-orange-200 bg-white p-2.5 text-xs text-zinc-800 focus:border-orange-500 focus:outline-none" />
                    <datalist id="homepage-badge-options">{homepageBadgeOptions.map((label) => <option key={label} value={label} />)}</datalist>
                    <p className="mt-1 text-[10px] leading-4 text-zinc-500">Pilih saran yang tersedia atau ketik label sendiri.</p>
                  </div>
                  <div>
                    <span className="mb-2 block font-semibold text-zinc-700">Warna label</span>
                    <div className="flex flex-wrap gap-2">{homepageBadgeColors.map((color) => <button key={color.value} type="button" onClick={() => setFormData({ ...formData, homepageBadgeColor: color.value })} aria-label={`Pilih warna ${color.label}`} className={`flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-[10px] font-bold transition ${formData.homepageBadgeColor === color.value ? "border-zinc-900 text-zinc-900 shadow-sm" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"}`}><span className={`h-3.5 w-3.5 rounded-full ring-2 ${color.className}`} />{color.label}</button>)}</div>
                  </div>
                  {homepageConflict && <p className="rounded-xl bg-amber-100 px-3 py-2 text-[11px] font-semibold leading-5 text-amber-800">Posisi {formData.homepagePosition} sedang dipakai “{homepageConflict.name}”. Menyimpan menu ini akan menggantikannya.</p>}
                </div>}
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-zinc-700">Makanan Siap / Tersedia Dipesan</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-zinc-600 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {editingId ? "Simpan Perubahan" : "Buat Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
