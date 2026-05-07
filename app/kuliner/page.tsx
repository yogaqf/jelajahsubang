'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';

interface KulinerItem {
      id: number;
      name: string;
      description: string;
      image: string;
      location: string;
      price: string;
}

export default function KulinerPage() {
      const [kuliners] = useState<KulinerItem[]>([
            {
                  id: 1,
                  name: 'Soto Subang',
                  description: 'Soto tradisional khas Subang dengan rempah-rempah pilihan',
                  image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
                  location: 'Jl. Pendidikan',
                  price: 'Rp 25.000',
            },
            {
                  id: 2,
                  name: 'Mie Kocok',
                  description: 'Mie kuah tradisional dengan tofu goreng dan daging sapi',
                  image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
                  location: 'Jl. Sudirman',
                  price: 'Rp 20.000',
            },
            {
                  id: 3,
                  name: 'Nasi Kuning',
                  description: 'Nasi kuning gurih dengan lauk pauk lengkap',
                  image: 'https://images.unsplash.com/photo-1504674900247-0b9c9d5989a2?auto=format&fit=crop&w=800&q=80',
                  location: 'Jl. Ahmad Yani',
                  price: 'Rp 30.000',
            },
            {
                  id: 4,
                  name: 'Bakso Subang',
                  description: 'Bakso daging sapi premium dengan kuah yang nikmat',
                  image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
                  location: 'Jl. Gatot Subroto',
                  price: 'Rp 28.000',
            },
            {
                  id: 5,
                  name: 'Cireng Sambal',
                  description: 'Cireng renyah dengan sambal khas Subang',
                  image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
                  location: 'Jl. H. Nawawi',
                  price: 'Rp 18.000',
            },
            {
                  id: 6,
                  name: 'Karedok',
                  description: 'Salad sayur segar dengan bumbu kacang pedas dan manis',
                  image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
                  location: 'Jl. Veteran',
                  price: 'Rp 22.000',
            },
            {
                  id: 7,
                  name: 'Es Campur',
                  description: 'Minuman segar berisi buah, jelly, dan es serut',
                  image: 'https://images.unsplash.com/photo-1521302080390-8d2bcdb29cc4?auto=format&fit=crop&w=800&q=80',
                  location: 'Jl. Cibogo',
                  price: 'Rp 15.000',
            },
            {
                  id: 8,
                  name: 'Tahu Gejrot',
                  description: 'Tahu goreng kecil disajikan dengan kuah manis pedas',
                  image: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=800&q=80',
                  location: 'Jl. Raya Subang',
                  price: 'Rp 12.000',
            },
      ]);

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
