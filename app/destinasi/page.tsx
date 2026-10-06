import type { Metadata } from "next";
import Image from "next/image";
import { MapPinned } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { DestinationCard } from "@/components/destination-card";
import { getPortalEntries } from "@/lib/portal-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinasi Wisata Subang",
  description: "Temukan destinasi wisata Kabupaten Subang berdasarkan kecamatan, dari kawasan pegunungan hingga pesisir.",
  alternates: { canonical: "/destinasi" },
  openGraph: { title: "Destinasi Wisata Subang", description: "Temukan tempat menarik dan rencanakan perjalananmu di Kabupaten Subang.", url: "/destinasi" },
};

export default async function DestinasiPage() {
  const managed = await getPortalEntries({ type: "DESTINATION", publishedOnly: true });
  const destinationsByDistrict = managed.reduce<Record<string, typeof managed>>((groups, destination) => {
    const district = destination.location?.trim() || "Kecamatan lainnya";
    (groups[district] ||= []).push(destination);
    return groups;
  }, {});
  return <div className="min-h-screen bg-[#f7f8f4]"><Navbar /><main>
    <section className="relative overflow-hidden bg-white px-4 pb-20 pt-16 text-zinc-950 sm:px-6 sm:pb-24 sm:pt-20">
      <Image src="/images/IMG_9714.PNG" alt="" fill sizes="100vw" quality={75} preload className="object-cover object-[72%_center]" />
      <div className="relative mx-auto max-w-7xl" style={{ textShadow: "0 1px 2px rgba(255,255,255,0.98), 0 0 14px rgba(255,255,255,0.92)" }}><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Wilujeng Sumping</p><h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Jelajahi Destinasi Menarik lainnya di Subang.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-zinc-700">Dari udara pegunungan hingga pesisir utara, pilih tujuan yang cocok untuk perjalananmu.</p></div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Jelajah per wilayah</p><h2 className="mt-2 text-3xl font-black text-zinc-900">Destinasi berdasarkan kecamatan</h2><p className="mt-2 text-sm text-zinc-500">Pilih kecamatan untuk menemukan tempat menarik di kawasan yang sama.</p></div>
      {managed.length > 0 ? <div className="mt-12 space-y-14">{Object.entries(destinationsByDistrict).map(([district, destinations]) => <section key={district}>
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-zinc-200 pb-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><MapPinned className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Kecamatan</p><h3 className="text-xl font-black text-zinc-950">{district}</h3></div></div><span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-zinc-500 shadow-sm">{destinations.length} destinasi</span></div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">{destinations.map((item) => <DestinationCard key={item.id} title={item.title} summary={item.summary || ""} description={item.content || item.summary || ""} district={district} imageUrl={item.imageUrl || "/images/hero.jpg"} ctaLabel={item.ctaLabel} ctaUrl={item.externalUrl} />)}</div>
      </section>)}</div> : <div className="mt-7 rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">Belum ada destinasi yang dipublikasikan dari CMS.</div>}
    </section>
  </main><Footer /></div>;
}
