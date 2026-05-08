import Link from "next/link";
import Image from "next/image";

import { Navbar } from "@/components/navbar";
import { destinasiPerKecamatan, kecamatanToSlug } from "@/lib/destinasi";

export default function DestinasiPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Destinasi per Kecamatan</h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Jelajahi rekomendasi tempat wisata di Kabupaten Subang berdasarkan kecamatan agar perencanaan perjalanan
            lebih mudah.
          </p>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {destinasiPerKecamatan.map((group) => (
            <article key={group.kecamatan} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-black">{group.kecamatan}</h2>
                <Link
                  href={`/destinasi/${kecamatanToSlug(group.kecamatan)}`}
                  className="text-sm font-medium text-zinc-700 hover:text-black"
                >
                  Lainnya
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.destinasi.slice(0, 2).map((item) => (
                  <div key={item.nama} className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                    <Image
                      src={`https://picsum.photos/seed/${encodeURIComponent(item.nama)}/640/360`}
                      alt={`Foto dummy ${item.nama}`}
                      width={640}
                      height={360}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-black">{item.nama}</h3>
                      <p className="mt-1 text-sm text-zinc-600">{item.kategori}</p>
                      <p className="mt-2 text-sm text-zinc-500">{item.alamatSingkat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
