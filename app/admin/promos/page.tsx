"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAppAlert } from "@/components/ui/app-alert";

/* eslint-disable react-hooks/purity -- promo expiry reflects the current clock at render time. */

interface Promo {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

const emptyForm = {
  code: "",
  description: "",
  discountType: "PERCENT",
  discountValue: 10,
  maxDiscount: 0,
  minOrder: 0,
  usageLimit: 0,
  expiresAt: "",
  isActive: true,
};

const rupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Field({ label, hint, required, children }: { label: string; hint: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-black text-zinc-800">{label}{required && <span className="ml-1 text-red-500">*</span>}</span>
      {children}
      <span className="block text-[10px] leading-relaxed text-zinc-400">{hint}</span>
    </label>
  );
}

function MoneyInput({ value, onChange, required }: { value: number; onChange: (value: number) => void; required?: boolean }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
      <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-xs font-bold text-zinc-500">Rp</span>
      <input required={required} type="number" min="0" step="1000" value={value || ""} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" />
    </div>
  );
}

export default function PromosAdminPage() {
  const { ask } = useAppAlert();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/sharelok/promos");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Gagal memuat promo");
    setPromos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load).catch((error) => { setMessage(error.message); setLoading(false); });
  }, [load]);

  function reset() { setForm(emptyForm); setEditingId(null); setMessage(""); setIsFormOpen(false); }
  function openAdd() { setForm(emptyForm); setEditingId(null); setMessage(""); setIsFormOpen(true); }

  function edit(item: Promo) {
    setEditingId(item.id);
    setForm({ code: item.code, description: item.description || "", discountType: item.discountType, discountValue: item.discountValue, maxDiscount: item.maxDiscount, minOrder: item.minOrder, usageLimit: item.usageLimit, expiresAt: new Date(item.expiresAt).toISOString().slice(0, 16), isActive: item.isActive });
    setMessage("");
    setIsFormOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/sharelok/promos", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), ...form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan promo");
      reset(); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan promo"); }
    finally { setSaving(false); }
  }

  async function remove(item: Promo) {
    if (!await ask(`Kode promo “${item.code}” tidak dapat digunakan lagi setelah dihapus.`, { title: "Hapus kode promo?", tone: "danger", confirmLabel: "Ya, hapus" })) return;
    const response = await fetch(`/api/sharelok/promos?id=${item.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Gagal menghapus promo");
    await load();
  }

  const sampleSubtotal = Math.max(form.minOrder, 100_000);
  const rawSampleDiscount = form.discountType === "FIXED" ? form.discountValue : Math.floor((sampleSubtotal * form.discountValue) / 100);
  const sampleDiscount = Math.min(sampleSubtotal, form.discountType === "PERCENT" && form.maxDiscount > 0 ? Math.min(rawSampleDiscount, form.maxDiscount) : rawSampleDiscount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Marketing</p>
          <h2 className="mt-1 text-2xl font-black">Kode promo</h2>
          <p className="mt-1 text-sm text-zinc-500">Atur syarat promo yang akan dimasukkan customer di keranjang.</p>
        </div>
        <button type="button" onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">
          <Plus className="h-4 w-4" />Tambah Promo
        </button>
      </div>

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs" onMouseDown={(event) => { if (event.target === event.currentTarget) reset(); }}>
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
          <div><h3 className="font-black">{editingId ? "Edit promo" : "Buat promo baru"}</h3><p className="mt-1 text-xs text-zinc-500">Kolom bertanda * wajib diisi. Nilai 0 berarti tanpa batas.</p></div>
          <button type="button" onClick={reset} aria-label="Tutup form" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Kode promo" hint="Contoh: HEMAT10. Gunakan huruf atau angka tanpa spasi." required>
            <input required placeholder="HEMAT10" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/\s/g, "") })} className={`${inputClass} font-bold uppercase`} />
          </Field>
          <Field label="Deskripsi untuk customer" hint="Jelaskan manfaat promo secara singkat.">
            <input placeholder="Diskon spesial area Ciater" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Jenis diskon" hint="Pilih persen atau nominal rupiah tetap." required>
            <select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value, maxDiscount: event.target.value === "FIXED" ? 0 : form.maxDiscount })} className={inputClass}>
              <option value="PERCENT">Persentase dari subtotal</option><option value="FIXED">Potongan rupiah tetap</option>
            </select>
          </Field>

          {form.discountType === "PERCENT" ? (
            <Field label="Persentase diskon" hint="Isi 1 sampai 100 persen." required>
              <div className="flex overflow-hidden rounded-xl border border-zinc-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <input required type="number" min="1" max="100" value={form.discountValue || ""} onChange={(event) => setForm({ ...form, discountValue: Number(event.target.value) })} className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" />
                <span className="flex items-center border-l border-zinc-200 bg-zinc-50 px-3 text-sm font-bold text-zinc-500">%</span>
              </div>
            </Field>
          ) : (
            <Field label="Nominal potongan" hint="Nominal yang langsung mengurangi subtotal." required><MoneyInput required value={form.discountValue} onChange={(value) => setForm({ ...form, discountValue: value })} /></Field>
          )}

          {form.discountType === "PERCENT" && <Field label="Maksimum potongan" hint="Batas rupiah diskon. Isi 0 jika tidak dibatasi."><MoneyInput value={form.maxDiscount} onChange={(value) => setForm({ ...form, maxDiscount: value })} /></Field>}
          <Field label="Minimal belanja" hint="Subtotal minimum agar promo dapat dipakai. Isi 0 jika bebas."><MoneyInput value={form.minOrder} onChange={(value) => setForm({ ...form, minOrder: value })} /></Field>
          <Field label="Total kuota penggunaan" hint="Batas pemakaian untuk semua customer. Isi 0 jika tanpa batas.">
            <input type="number" min="0" step="1" value={form.usageLimit || ""} onChange={(event) => setForm({ ...form, usageLimit: Number(event.target.value) })} className={inputClass} />
          </Field>
          <Field label="Berlaku sampai" hint="Setelah waktu ini, kode otomatis tidak dapat digunakan." required>
            <input required type="datetime-local" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} className={inputClass} />
          </Field>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.5fr]">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="mt-0.5 h-4 w-4 accent-emerald-600" />
            <span><span className="block text-sm font-bold text-zinc-800">Promo aktif</span><span className="mt-0.5 block text-xs text-zinc-500">Nonaktifkan jika promo belum ingin digunakan.</span></span>
          </label>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Simulasi promo</p>
            <p className="mt-1 text-sm font-bold text-zinc-900">Belanja {rupiah(sampleSubtotal)} → hemat {rupiah(sampleDiscount)} → bayar {rupiah(sampleSubtotal - sampleDiscount)}</p>
            <p className="mt-1 text-xs text-emerald-800/70">{form.usageLimit > 0 ? `Tersedia untuk ${form.usageLimit} kali penggunaan.` : "Kuota penggunaan tidak dibatasi."}</p>
          </div>
        </div>

        {message && <p className="mt-3 text-sm font-medium text-red-600">{message}</p>}
        <button disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{editingId ? "Simpan perubahan" : "Buat promo"}
        </button>
      </form>
      </div>}

      <div className="grid gap-3">
        {loading ? <div className="rounded-2xl bg-white p-10 text-center text-sm text-zinc-500">Memuat promo...</div> : promos.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">Belum ada kode promo.</div> : promos.map((item) => {
          const expired = new Date(item.expiresAt).getTime() <= Date.now();
          const benefit = item.discountType === "FIXED" ? rupiah(item.discountValue) : `${item.discountValue}%${item.maxDiscount > 0 ? `, maks. ${rupiah(item.maxDiscount)}` : ""}`;
          return <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><BadgePercent className="h-5 w-5" /></div>
            <div className="min-w-44 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="font-black">{item.code}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.isActive && !expired ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{expired ? "KEDALUWARSA" : item.isActive ? "AKTIF" : "NONAKTIF"}</span></div>
              {item.description && <p className="mt-0.5 text-xs text-zinc-600">{item.description}</p>}
              <p className="mt-1 text-xs font-semibold text-zinc-500">Diskon {benefit} · Min. {rupiah(item.minOrder)} · Terpakai {item.usedCount}{item.usageLimit ? `/${item.usageLimit}` : " (tanpa batas)"}</p>
              <p className="mt-1 text-[10px] text-zinc-400">Berakhir {new Date(item.expiresAt).toLocaleString("id-ID")}</p>
            </div>
            <button onClick={() => edit(item)} aria-label={`Edit promo ${item.code}`} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => remove(item)} aria-label={`Hapus promo ${item.code}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>;
        })}
      </div>
    </div>
  );
}
