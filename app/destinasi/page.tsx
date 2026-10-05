import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { destinasiPerKecamatan, kecamatanToSlug } from "@/lib/destinasi";
import { getPortalEntries } from "@/lib/portal-db";

export const dynamic = "force-dynamic";

export default async function DestinasiPage() {
  const managed = await getPortalEntries({ type: "DESTINATION", publishedOnly: true });
  return <div className="min-h-screen bg-[#f7f8f4]"><Navbar /><main>
    <section className="bg-emerald-950 px-4 pb-20 pt-16 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Rencanakan perjalanan</p><h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Temukan sisi terbaik Kabupaten Subang.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/70">Dari udara pegunungan hingga pesisir utara, pilih tujuan yang cocok untuk perjalananmu.</p></div></section>
    <section className="mx-auto max-w-7xl px-4 py-16">
      {managed.length > 0 && <div className="mb-16"><h2 className="text-2xl font-black text-zinc-900">Destinasi pilihan</h2><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{managed.map((item) => <Link key={item.id} href={item.externalUrl || "#"} className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="aspect-[4/3] bg-zinc-100 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${item.imageUrl || "/images/hero.jpg"})` }} /><div className="relative bg-white p-5">{item.location && <p className="flex items-center gap-1 text-xs font-bold text-emerald-700"><MapPin className="h-3.5 w-3.5" />{item.location}</p>}<h3 className="mt-2 text-xl font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{item.summary}</p></div></Link>)}</div></div>}
      <h2 className="text-2xl font-black text-zinc-900">Jelajah per kecamatan</h2><div className="mt-7 grid gap-6 lg:grid-cols-2">{destinasiPerKecamatan.map((group) => <article key={group.kecamatan} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><h3 className="text-xl font-black">{group.kecamatan}</h3><Link href={`/destinasi/${kecamatanToSlug(group.kecamatan)}`} className="text-sm font-bold text-emerald-700">Lihat area</Link></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{group.destinasi.slice(0, 2).map((item) => <div key={item.nama} className="overflow-hidden rounded-2xl bg-zinc-50"><Image src={`https://picsum.photos/seed/${encodeURIComponent(item.nama)}/640/360`} alt={item.nama} width={640} height={360} className="h-36 w-full object-cover" /><div className="p-4"><h4 className="font-bold">{item.nama}</h4><p className="mt-1 text-xs text-zinc-500">{item.kategori} · {item.alamatSingkat}</p></div></div>)}</div></article>)}</div>
    </section>
  </main><Footer /></div>;
}
