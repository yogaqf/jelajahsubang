import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="inline-flex rounded-full border border-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700">
            Eksplorasi Wisata Subang
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl">
            Jelajahi keindahan alam dan kuliner khas Subang
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
            Temukan destinasi populer, hidden gem, dan rekomendasi kuliner lokal dalam satu tempat untuk membantu
            rencana perjalanan kamu jadi lebih mudah.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="bg-black text-white hover:bg-black">Lihat Destinasi</Button>
            <Button
              variant="outline"
              className="border-zinc-300 bg-white text-black hover:bg-white hover:text-black"
            >
              Jelajah Kuliner
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200 p-8 sm:p-10">
          <div className="rounded-xl border border-zinc-300 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black">Kenapa Jelajah Subang?</h2>
            <ul className="mt-4 space-y-3 text-zinc-700">
              <li>- Rekomendasi tempat wisata terbaru dan terkurasi</li>
              <li>- Informasi praktis: lokasi, tiket, dan jam buka</li>
              <li>- Panduan kuliner lokal favorit warga sekitar</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
