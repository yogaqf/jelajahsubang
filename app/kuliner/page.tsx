'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { getKulinerItems } from '@/lib/menu';



export default function KulinerPage() {
      const [kuliners] = useState(getKulinerItems());

      return (
            <>
                  <Navbar />
                  <main className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4">
                        <header>
                              <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Kuliner Khas Subang</h1>
                              <p className="mt-3 max-w-2xl text-zinc-600">
                                    Temukan berbagai kuliner khas Subang yang wajib dicoba saat berkunjung ke kota ini. Dari makanan tradisional hingga jajanan unik, jelajahi cita rasa autentik yang ditawarkan oleh kuliner lokal Subang.
                              </p>
                        </header>

                        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              {kuliners.map((kuliner) => (
                                    <div
                                          key={kuliner.id}
                                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                    >
                                          <div className="relative w-full h-48 bg-gray-200">
                                                <img
                                                      src={kuliner.image}
                                                      alt={kuliner.name}
                                                      className="w-full h-full object-cover"
                                                      loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/25 flex items-end">
                                                      <span className="text-white font-semibold px-3 py-2 text-sm">
                                                            {kuliner.price}
                                                      </span>
                                                </div>
                                          </div>

                                          <div className="p-4">
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                                      {kuliner.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                      {kuliner.description}
                                                </p>
                                                <div className="flex items-center text-orange-600 text-sm mb-4">
                                                      <span className="mr-1">📍</span>
                                                      {kuliner.location}
                                                </div>
                                                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200">
                                                      Lihat Detail
                                                </button>
                                          </div>
                                    </div>
                              ))}
                        </section>
                  </main>
            </>
      );
}
