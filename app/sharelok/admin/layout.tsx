"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Layers,
  Bike,
  ExternalLink,
  Menu,
  X,
  Database,
  ArrowLeft,
} from "lucide-react";

const navLinks = [
  { href: "/sharelok/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/sharelok/admin/orders", label: "Pesanan (Orders)", icon: ShoppingBag },
  { href: "/sharelok/admin/categories", label: "Kategori", icon: Layers },
  { href: "/sharelok/admin/merchants", label: "Mitra Resto / Merchant", icon: Store },
  { href: "/sharelok/admin/products", label: "Produk Menu", icon: UtensilsCrossed },
  { href: "/sharelok/admin/drivers", label: "Driver / Kurir", icon: Bike },
];

export default function SharelokAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 font-black text-white shadow-sm">
              S
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-zinc-900">
                Share<span className="text-red-500">lok</span>
              </span>
              <span className="ml-1.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                ADMIN
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Database Status indicator */}
        <div className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <Database className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span>Drizzle ORM + Neon DB</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700">
            Postgres ready with fallback sync.
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
          <div className="px-2 pb-2 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            Menu Utama
          </div>
          {navLinks.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 font-semibold text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer shortcuts */}
        <div className="border-t border-zinc-200 p-4 space-y-1.5">
          <Link
            href="/sharelok/app"
            target="_blank"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-3.5 w-3.5" />
              Buka Customer App
            </span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Jelajah Subang
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900">
              Sharelok Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Subang Delivery Hub</span>
            </div>
            <div className="flex items-center gap-2.5 border-l border-zinc-200 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white shadow-xs">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-zinc-800">Admin Pusat</div>
                <div className="text-[10px] text-zinc-400">Sharelok Subang</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
