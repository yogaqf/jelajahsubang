"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Loader2, MapPin, ShoppingBag } from "lucide-react";

interface ServiceArea {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function SharelokPage() {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/sharelok/areas")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) throw new Error(data?.error || "Gagal memuat area layanan");
        setAreas(data);
        const saved = localStorage.getItem("sharelok-selected-area");
        const selected = data.find((area: ServiceArea) => area.id === saved && area.isActive) || data.find((area: ServiceArea) => area.isActive);
        setSelectedAreaId(selected?.id || "");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Gagal memuat area layanan"))
      .finally(() => setLoading(false));
  }, []);

  const selectedArea = areas.find((area) => area.id === selectedAreaId);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600 px-4 py-10 sm:py-16">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-300/15 blur-3xl" />
      <Link href="/" className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 sm:left-6 sm:top-6">
        <ArrowLeft className="h-4 w-4" />
        Jelajah Subang
      </Link>
      <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col items-center justify-center text-center">
        <div className="mb-5 flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-700 shadow-xl">S</div><h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Share<span className="text-red-400">lok</span></h1></div>
        <p className="max-w-md text-sm leading-relaxed text-white/70 sm:text-base">Kuliner lokal pilihan, diantar sesuai cakupan area layananmu.</p>

        <section className="mt-8 w-full max-w-2xl rounded-[1.75rem] border border-white/15 bg-white p-5 text-left shadow-2xl shadow-emerald-950/30 sm:p-7">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><MapPin className="h-5 w-5" /></div><div><h2 className="text-lg font-black text-zinc-900">Mau pesan dari area mana?</h2><p className="mt-0.5 text-xs text-zinc-500">Pilih satu area. Menu, mitra, dan driver akan otomatis disesuaikan.</p></div></div>

          {loading ? <div className="flex items-center justify-center gap-2 py-10 text-sm font-semibold text-zinc-500"><Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> Memuat area...</div> : error ? <div className="mt-5 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div> : <div className="mt-5 grid gap-3 sm:grid-cols-3">{areas.map((area) => {
            const selected = selectedAreaId === area.id;
            return <button key={area.id} type="button" disabled={!area.isActive} onClick={() => setSelectedAreaId(area.id)} className={`relative min-h-28 rounded-2xl border-2 p-4 text-left transition ${selected ? "border-emerald-600 bg-emerald-50 shadow-md" : area.isActive ? "border-zinc-200 bg-white hover:border-emerald-300" : "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-70"}`}>
              {selected && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"><Check className="h-3 w-3" /></span>}
              <div className="font-black text-zinc-900">{area.name}</div><div className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${area.isActive ? "text-emerald-700" : "text-amber-600"}`}>{area.isActive ? "Tersedia" : "Segera hadir"}</div><p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-zinc-500">{area.description}</p>
            </button>;
          })}</div>}

          <Link href="/sharelok/app" aria-disabled={!selectedArea} onClick={(event) => { if (!selectedArea) return event.preventDefault(); localStorage.setItem("sharelok-selected-area", selectedArea.id); }} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black transition ${selectedArea ? "bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800" : "pointer-events-none bg-zinc-200 text-zinc-400"}`}><ShoppingBag className="h-4 w-4" /> Mulai Pesan{selectedArea ? ` di ${selectedArea.name}` : ""}<ChevronRight className="h-4 w-4" /></Link>
        </section>
        <p className="mt-5 text-[10px] font-semibold text-white/45">Area lain akan aktif setelah mitra dan driver siap melayani.</p>
      </main>
    </div>
  );
}
