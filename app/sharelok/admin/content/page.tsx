"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, ExternalLink, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

type ContentType = "HERO" | "BLOG" | "DESTINATION" | "SHOP" | "SOCIAL";
interface PortalEntry {
  id: string; type: ContentType; platform: string | null; title: string; slug: string; summary: string | null; content: string | null; imageUrl: string | null; externalUrl: string | null; embedUrl: string | null; location: string | null; price: number; isPublished: boolean; sortOrder: number; publishedAt: string;
}

const typeLabels: Record<ContentType, string> = { HERO: "Hero carousel", BLOG: "Blog", DESTINATION: "Destinasi", SHOP: "Shop", SOCIAL: "Video sosial" };
const emptyForm = { type: "HERO" as ContentType, platform: "", title: "", slug: "", summary: "", content: "", imageUrl: "", externalUrl: "", embedUrl: "", location: "", price: 0, isPublished: true, sortOrder: 0, publishedAt: new Date().toISOString().slice(0, 16) };
const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function PortalContentAdminPage() {
  const [entries, setEntries] = useState<PortalEntry[]>([]);
  const [filter, setFilter] = useState<ContentType | "ALL">("ALL");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/portal/entries");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Gagal memuat konten");
    setEntries(data); setLoading(false);
  }, []);

  useEffect(() => { Promise.resolve().then(load).catch((error) => { setMessage(error.message); setLoading(false); }); }, [load]);

  const visibleEntries = useMemo(() => filter === "ALL" ? entries : entries.filter((entry) => entry.type === filter), [entries, filter]);
  function close() { setIsOpen(false); setEditingId(null); setForm(emptyForm); setMessage(""); }
  function openAdd(type: ContentType = filter === "ALL" ? "HERO" : filter) { setEditingId(null); setForm({ ...emptyForm, type, publishedAt: new Date().toISOString().slice(0, 16) }); setMessage(""); setIsOpen(true); }
  function openEdit(entry: PortalEntry) {
    setEditingId(entry.id);
    setForm({ type: entry.type, platform: entry.platform || "", title: entry.title, slug: entry.slug, summary: entry.summary || "", content: entry.content || "", imageUrl: entry.imageUrl || "", externalUrl: entry.externalUrl || "", embedUrl: entry.embedUrl || "", location: entry.location || "", price: entry.price, isPublished: entry.isPublished, sortOrder: entry.sortOrder, publishedAt: new Date(entry.publishedAt).toISOString().slice(0, 16) });
    setMessage(""); setIsOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/portal/entries", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), ...form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan konten");
      close(); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan konten"); }
    finally { setSaving(false); }
  }

  async function remove(entry: PortalEntry) {
    if (!window.confirm(`Hapus “${entry.title}”?`)) return;
    const response = await fetch(`/api/portal/entries?id=${entry.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Gagal menghapus konten");
    await load();
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Website utama</p><h2 className="mt-1 text-2xl font-black">CMS Portal Jelajah Subang</h2><p className="mt-1 max-w-2xl text-sm text-zinc-500">Kelola hero, artikel, destinasi, produk shop, serta embed TikTok, Instagram, dan YouTube.</p></div>
      <button onClick={() => openAdd()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><Plus className="h-4 w-4" />Tambah Konten</button>
    </div>

    <div className="flex gap-2 overflow-x-auto pb-1">{(["ALL", "HERO", "BLOG", "DESTINATION", "SHOP", "SOCIAL"] as const).map((type) => <button key={type} onClick={() => setFilter(type)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${filter === type ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-600"}`}>{type === "ALL" ? "Semua" : typeLabels[type]}</button>)}</div>
    {message && !isOpen && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}

    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {loading ? <div className="p-12 text-center text-sm text-zinc-500">Memuat konten...</div> : visibleEntries.length === 0 ? <div className="p-12 text-center"><p className="text-sm font-bold text-zinc-700">Belum ada konten pada bagian ini.</p><button onClick={() => openAdd()} className="mt-3 text-sm font-bold text-emerald-700">+ Tambahkan sekarang</button></div> : <div className="divide-y divide-zinc-100">{visibleEntries.map((entry) => <div key={entry.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-zinc-50/60">
        <div className="h-14 w-20 shrink-0 rounded-xl bg-zinc-100 bg-cover bg-center" style={entry.imageUrl ? { backgroundImage: `url(${entry.imageUrl})` } : undefined} />
        <div className="min-w-52 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">{typeLabels[entry.type]}</span>{entry.platform && <span className="text-[10px] font-bold text-zinc-400">{entry.platform}</span>}{entry.isPublished ? <BadgeCheck className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-zinc-400" />}</div><h3 className="mt-1 truncate font-bold text-zinc-900">{entry.title}</h3><p className="truncate text-xs text-zinc-500">{entry.summary || entry.slug}</p></div>
        {entry.externalUrl && <a href={entry.externalUrl} target="_blank" rel="noreferrer" aria-label="Buka tautan" className="rounded-lg p-2 text-zinc-400 hover:bg-white"><ExternalLink className="h-4 w-4" /></a>}
        <button onClick={() => openEdit(entry)} aria-label="Edit" className="rounded-lg p-2 text-zinc-500 hover:bg-white"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(entry)} aria-label="Hapus" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
      </div>)}</div>}
    </div>

    {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
      <div className="flex items-start justify-between border-b border-zinc-100 pb-4"><div><h3 className="font-black">{editingId ? "Edit Konten" : "Tambah Konten Baru"}</h3><p className="mt-1 text-xs text-zinc-500">Konten aktif akan langsung tampil pada portal utama.</p></div><button type="button" onClick={close} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold text-zinc-700">Jenis konten *<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ContentType })} className={`${inputClass} mt-1.5`}><option value="HERO">Hero carousel</option><option value="BLOG">Blog</option><option value="DESTINATION">Destinasi</option><option value="SHOP">Shop</option><option value="SOCIAL">Video sosial</option></select></label>
        {form.type === "SOCIAL" && <label className="text-xs font-bold text-zinc-700">Platform *<select required value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })} className={`${inputClass} mt-1.5`}><option value="">Pilih platform</option><option value="TIKTOK">TikTok</option><option value="INSTAGRAM">Instagram</option><option value="YOUTUBE">YouTube</option></select></label>}
        <label className="text-xs font-bold text-zinc-700">Judul *<input required value={form.title} onChange={(event) => { const title = event.target.value; setForm({ ...form, title, slug: editingId ? form.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }); }} placeholder="Judul yang tampil" className={`${inputClass} mt-1.5`} /></label>
        <label className="text-xs font-bold text-zinc-700">Slug *<input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="judul-konten" className={`${inputClass} mt-1.5`} /></label>
        <label className="text-xs font-bold text-zinc-700 sm:col-span-2">Ringkasan<textarea rows={2} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Deskripsi singkat untuk kartu atau hero" className={`${inputClass} mt-1.5`} /></label>
        {form.type === "BLOG" && <label className="text-xs font-bold text-zinc-700 sm:col-span-2">Isi artikel (Markdown)<textarea rows={8} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Tulis artikel lengkap di sini..." className={`${inputClass} mt-1.5 font-mono`} /></label>}
        {form.type !== "SOCIAL" && <label className="text-xs font-bold text-zinc-700 sm:col-span-2">URL gambar<input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://... atau /images/..." className={`${inputClass} mt-1.5`} /></label>}
        {form.type === "SOCIAL" ? <label className="text-xs font-bold text-zinc-700 sm:col-span-2">URL embed / iframe *<input required value={form.embedUrl} onChange={(event) => setForm({ ...form, embedUrl: event.target.value })} placeholder="YouTube: https://www.youtube.com/embed/..." className={`${inputClass} mt-1.5`} /><span className="mt-1 block text-[10px] font-normal text-zinc-400">Gunakan URL embed, bukan URL halaman biasa. Instagram biasanya berakhiran /embed.</span></label> : <label className="text-xs font-bold text-zinc-700">Tautan tujuan<input value={form.externalUrl} onChange={(event) => setForm({ ...form, externalUrl: event.target.value })} placeholder="/destinasi atau https://..." className={`${inputClass} mt-1.5`} /></label>}
        {(form.type === "DESTINATION" || form.type === "HERO") && <label className="text-xs font-bold text-zinc-700">Lokasi<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Ciater, Subang" className={`${inputClass} mt-1.5`} /></label>}
        {form.type === "SHOP" && <label className="text-xs font-bold text-zinc-700">Harga (Rp)<input type="number" min="0" step="1000" value={form.price || ""} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} className={`${inputClass} mt-1.5`} /></label>}
        <label className="text-xs font-bold text-zinc-700">Urutan tampil<input type="number" value={form.sortOrder || ""} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className={`${inputClass} mt-1.5`} /></label>
        <label className="text-xs font-bold text-zinc-700">Tanggal publikasi<input type="datetime-local" value={form.publishedAt} onChange={(event) => setForm({ ...form, publishedAt: event.target.value })} className={`${inputClass} mt-1.5`} /></label>
      </div>
      <label className="mt-4 flex items-center gap-3 rounded-xl bg-zinc-50 p-3 text-sm font-bold"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} className="h-4 w-4 accent-emerald-600" />Tampilkan di website</label>
      {message && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">{message}</p>}
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={close} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600">Batal</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? "Simpan Perubahan" : "Tambah Konten"}</button></div>
    </form></div>}
  </div>;
}
