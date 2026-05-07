"use client";
import { Navbar } from "@/components/navbar";

export default function TentangPage() {
      return (
            <div className="min-h-screen bg-zinc-50">
                  <Navbar />
                  <main className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4">
                        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Tentang Jelajah Subang</h1>
                        <p className="mt-3 text-zinc-600">Jelajah Subang adalah platform yang didedikasikan untuk membantu wisatawan menemukan keindahan alam dan kuliner khas Subang dengan mudah.</p>
                        <section className="mt-10 space-y-6">
                              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold text-black">Misi Kami</h2>
                                    <p className="mt-4 text-zinc-700">Menyediakan informasi wisata dan kuliner yang akurat, terbaru, dan terkurasi untuk membantu wisatawan merencanakan perjalanan yang menyenangkan di Subang.</p>
                              </div>
                              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold text-black">Tim Kami</h2>
                                    <p className="mt-4 text-zinc-700">Kami adalah sekelompok pecinta wisata dan kuliner yang berkomitmen untuk berbagi keindahan Subang dengan dunia. Dengan pengalaman luas di bidang pariwisata, kami berusaha memberikan rekomendasi terbaik untuk setiap pengunjung.</p>
                              </div>
                              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold text-black">Kontak Kami</h2>
                                    <p className="mt-4 text-zinc-700">Jika Anda memiliki pertanyaan, saran, atau ingin bekerja sama dengan kami, jangan ragu untuk menghubungi kami melalui email di <a href="mailto:info@jelajahsubang.com" className="text-blue-500 hover:underline">info@jelajahsubang.com</a>.</p>
                              </div>
                        </section>
                  </main>
            </div>
      );
}
