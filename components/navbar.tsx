"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Compass, UtensilsCrossed } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "Blog", href: "/blog" },
  { label: "Destinasi", href: "/destinasi" },
  { label: "Kuliner", href: "/sharelok" },
  { label: "Shop", href: "/shop" },
  { label: "Tentang", href: "/tentang" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled((current) => current ? window.scrollY > 64 : window.scrollY > 96);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-out ${isTransparent
        ? "bg-white/0 shadow-none backdrop-blur-none"
        : "bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md"
        }`}
    >
      <div className={`mx-auto flex h-16 w-full min-w-0 max-w-7xl items-center justify-between gap-2 transition-[padding] duration-500 ease-out ${isTransparent ? "px-5 sm:px-8" : "px-3 sm:px-4"}`}>
        <Link href="/" aria-label="Jelajah Subang" className="flex min-w-0 items-center gap-2">
          <Image
            src="/images/logo.PNG"
            alt=""
            width={126}
            height={100}
            className={`shrink-0 object-contain transition-[width,height,transform] duration-500 ease-out ${isTransparent ? "h-28 w-[141px] translate-y-8 sm:h-32 sm:w-[161px]" : "h-10 w-[50px] translate-y-0"}`}
          />
          <span className={`overflow-hidden whitespace-nowrap text-base font-semibold tracking-tight transition-[max-width,opacity,transform,color] duration-500 ease-out ${isTransparent ? "max-w-0 -translate-x-2 opacity-0 text-white" : "max-w-40 translate-x-0 opacity-100 text-zinc-900"}`}>
            Jelajah Subang
          </span>
        </Link>


        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={`transition-colors duration-300 ${isTransparent
                ? "text-white hover:bg-white/10 hover:text-white"
                : "text-black hover:bg-transparent hover:text-black"
                }`}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
                aria-expanded={menuOpen}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-all duration-300 ${isTransparent ? "border-white/45 bg-black/10 text-white backdrop-blur-md hover:bg-white/15" : "border-zinc-200 bg-white text-zinc-950 hover:border-emerald-300 hover:bg-emerald-50"}`}
              >
                <span className="relative h-5 w-5" aria-hidden="true">
                  <span className={`absolute left-0 top-1 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                  <span className={`absolute left-0 top-[9px] h-0.5 rounded-full bg-current transition-all duration-300 ease-out ${menuOpen ? "w-0 translate-x-2 opacity-0" : "w-3.5 opacity-100"}`} />
                  <span className={`absolute left-0 top-[15px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" showCloseButton={false} className="w-[min(88vw,370px)] border-l-0 bg-[#f7f8f4] p-0 shadow-[-24px_0_70px_rgba(0,0,0,0.18)]">
              <SheetHeader className="relative overflow-hidden bg-emerald-950 px-6 pb-7 pt-6 text-left text-white">
                <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-3" aria-label="Kembali ke beranda">
                    <Image src="/images/logo.PNG" alt="" width={64} height={52} className="h-12 w-16 object-contain" />
                    <div><SheetTitle className="text-left text-base font-black text-white">Jelajah Subang</SheetTitle><p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Temukan cerita lokal</p></div>
                  </Link>
                  <SheetClose asChild><button type="button" aria-label="Tutup menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"><span className="relative h-4 w-4"><span className="absolute left-0 top-[7px] h-0.5 w-4 rotate-45 rounded-full bg-current" /><span className="absolute left-0 top-[7px] h-0.5 w-4 -rotate-45 rounded-full bg-current" /></span></button></SheetClose>
                </div>
                <p className="relative mt-5 max-w-xs text-sm leading-6 text-emerald-50/70">Wisata, kuliner, artikel, dan produk lokal Kabupaten Subang dalam satu tempat.</p>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-2 px-4 py-5">
                {navItems.map((item, index) => {
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return <SheetClose asChild key={item.label}><Link href={item.href} className={`group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${active ? "bg-emerald-700 text-white shadow-lg shadow-emerald-900/15" : "text-zinc-700 hover:translate-x-1 hover:bg-white hover:text-emerald-800 hover:shadow-sm"}`}><span className={`flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-black ${active ? "bg-white/15 text-white" : "bg-emerald-100 text-emerald-800"}`}>{String(index + 1).padStart(2, "0")}</span><span className="flex-1">{item.label}</span><ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${active ? "text-emerald-200" : "text-zinc-300"}`} /></Link></SheetClose>;
                })}
              </nav>
              <div className="m-4 mt-auto rounded-3xl bg-[#180d08] p-5 text-white shadow-xl shadow-orange-950/10"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-300"><UtensilsCrossed className="h-4 w-4" />Lagi lapar?</div><p className="mt-2 text-sm leading-6 text-white/70">Pesan menu lokal favoritmu melalui Sharelok.</p><SheetClose asChild><Link href="/sharelok" className="mt-4 flex items-center justify-between rounded-xl bg-orange-400 px-4 py-3 text-xs font-black text-zinc-950">Buka Sharelok<Compass className="h-4 w-4" /></Link></SheetClose></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
