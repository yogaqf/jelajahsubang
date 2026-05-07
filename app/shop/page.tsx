"use client";
import { useState } from "react";
import { Navbar } from "@/components/navbar";

interface Product {
      id: number;
      name: string;
      price: string;
      description: string;
      image: string;
}

export default function ShopPage() {
      const [products] = useState<Product[]>([
            {
                  id: 1,
                  name: "Kaos Jelajah Subang",
                  price: "Rp 150.000",
                  description: "Kaos berkualitas dengan desain eksklusif Jelajah Subang",
                  image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
            },
            {
                  id: 2,
                  name: "Tote Bag Jelajah Subang",
                  price: "Rp 100.000",
                  description: "Tote bag praktis dengan motif khas Jelajah Subang",
                  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            },
            {
                  id: 3,
                  name: "Stiker Jelajah Subang",
                  price: "Rp 20.000",
                  description: "Set stiker lucu dengan ilustrasi tempat wisata di Subang",
                  image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
            },
            {
                  id: 4,
                  name: "Mug Jelajah Subang",
                  price: "Rp 80.000",
                  description: "Mug keramik dengan desain pemandangan alam Subang yang menawan",
                  image: "https://images.unsplash.com/photo-1517686469429-8a935e1c7b9c?auto=format&fit=crop&w=800&q=80",
            },
      ]);

      return (
            <div className="min-h-screen bg-zinc-50">
                  <Navbar />
                  <main className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4">
                        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Shop Jelajah Subang</h1>
                        <p className="mt-3 text-zinc-600">Temukan merchandise eksklusif dengan desain khas Jelajah Subang.</p>
                        <section className="mt-10 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              {products.map((product) => (
                                    <div key={product.id} className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                                          <div className="relative w-full h-48 bg-gray-200">
                                                <img
                                                      src={product.image}
                                                      alt={product.name}
                                                      className="w-full h-full object-cover"
                                                      loading="lazy"
                                                />
                                          </div>
                                          <h2 className="mt-4 text-xl font-semibold text-black">{product.name}</h2>
                                          <p className="mt-2 text-zinc-600">{product.description}</p>
                                          <p className="mt-2 text-zinc-800 font-bold">{product.price}</p>
                                          <button className="mt-auto bg-black text-white hover:bg-black py-2 px-4 rounded-lg">
                                                Beli Sekarang
                                          </button>
                                    </div>
                              ))}
                        </section>
                  </main>
            </div>
      );
}