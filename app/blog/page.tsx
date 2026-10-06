import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin, PenLine } from "lucide-react";

import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getManagedBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artikel Wisata dan Kuliner Subang",
  description: "Baca artikel, panduan perjalanan, rekomendasi kuliner, dan cerita lokal terbaru dari Kabupaten Subang.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Artikel Jelajah Subang", description: "Inspirasi wisata, kuliner, dan cerita lokal Kabupaten Subang.", url: "/blog" },
};

export default async function BlogPage() {
  const posts = await getManagedBlogPosts();
  const [featured, ...articles] = posts;

  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f7f8f4]">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-emerald-950 px-4 pb-24 pt-20 text-white sm:px-6 sm:pb-28 sm:pt-24">
          <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-[100px]" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-400/10 blur-[100px]" />
          <div className="relative mx-auto max-w-7xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-200"><PenLine className="h-3.5 w-3.5" />Cerita Jelajah</span><h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Inspirasi untuk mengenal Subang lebih dekat.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">Cerita perjalanan, rekomendasi tempat, kuliner lokal, dan panduan singkat sebelum kamu berangkat.</p></div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {featured ? <Link href={`/blog/${featured.slug}`} className="group relative -mt-14 grid min-h-[460px] overflow-hidden rounded-[2rem] bg-zinc-900 shadow-2xl shadow-zinc-900/15 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative min-h-64 overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-950">
              {featured.imageUrl ? <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${featured.imageUrl})` }} /> : <div className="absolute inset-0 flex items-center justify-center"><MapPin className="h-24 w-24 text-white/15" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/25" />
              <span className="absolute left-5 top-5 rounded-full bg-orange-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">Pilihan editor</span>
            </div>
            <div className="flex flex-col justify-center bg-white p-7 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(featured.date)}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />5 menit baca</span></div>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">{featured.title}</h2>
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-500 sm:text-base">{featured.excerpt}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-emerald-700">Baca cerita lengkap<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </div>
          </Link> : <div className="-mt-14 rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-xl"><p className="font-bold text-zinc-500">Belum ada artikel yang dipublikasikan.</p></div>}

          {articles.length > 0 && <section className="pt-20"><div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Baca selanjutnya</p><h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">Cerita terbaru</h2></div><span className="hidden text-sm text-zinc-400 sm:block">{posts.length} artikel tersedia</span></div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
              {articles.map((post) => <article key={post.slug} className="group flex w-[82vw] max-w-[350px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:w-auto sm:max-w-none">
                <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-emerald-100 to-amber-50">{post.imageUrl ? <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${post.imageUrl})` }} /> : <div className="absolute inset-0 flex items-center justify-center"><MapPin className="h-12 w-12 text-emerald-700/20" /></div>}<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /></Link>
                <div className="flex flex-1 flex-col p-6"><div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400"><CalendarDays className="h-3.5 w-3.5" />{formatDate(post.date)}</div><h3 className="mt-3 text-xl font-black leading-snug text-zinc-950 group-hover:text-emerald-700">{post.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-emerald-700">Baca artikel<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></div>
              </article>)}
            </div>
          </section>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
