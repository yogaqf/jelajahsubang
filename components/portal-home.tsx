"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Clock3, Compass, MapPin, Play, ShoppingBag, Sparkles, Store, UtensilsCrossed, Video } from "lucide-react";

export interface PortalEntryView {
  id: string; type: string; platform: string | null; title: string; slug: string; summary: string | null; content: string | null; imageUrl: string | null; externalUrl: string | null; embedUrl: string | null; location: string | null; price: number; sortOrder: number; publishedAt: string;
}

export interface FeaturedFoodView {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  merchantName: string;
  merchantSlug: string;
  areaName: string;
  badge: string;
  badgeColor: string;
}

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const foodBadgeColorClasses: Record<string, string> = {
  orange: "bg-orange-700",
  red: "bg-red-700",
  green: "bg-emerald-700",
  blue: "bg-blue-700",
  purple: "bg-purple-700",
  dark: "bg-zinc-800",
};

function socialThumbnail(entry: PortalEntryView) {
  if (entry.imageUrl) return entry.imageUrl;
  if (entry.platform === "YOUTUBE" && entry.embedUrl) {
    const videoId = entry.embedUrl.match(/\/embed\/([^?&#/]+)/)?.[1];
    if (videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

function SocialThumbnailFallback({ platform }: { platform: string | null }) {
  const isInstagram = platform === "INSTAGRAM";
  const isYoutube = platform === "YOUTUBE";
  const Icon = isInstagram ? Camera : isYoutube ? Video : Play;
  const background = isInstagram
    ? "from-fuchsia-700 via-rose-600 to-amber-400"
    : isYoutube
      ? "from-red-700 via-red-600 to-zinc-950"
      : "from-zinc-950 via-cyan-700 to-fuchsia-700";
  return <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${background}`}><Icon className="h-16 w-16 text-white/90" /><span className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-white/80">{platform || "VIDEO"}</span></div>;
}

function SectionHeading({ eyebrow, title, description, href, linkLabel = "Lihat semua" }: { eyebrow: string; title: string; description: string; href?: string; linkLabel?: string }) {
  return <div className="mb-7 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p><h2 className="mt-2 break-words text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">{description}</p></div>{href && <Link href={href} aria-label={`${linkLabel}: ${title}`} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800">{linkLabel}<ArrowRight className="h-4 w-4" /></Link>}</div>;
}

export function PortalHome({ entries, featuredFoods }: { entries: PortalEntryView[]; featuredFoods: FeaturedFoodView[] }) {
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
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);

  useEffect(() => {
    if (heroes.length < 2) return;
    const timer = window.setInterval(() => setActiveHero((current) => (current + 1) % heroes.length), 6000);
    return () => window.clearInterval(timer);
  }, [heroes.length]);

  const hero = heroes[activeHero] || heroes[0];
  function moveHero(direction: number) { setActiveHero((current) => (current + direction + heroes.length) % heroes.length); }

  return <main className="-mt-16 w-full max-w-full overflow-x-clip bg-[#f7f8f4]">
    <section className="relative min-h-[690px] bg-zinc-900 text-white sm:min-h-[760px]">
      {hero && <Image key={hero.id} src={hero.imageUrl || "/images/hero.jpg"} alt="" fill preload quality={70} sizes="100vw" className="object-cover object-center" />}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,20,15,.88)_0%,rgba(6,20,15,.52)_50%,rgba(6,20,15,.2)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#f7f8f4] via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-[690px] w-full max-w-7xl items-center px-4 pb-28 pt-36 sm:min-h-[760px] sm:px-6 sm:pt-40 lg:px-8">
        <div className="min-w-0 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md"><Sparkles className="h-4 w-4 text-amber-300" />Portal wisata & ekonomi kreatif Subang</div>
          <h1 className="mt-6 break-words text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{hero?.title || "Jelajahi Subang dengan cara yang baru"}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-xl sm:leading-8">{hero?.summary || "Temukan destinasi, cerita, kuliner, dan produk lokal terbaik dari Kabupaten Subang."}</p>
          {hero?.location && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-100"><MapPin className="h-4 w-4" />{hero.location}</p>}
          <div className="mt-9 flex flex-wrap gap-3"><Link href={hero?.externalUrl || "/destinasi"} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-black text-zinc-950 shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-400">Mulai Jelajah<ArrowRight className="h-4 w-4" /></Link><Link href="/sharelok" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur-md hover:bg-white/20"><UtensilsCrossed className="h-4 w-4" />Pesan Kuliner</Link></div>
        </div>
      </div>
      {heroes.length > 1 && <div className="absolute bottom-28 right-4 z-10 flex items-center gap-2 sm:right-8"><button onClick={() => moveHero(-1)} aria-label="Hero sebelumnya" className="rounded-full border border-white/25 bg-black/20 p-3 backdrop-blur hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button><button onClick={() => moveHero(1)} aria-label="Hero berikutnya" className="rounded-full border border-white/25 bg-black/20 p-3 backdrop-blur hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button></div>}
      <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 gap-2">{heroes.map((slide, index) => <button key={slide.id} onClick={() => setActiveHero(index)} aria-label={`Buka slide ${index + 1}`} className={`h-1.5 rounded-full transition-all ${activeHero === index ? "w-8 bg-white" : "w-2 bg-white/45"}`} />)}</div>
    </section>

    <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-zinc-900/10 sm:grid-cols-3">
      <Link href="/destinasi" className="group flex items-center gap-4 p-5 hover:bg-emerald-50 sm:p-6"><span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><Compass className="h-6 w-6" /></span><span><strong className="block text-sm text-zinc-900">Cari destinasi</strong><small className="text-zinc-500">Alam, budaya, dan keluarga</small></span></Link>
      <Link href="/sharelok" className="group flex items-center gap-4 border-y border-zinc-100 p-5 hover:bg-orange-50 sm:border-x sm:border-y-0 sm:p-6"><span className="rounded-2xl bg-orange-100 p-3 text-orange-700"><UtensilsCrossed className="h-6 w-6" /></span><span><strong className="block text-sm text-zinc-900">Kuliner via Sharelok</strong><small className="text-zinc-500">Pesan dari mitra lokal</small></span></Link>
      <Link href="/shop" className="group flex items-center gap-4 p-5 hover:bg-sky-50 sm:p-6"><span className="rounded-2xl bg-sky-100 p-3 text-sky-700"><ShoppingBag className="h-6 w-6" /></span><span><strong className="block text-sm text-zinc-900">Belanja produk lokal</strong><small className="text-zinc-500">Oleh-oleh dan merchandise</small></span></Link>
    </div></section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Pilihan perjalanan" title="Destinasi yang patut disinggahi" description="Mulai dari udara sejuk pegunungan hingga pesona pesisir utara Subang." href="/destinasi" />
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">{destinations.slice(0, 6).map((entry, index) => <Link key={entry.id} href={entry.externalUrl || "/destinasi"} className={`group relative min-h-80 w-[84vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-3xl bg-zinc-900 sm:w-auto sm:max-w-none ${index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}><Image src={entry.imageUrl || "/images/hero.jpg"} alt="" fill quality={70} sizes="(max-width: 640px) 84vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-center transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white">{entry.location && <span className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-200"><MapPin className="h-3.5 w-3.5" />{entry.location}</span>}<h3 className="text-xl font-black">{entry.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-white/75">{entry.summary}</p></div></Link>)}</div>
    </section>

    <section className="relative overflow-hidden bg-[#180d08] py-20 text-white">
      <div className="pointer-events-none absolute -left-28 top-1/3 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-400/15 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-orange-300"><Sparkles className="h-3.5 w-3.5" />Kuliner lokal pilihan</span>
            <h2 className="mt-5 max-w-lg text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">Lagi lapar? Yang enak-enak sudah menunggu.</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/65 sm:text-base">Temukan menu dari mitra lokal di area kamu. Pilih makanannya, kirim pesanan, lalu lanjut konfirmasi melalui WhatsApp.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-white/75"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2"><Store className="h-3.5 w-3.5 text-orange-300" />Mitra lokal</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2"><Clock3 className="h-3.5 w-3.5 text-orange-300" />Cek ketersediaan langsung</span></div>
            <Link href="/sharelok" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-orange-400 px-6 py-3.5 text-sm font-black text-zinc-950 shadow-xl shadow-orange-950/40 transition hover:-translate-y-0.5 hover:bg-orange-300">Lihat Menu & Pesan<ArrowRight className="h-4 w-4" /></Link>
          </div>

          {featuredFoods.length > 0 ? <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {featuredFoods.slice(0, 3).map((food, index) => <Link key={food.id} href={food.merchantSlug ? `/sharelok/app/toko/${food.merchantSlug}` : "/sharelok"} className={`group relative h-[390px] w-[76vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-zinc-800 shadow-2xl shadow-black/30 sm:w-auto sm:max-w-none ${index === 1 ? "sm:translate-y-7" : ""}`}>
              {food.imageUrl ? <Image src={food.imageUrl} alt="" fill quality={70} sizes="(max-width: 640px) 76vw, 33vw" className="object-cover object-center transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-700"><UtensilsCrossed className="h-16 w-16 text-white/70" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className={`inline-flex h-6 max-w-full self-start truncate rounded-full px-2.5 text-[10px] font-black uppercase leading-6 tracking-wider text-white ${foodBadgeColorClasses[food.badgeColor] || foodBadgeColorClasses.orange}`}>{food.badge}</span>
                <h3 className="mt-3 line-clamp-2 min-h-12 text-xl font-black leading-6 text-white sm:min-h-0 sm:leading-tight">{food.name}</h3>
                <p className="mt-1 truncate text-xs font-semibold text-white/60">{food.merchantName}</p>
                <p className="mt-1.5 flex min-w-0 items-center gap-1 text-[11px] font-bold text-orange-200"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{food.areaName}</span></p>
                <div className="mt-3 flex items-center justify-between"><strong className="text-base text-orange-300">{money(food.price)}</strong><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-950 transition group-hover:translate-x-1"><ArrowRight className="h-4 w-4" /></span></div>
              </div>
            </Link>)}
          </div> : <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_70%_30%,#f97316_0%,#9a3412_35%,#431407_72%,#180d08_100%)] shadow-2xl shadow-black/30"><div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"><span className="text-8xl drop-shadow-2xl">🍛</span><p className="mt-6 text-2xl font-black">Menu lokal, rasa istimewa.</p><p className="mt-2 text-sm text-white/60">Buka Sharelok untuk melihat menu yang tersedia hari ini.</p></div></div>}
        </div>
      </div>
    </section>

    {blogs.length > 0 && <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Cerita & panduan" title="Baca sebelum berangkat" description="Inspirasi perjalanan, budaya, dan kabar terbaru dari berbagai sudut Subang." href="/blog" /><div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">{blogs.slice(0, 6).map((entry) => <Link key={entry.id} href={`/blog/${entry.slug}`} className="group flex w-[82vw] max-w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:w-auto sm:max-w-none"><div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-gradient-to-br from-emerald-100 to-amber-50">{entry.imageUrl ? <Image src={entry.imageUrl} alt="" fill quality={70} sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-center transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 flex items-center justify-center"><Compass className="h-12 w-12 text-emerald-700/20" /></div>}<div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" /></div><div className="flex flex-1 flex-col p-6"><p className="text-xs font-bold text-emerald-700">{new Date(entry.publishedAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}</p><h3 className="mt-3 line-clamp-2 text-xl font-black text-zinc-900 group-hover:text-emerald-700">{entry.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">{entry.summary}</p><span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-zinc-900">Baca artikel<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></Link>)}</div></section>}

    {socials.length > 0 && <section className="bg-white py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Jelajah dalam video" title="Lihat Subang dari layar kamu" description="Konten terbaru Jelajah Subang dari TikTok, Instagram, dan YouTube." /><div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">{socials.slice(0, 6).map((entry) => { const thumbnail = socialThumbnail(entry); return <article key={entry.id} className="w-[82vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 shadow-sm sm:w-auto sm:max-w-none"><div className="relative aspect-[9/11] overflow-hidden bg-zinc-900">{activeEmbed === entry.id && entry.embedUrl ? <iframe src={entry.embedUrl} title={entry.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="h-full w-full border-0" /> : <>{thumbnail ? <Image src={thumbnail} alt="" fill quality={70} sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-center opacity-75" /> : <SocialThumbnailFallback platform={entry.platform} />}<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" /><button type="button" onClick={() => entry.embedUrl && setActiveEmbed(entry.id)} disabled={!entry.embedUrl} aria-label={`Putar video: ${entry.title}`} className="absolute inset-0 flex items-center justify-center text-white disabled:cursor-default"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-zinc-950 shadow-2xl transition hover:scale-105"><Play className="ml-1 h-7 w-7 fill-current" /></span></button></>}</div><div className="p-5 text-white"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{entry.platform}</p><h3 className="mt-2 font-black">{entry.title}</h3>{entry.externalUrl && <a href={entry.externalUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white">Buka kanal<ArrowRight className="h-3.5 w-3.5" /></a>}</div></article>; })}</div></div></section>}

    {products.length > 0 && <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Produk lokal" title="Bawa pulang bagian dari Subang" description="Merchandise dan produk pilihan untuk melengkapi perjalananmu." href="/shop" /><div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">{products.slice(0, 8).map((entry) => <Link key={entry.id} href="/shop" className="group w-[72vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm sm:w-auto sm:max-w-none"><div className="relative aspect-square overflow-hidden bg-zinc-100"><Image src={entry.imageUrl || "/images/hero.jpg"} alt="" fill quality={70} sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 25vw" className="object-cover object-center transition-transform duration-500 group-hover:scale-105" /></div><div className="relative bg-white p-5"><h3 className="font-black text-zinc-900">{entry.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{entry.summary}</p>{entry.price > 0 && <p className="mt-3 font-black text-emerald-700">{money(entry.price)}</p>}</div></Link>)}</div></section>}
  </main>;
}
