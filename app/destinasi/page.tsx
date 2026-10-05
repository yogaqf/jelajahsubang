import Link from "next/link";
import { MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { getPortalEntries } from "@/lib/portal-db";

export const dynamic = "force-dynamic";

export default async function DestinasiPage() {
  const managed = await getPortalEntries({ type: "DESTINATION", publishedOnly: true });
  return <div className="min-h-screen bg-[#f7f8f4]"><Navbar /><main>
    <section className="bg-emerald-950 px-4 pb-20 pt-16 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Rencanakan perjalanan</p><h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Temukan sisi terbaik Kabupaten Subang.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/70">Dari udara pegunungan hingga pesisir utara, pilih tujuan yang cocok untuk perjalananmu.</p></div></section>
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-2xl font-black text-zinc-900">Destinasi pilihan</h2>
      {managed.length > 0 ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{managed.map((item) => <Link key={item.id} href={item.externalUrl || "#"} className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="aspect-[4/3] bg-zinc-100 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${item.imageUrl || "/images/hero.jpg"})` }} /><div className="relative bg-white p-5">{item.location && <p className="flex items-center gap-1 text-xs font-bold text-emerald-700"><MapPin className="h-3.5 w-3.5" />{item.location}</p>}<h3 className="mt-2 text-xl font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{item.summary}</p></div></Link>)}</div> : <div className="mt-7 rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">Belum ada destinasi yang dipublikasikan dari CMS.</div>}
    </section>
  </main><Footer /></div>;
}
