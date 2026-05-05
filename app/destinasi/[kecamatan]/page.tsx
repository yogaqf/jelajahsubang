import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { destinasiPerKecamatan, getDestinasiByKecamatanSlug, kecamatanToSlug } from "@/lib/destinasi";

type DestinasiKecamatanPageProps = {
  params: Promise<{ kecamatan: string }>;
};

export async function generateStaticParams() {
  return destinasiPerKecamatan.map((item) => ({
    kecamatan: kecamatanToSlug(item.kecamatan),
  }));
}

export default async function DestinasiKecamatanPage({ params }: DestinasiKecamatanPageProps) {
  const { kecamatan } = await params;
  const data = getDestinasiByKecamatanSlug(kecamatan);

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4">
        <Link href="/destinasi" className="text-sm text-zinc-600">
          ← Kembali ke Destinasi
        </Link>

        <header className="mt-5">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Destinasi {data.kecamatan}</h1>
          <p className="mt-2 text-zinc-600">Daftar lengkap destinasi yang bisa kamu kunjungi di kecamatan ini.</p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.destinasi.map((item) => (
            <article key={item.nama} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <Image
                src={`https://picsum.photos/seed/${encodeURIComponent(item.nama)}/640/360`}
                alt={`Foto dummy ${item.nama}`}
                width={640}
                height={360}
                className="h-44 w-full object-cover"
              />
              <div className="p-4">
                <h2 className="font-semibold text-black">{item.nama}</h2>
                <p className="mt-1 text-sm text-zinc-600">{item.kategori}</p>
                <p className="mt-2 text-sm text-zinc-500">{item.alamatSingkat}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
