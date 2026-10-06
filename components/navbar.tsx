"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
                className={`relative flex h-10 w-10 items-center justify-center transition-colors duration-300 ${isTransparent ? "text-white" : "text-zinc-950"}`}
              >
                <span className="relative h-5 w-5" aria-hidden="true">
                  <span className={`absolute left-0 top-1 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                  <span className={`absolute left-0 top-[9px] h-0.5 rounded-full bg-current transition-all duration-300 ease-out ${menuOpen ? "w-0 translate-x-2 opacity-0" : "w-3.5 opacity-100"}`} />
                  <span className={`absolute left-0 top-[15px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm border-l border-zinc-200 bg-white p-6 shadow-[-16px_0_50px_rgba(0,0,0,0.12)]">
              <SheetHeader className="border-b border-zinc-100 pb-5 text-left">
                <SheetTitle className="animate-[mobile-menu-item-in_380ms_cubic-bezier(0.22,1,0.36,1)_both] text-left text-base font-black text-zinc-950 motion-reduce:animate-none">Menu</SheetTitle>
                <p className="mt-0.5 animate-[mobile-menu-item-in_420ms_cubic-bezier(0.22,1,0.36,1)_80ms_both] text-xs text-zinc-500 motion-reduce:animate-none">Jelajah Subang</p>
              </SheetHeader>
              <nav className="mt-1 flex flex-1 flex-col gap-1 py-3">
                {navItems.map((item, index) => {
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return <SheetClose asChild key={item.label}><Link href={item.href} style={{ animationDelay: `${120 + index * 55}ms` }} className={`animate-[mobile-menu-item-in_420ms_cubic-bezier(0.22,1,0.36,1)_both] rounded-xl px-4 py-3 text-sm font-bold transition-[background-color,color,transform] duration-200 motion-reduce:animate-none ${active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:translate-x-1 hover:bg-zinc-100 hover:text-zinc-950"}`}>{item.label}</Link></SheetClose>;
                })}
              </nav>
              <p className="mt-auto animate-[mobile-menu-item-in_420ms_cubic-bezier(0.22,1,0.36,1)_420ms_both] border-t border-zinc-100 pt-5 text-xs leading-5 text-zinc-400 motion-reduce:animate-none">Wisata, kuliner, artikel, dan produk lokal Kabupaten Subang.</p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
