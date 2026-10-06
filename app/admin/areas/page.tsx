"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPinned, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAppAlert } from "@/components/ui/app-alert";

interface Area { id: string; name: string; slug: string; description: string | null; isActive: boolean; sortOrder: number }
const emptyForm = { name: "", slug: "", description: "", isActive: false, sortOrder: 0 };

export default function AreasAdminPage() {
  const { ask } = useAppAlert();
  const [areas, setAreas] = useState<Area[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/sharelok/areas");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Gagal memuat area");
    setAreas(data);
    setLoading(false);
  }, []);

  useEffect(() => { Promise.resolve().then(load).catch((error) => { setMessage(error.message); setLoading(false); }); }, [load]);
  function reset() { setEditingId(null); setForm(emptyForm); setMessage(""); setIsFormOpen(false); }
  function openAdd() { setEditingId(null); setForm(emptyForm); setMessage(""); setIsFormOpen(true); }
  function edit(area: Area) { setEditingId(area.id); setForm({ name: area.name, slug: area.slug, description: area.description || "", isActive: area.isActive, sortOrder: area.sortOrder }); setMessage(""); setIsFormOpen(true); }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/sharelok/areas", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), ...form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan area");
      reset(); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan area"); }
    finally { setSaving(false); }
  }

  async function remove(area: Area) {
    if (!await ask(`Area “${area.name}” akan dihapus permanen.`, { title: "Hapus area layanan?", tone: "danger", confirmLabel: "Ya, hapus" })) return;
    const response = await fetch(`/api/sharelok/areas?id=${area.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Gagal menghapus area");
    await load();
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Cakupan layanan</p><h2 className="mt-1 text-2xl font-black">Area operasional</h2><p className="mt-1 text-sm text-zinc-500">Area aktif dapat dipilih customer. Mitra, menu, driver, pesanan, dan laporan mengikuti area ini.</p></div><button type="button" onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"><Plus className="h-4 w-4" />Tambah Area</button></div>
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">{loading ? <div className="p-10 text-center text-sm text-zinc-500">Memuat area...</div> : <div className="divide-y divide-zinc-100">{areas.map((area) => <div key={area.id} className="flex items-center gap-4 p-4"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${area.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-400"}`}><MapPinned className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-bold">{area.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${area.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{area.isActive ? "TERSEDIA" : "SEGERA"}</span></div><p className="truncate text-xs text-zinc-500">{area.description || `/${area.slug}`}</p></div><button onClick={() => edit(area)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(area)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>)}</div>}</div>
    {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs" onMouseDown={(event) => { if (event.target === event.currentTarget) reset(); }}><form onSubmit={submit} className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between"><div><h3 className="font-black">{editingId ? "Edit Area" : "Tambah Area Baru"}</h3><p className="mt-1 text-xs text-zinc-500">Tentukan nama wilayah dan status ketersediaannya.</p></div><button type="button" onClick={reset} aria-label="Tutup form" className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button></div>
      <div className="grid gap-3 md:grid-cols-2"><input required placeholder="Nama area" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm" /><input required placeholder="Slug area" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm" /><input placeholder="Deskripsi cakupan wilayah" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm" /><input type="number" placeholder="Urutan" value={form.sortOrder || ""} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm" /></div>
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-emerald-600" /> Tersedia untuk customer</label>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      <button disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {editingId ? "Simpan perubahan" : "Tambah area"}</button>
    </form></div>}
  </div>;
}
