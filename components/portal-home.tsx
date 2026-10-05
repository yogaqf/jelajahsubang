"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Compass, MapPin, Play, ShoppingBag, Sparkles, UtensilsCrossed } from "lucide-react";

export interface PortalEntryView {
  id: string; type: string; platform: string | null; title: string; slug: string; summary: string | null; content: string | null; imageUrl: string | null; externalUrl: string | null; embedUrl: string | null; location: string | null; price: number; sortOrder: number; publishedAt: string;
}

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

function SectionHeading({ eyebrow, title, description, href, linkLabel = "Lihat semua" }: { eyebrow: string; title: string; description: string; href?: string; linkLabel?: string }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p><h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">{description}</p></div>{href && <Link href={href} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800">{linkLabel}<ArrowRight className="h-4 w-4" /></Link>}</div>;
}

export function PortalHome({ entries }: { entries: PortalEntryView[] }) {
  const grouped = useMemo(() => ({
    HERO: entries.filter((entry) => entry.type === "HERO"),
    DESTINATION: entries.filter((entry) => entry.type === "DESTINATION"),
    BLOG: entries.filter((entry) => entry.type === "BLOG"),
    SHOP: entries.filter((entry) => entry.type === "SHOP"),
    SOCIAL: entries.filter((entry) => entry.type === "SOCIAL"),
  }), [entries]);
  const heroes = grouped.HERO;
  const destinations = grouped.DESTINATION;
  const blogs = grouped.BLOG;
  const products = grouped.SHOP;
  const socials = grouped.SOCIAL;
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    if (heroes.length < 2) return;
    const timer = window.setInterval(() => setActiveHero((current) => (current + 1) % heroes.length), 6000);
    return () => window.clearInterval(timer);
  }, [heroes.length]);

  const hero = heroes[activeHero] || heroes[0];
  function moveHero(direction: number) { setActiveHero((current) => (current + direction + heroes.length) % heroes.length); }

  return <main className="-mt-16 overflow-hidden bg-[#f7f8f4] pt-16">
    <section className="relative min-h-[690px] bg-zinc-900 text-white sm:min-h-[760px]">
      {heroes.map((slide, index) => <div key={slide.id} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === activeHero ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: `url(${slide.imageUrl || "/images/hero.jpg"})` }} />)}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,20,15,.88)_0%,rgba(6,20,15,.52)_50%,rgba(6,20,15,.2)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#f7f8f4] via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-[690px] max-w-7xl items-center px-4 pb-28 pt-36 sm:min-h-[760px] sm:px-6 sm:pt-40 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md"><Sparkles className="h-4 w-4 text-amber-300" />Portal wisata & ekonomi kreatif Subang</div>
          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{hero?.title || "Jelajahi Subang dengan cara yang baru"}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-xl sm:leading-8">{hero?.summary || "Temukan destinasi, cerita, kuliner, dan produk lokal terbaik dari Kabupaten Subang."}</p>
          {hero?.location && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-100"><MapPin className="h-4 w-4" />{hero.location}</p>}
          <div className="mt-9 flex flex-wrap gap-3"><Link href={hero?.externalUrl || "/destinasi"} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-black text-zinc-950 shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-400">Mulai Jelajah<ArrowRight className="h-4 w-4" /></Link><Link href="/sharelok" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur-md hover:bg-white/20"><UtensilsCrossed className="h-4 w-4" />Pesan Kuliner</Link></div>
        </div>
      </div>
      {heroes.length > 1 && <div className="absolute bottom-28 right-4 z-10 flex items-center gap-2 sm:right-8"><button onClick={() => moveHero(-1)} aria-label="Hero sebelumnya" className="rounded-full border border-white/25 bg-black/20 p-3 backdrop-blur hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button><button onClick={() => moveHero(1)} aria-label="Hero berikutnya" className="rounded-full border border-white/25 bg-black/20 p-3 backdrop-blur hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button></div>}
      <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 gap-2">{heroes.map((slide, index) => <button key={slide.id} onClick={() => setActiveHero(index)} aria-label={`Buka slide ${index + 1}`} className={`h-1.5 rounded-full transition-all ${activeHero === index ? "w-8 bg-white" : "w-2 bg-white/45"}`} />)}</div>
    </section>

    <section className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-zinc-900/10 sm:grid-cols-3">
      <Link href="/destinasi" className="group flex items-center gap-4 p-5 hover:bg-emerald-50 sm:p-6"><span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><Compass className="h-6 w-6" /></span><span><strong className="block text-sm text-zinc-900">Cari destinasi</strong><small className="text-zinc-500">Alam, budaya, dan keluarga</small></span></Link>
      <Link href="/sharelok" className="group flex items-center gap-4 border-y border-zinc-100 p-5 hover:bg-orange-50 sm:border-x sm:border-y-0 sm:p-6"><span className="rounded-2xl bg-orange-100 p-3 text-orange-700"><UtensilsCrossed className="h-6 w-6" /></span><span><strong className="block text-sm text-zinc-900">Kuliner via Sharelok</strong><small className="text-zinc-500">Pesan dari mitra lokal</small></span></Link>
      <Link href="/shop" className="group flex items-center gap-4 p-5 hover:bg-sky-50 sm:p-6"><span className="rounded-2xl bg-sky-100 p-3 text-sky-700"><ShoppingBag className="h-6 w-6" /></span><span><strong className="block text-sm text-zinc-900">Belanja produk lokal</strong><small className="text-zinc-500">Oleh-oleh dan merchandise</small></span></Link>
    </div></section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Pilihan perjalanan" title="Destinasi yang patut disinggahi" description="Mulai dari udara sejuk pegunungan hingga pesona pesisir utara Subang." href="/destinasi" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{destinations.slice(0, 6).map((entry, index) => <Link key={entry.id} href={entry.externalUrl || "/destinasi"} className={`group relative min-h-80 overflow-hidden rounded-3xl bg-zinc-900 ${index === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}><div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${entry.imageUrl || "/images/hero.jpg"})` }} /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white">{entry.location && <span className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-200"><MapPin className="h-3.5 w-3.5" />{entry.location}</span>}<h3 className="text-xl font-black">{entry.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-white/75">{entry.summary}</p></div></Link>)}</div>
    </section>

    <section className="bg-emerald-950 py-20 text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Makan lokal lebih mudah" title="Lapar saat menjelajah? Buka Sharelok." description="Pilih area, temukan menu dari mitra lokal, lalu lanjutkan pesanan dengan bantuan admin melalui WhatsApp." /><div className="flex flex-col overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#16a34a,#047857)] p-7 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:p-10"><div><p className="text-sm font-bold text-emerald-100">Kuliner Jelajah Subang</p><h3 className="mt-2 text-3xl font-black">Pesan makanan tanpa ribet.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/80">Menu mengikuti area layanan dan ketersediaan mitra secara langsung.</p></div><Link href="/sharelok" className="mt-6 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black text-emerald-800 shadow-lg sm:mt-0">Mulai Pesan<ArrowRight className="h-4 w-4" /></Link></div></div></section>

    {blogs.length > 0 && <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Cerita & panduan" title="Baca sebelum berangkat" description="Inspirasi perjalanan, budaya, dan kabar terbaru dari berbagai sudut Subang." href="/blog" /><div className="grid gap-5 md:grid-cols-3">{blogs.slice(0, 3).map((entry) => <Link key={entry.id} href={`/blog/${entry.slug}`} className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><p className="text-xs font-bold text-emerald-700">{new Date(entry.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p><h3 className="mt-3 text-xl font-black text-zinc-900 group-hover:text-emerald-700">{entry.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">{entry.summary}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-900">Baca artikel<ArrowRight className="h-4 w-4" /></span></Link>)}</div></section>}

    {socials.length > 0 && <section className="bg-white py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Jelajah dalam video" title="Lihat Subang dari layar kamu" description="Konten terbaru Jelajah Subang dari TikTok, Instagram, dan YouTube." /><div className="grid gap-5 lg:grid-cols-3">{socials.slice(0, 3).map((entry) => <article key={entry.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 shadow-sm"><div className="aspect-[9/11] bg-zinc-900">{entry.embedUrl ? <iframe src={entry.embedUrl} title={entry.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="h-full w-full border-0" /> : <div className="flex h-full items-center justify-center text-white/50"><Play className="h-10 w-10" /></div>}</div><div className="p-5 text-white"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{entry.platform}</p><h3 className="mt-2 font-black">{entry.title}</h3>{entry.externalUrl && <a href={entry.externalUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white">Buka kanal<ArrowRight className="h-3.5 w-3.5" /></a>}</div></article>)}</div></div></section>}

    {products.length > 0 && <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Produk lokal" title="Bawa pulang bagian dari Subang" description="Merchandise dan produk pilihan untuk melengkapi perjalananmu." href="/shop" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((entry) => <Link key={entry.id} href={entry.externalUrl || "/shop"} className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="aspect-square bg-zinc-100 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${entry.imageUrl || "/images/hero.jpg"})` }} /><div className="relative bg-white p-5"><h3 className="font-black text-zinc-900">{entry.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{entry.summary}</p>{entry.price > 0 && <p className="mt-3 font-black text-emerald-700">{money(entry.price)}</p>}</div></Link>)}</div></section>}
  </main>;
}
