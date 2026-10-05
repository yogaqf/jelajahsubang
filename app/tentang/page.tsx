import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, Camera, Compass, Handshake, HeartHandshake, Mail, MapPin, ShoppingBag, Sparkles, Store, UtensilsCrossed } from "lucide-react";

import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Kenali Jelajah Subang, platform lokal yang menghubungkan destinasi, kuliner, cerita, dan pelaku usaha kreatif Kabupaten Subang.",
  alternates: { canonical: "/tentang" },
  openGraph: {
    title: "Tentang Jelajah Subang",
    description: "Tumbuh bersama wisata, kuliner, dan ekonomi kreatif Kabupaten Subang.",
    url: "/tentang",
    type: "website",
    images: [{ url: "/images/hero.jpg", alt: "Lanskap Subang" }],
  },
};

const focusAreas = [
  { icon: Compass, title: "Destinasi", description: "Membantu orang menemukan tempat menarik dan merencanakan perjalanan di berbagai sudut Subang.", color: "bg-emerald-100 text-emerald-800" },
  { icon: UtensilsCrossed, title: "Kuliner lokal", description: "Menghubungkan pelanggan dengan menu dan mitra kuliner melalui layanan Sharelok.", color: "bg-orange-100 text-orange-800" },
  { icon: ShoppingBag, title: "Produk kreatif", description: "Memberi ruang bagi produk lokal dan karya kreatif agar dikenal oleh pasar yang lebih luas.", color: "bg-sky-100 text-sky-800" },
];

const principles = [
  { icon: MapPin, number: "01", title: "Berakar di Subang", description: "Kami melihat Subang dari dekat—melalui tempat, rasa, orang, dan cerita yang membentuk identitasnya." },
  { icon: BookOpenText, number: "02", title: "Informasi yang berguna", description: "Setiap konten dirancang agar mudah dipahami dan benar-benar membantu orang mengambil keputusan." },
  { icon: HeartHandshake, number: "03", title: "Tumbuh bersama", description: "Kami ingin manfaat platform ini kembali kepada mitra, pelaku usaha, dan komunitas lokal." },
];

export default function TentangPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#f7f8f4]">
      <Navbar />
      <main>
        <section className="relative isolate min-h-[620px] overflow-hidden bg-emerald-950 text-white sm:min-h-[680px]">
          <Image src="/images/hero.jpg" alt="Keindahan alam Kabupaten Subang" fill priority className="-z-20 object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-zinc-950/35" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-emerald-950 via-transparent to-black/20" />
          <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:min-h-[680px] sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-100 backdrop-blur"><Sparkles className="h-4 w-4 text-amber-300" />Tentang kami</span>
              <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-[-0.045em] sm:text-7xl">Cerita Subang layak ditemukan lebih banyak orang.</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-xl">Jelajah Subang hadir sebagai pintu untuk mengenal destinasi, menikmati kuliner, membaca cerita lokal, dan mendukung karya terbaik dari Kabupaten Subang.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/destinasi" className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-black text-emerald-950 transition hover:bg-emerald-300">Mulai menjelajah<ArrowRight className="h-4 w-4" /></Link>
                <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur transition hover:bg-white/20">Baca artikel</Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f7f8f4] to-transparent" />
        </section>

        <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 md:grid-cols-3">
            {focusAreas.map(({ icon: Icon, title, description, color }, index) => <div key={title} className={`p-6 sm:p-8 ${index > 0 ? "border-t border-zinc-100 md:border-l md:border-t-0" : ""}`}><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}><Icon className="h-6 w-6" /></span><h2 className="mt-5 text-xl font-black text-zinc-950">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p></div>)}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8 lg:py-28">
          <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] bg-emerald-950 sm:min-h-[560px]">
            <Image src="/images/hero.jpg" alt="Perjalanan menjelajahi Subang" fill className="object-cover transition duration-700 hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9"><Camera className="h-6 w-6 text-emerald-300" /><p className="mt-4 max-w-sm text-2xl font-black leading-tight">Dari pegunungan hingga pesisir, setiap sudut punya cerita.</p></div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Mengapa kami hadir</p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.035em] text-zinc-950 sm:text-5xl">Lebih dari sekadar daftar tempat.</h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-zinc-600">
              <p>Subang memiliki lanskap, budaya, kuliner, dan kreativitas lokal yang beragam. Namun, informasi tersebut sering tersebar dan sulit ditemukan dalam satu tempat yang nyaman.</p>
              <p>Jelajah Subang menyatukannya menjadi pengalaman digital yang sederhana: pengunjung dapat mencari inspirasi, mengenal sebuah tempat lebih dekat, menemukan makanan, dan terhubung dengan pelaku lokal.</p>
              <p className="border-l-4 border-emerald-600 pl-5 font-bold text-zinc-900">Kami percaya perjalanan yang baik bukan hanya tentang tiba di tujuan, tetapi juga tentang mengenal dan memberi dampak pada tempat yang dikunjungi.</p>
            </div>
          </div>
        </section>

        <section className="bg-emerald-950 px-4 py-20 text-white sm:px-6 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Prinsip kami</p><h2 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Dibangun dengan arah yang jelas.</h2><p className="mt-4 text-base leading-7 text-white/60">Tiga prinsip ini menjadi dasar cara kami menyusun konten dan mengembangkan layanan.</p></div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {principles.map(({ icon: Icon, number, title, description }) => <article key={title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur-sm sm:p-8"><span className="absolute right-6 top-4 text-6xl font-black text-white/[0.05]">{number}</span><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950"><Icon className="h-6 w-6" /></span><h3 className="mt-7 text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-white/60">{description}</p></article>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-10 rounded-[2rem] bg-orange-100 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-14">
            <div className="max-w-3xl"><span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-orange-800"><Handshake className="h-4 w-4" />Mari berkolaborasi</span><h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-5xl">Punya cerita, destinasi, atau usaha lokal yang ingin dikenal?</h2><p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">Kami terbuka untuk kolaborasi bersama komunitas, pengelola destinasi, pelaku kuliner, UMKM, kreator, dan berbagai pihak yang ingin ikut memajukan Subang.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href="mailto:info@jelajahsubang.com" className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-black text-white transition hover:bg-emerald-800"><Mail className="h-4 w-4" />Hubungi kami</a>
              <Link href="/sharelok" className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-300 bg-white/70 px-6 py-3.5 text-sm font-black text-zinc-900 transition hover:bg-white"><Store className="h-4 w-4" />Lihat Sharelok</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
