import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <main className="relative z-0 -mt-16 overflow-hidden pt-16">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
          alt="Pemandangan alam Subang"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-3xl text-white">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-medium text-white">
            Eksplorasi Wisata Subang
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Jelajahi keindahan alam dan kuliner khas Subang
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/85 sm:text-xl">
            Temukan destinasi populer, hidden gem, dan rekomendasi kuliner lokal dalam satu tempat untuk membantu
            rencana perjalanan kamu jadi lebih mudah.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button className="bg-white text-black hover:bg-white/90">Lihat Destinasi</Button>
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              Jelajah Kuliner
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
