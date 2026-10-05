import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-950 px-4 py-10">
    <Image src="/images/hero.jpg" alt="" fill priority className="object-cover opacity-25" />
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-950/90 to-zinc-950/80" />
    <div className="relative z-10 w-full max-w-md">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-white/65 hover:text-white"><ArrowLeft className="h-4 w-4" />Kembali ke Jelajah Subang</Link>
      <section className="rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><ShieldCheck className="h-6 w-6" /></span><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Akses terbatas</p><h1 className="text-2xl font-black tracking-tight text-zinc-950">Login Admin</h1></div></div>
        <p className="mt-5 text-sm leading-6 text-zinc-500">Masuk untuk mengelola portal Jelajah Subang, pesanan Sharelok, merchant, driver, dan laporan.</p>
        <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-2xl bg-zinc-100" />}><AdminLoginForm /></Suspense>
        <p className="mt-5 text-center text-[10px] leading-5 text-zinc-400">Sesi login aman selama 8 jam dan akan berakhir otomatis.</p>
      </section>
    </div>
  </main>;
}
