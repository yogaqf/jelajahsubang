"use client";

import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";

export default function SharelokPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 px-4">
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-emerald-700 shadow-lg">
            S
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Share<span className="text-red-400">lok</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="mb-8 max-w-sm text-base text-white/70 sm:text-lg">
          Pesan makan online, antar cepat ke seluruh Subang.
        </p>

        {/* CTA */}
        <Link
          href="/sharelok/app"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-emerald-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <ShoppingBag className="h-5 w-5" />
          Mulai Pesan
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
