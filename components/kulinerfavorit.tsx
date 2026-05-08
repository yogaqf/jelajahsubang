import React from "react";
import Link from "next/link";
import { getFavoriteKulinerItems } from "@/lib/menu";
import Image from "next/image";

export function KulinerFavorit() {
      return (
            <main className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4">
                  <header>
                        <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">Kuliner Favorit</h2>
                        <p className="mt-3 max-w-2xl text-zinc-600">
                              Temukan rekomendasi kuliner khas Subang yang wajib dicoba saat berkunjung ke kota ini.
                        </p>
                  </header>
                  <section className="mt-10 grid lg:gap-6 gap-2 lg:grid-cols-4 grid-cols-2">
                        {getFavoriteKulinerItems().map((kuliner) => (
                              <article key={kuliner.id} className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
                                    <Link href={`/kuliner/${""}`}>
                                          <div className="relative aspect-4/3">
                                                <Image
                                                      src={kuliner.image}
                                                      alt={kuliner.name}
                                                      className="w-full h-full object-cover"
                                                      width={300}
                                                      height={300}
                                                      loading="lazy"
                                                />

                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                                                      <h3 className="text-xl font-semibold text-white">
                                                            {kuliner.name}
                                                      </h3>
                                                      <p className="mt-2 text-sm text-zinc-200">
                                                            {kuliner.description}
                                                      </p>
                                                </div>
                                          </div>
                                    </Link>
                              </article>
                        ))}
                  </section>
            </main>
      );
}
