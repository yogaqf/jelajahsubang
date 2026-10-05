"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn, Menu } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
            alt="Jelajah Subang"
            width={126}
            height={100}
            priority
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
          <Button asChild className={`ml-2 rounded-full px-5 font-bold ${isTransparent ? "bg-white text-emerald-900 hover:bg-white/90" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}>
            <Link href="/sharelok/admin"><LogIn className="h-4 w-4" />Login Admin</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className={`transition-colors duration-300 ${isTransparent ? "text-white border-white/70 bg-transparent hover:bg-white/10" : "text-black border-zinc-300 bg-white/90 hover:bg-white"}`}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    asChild
                    variant="ghost"
                    className="justify-start text-black hover:bg-transparent hover:text-black"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
                <Button asChild className="mt-2 justify-start bg-emerald-700 text-white hover:bg-emerald-800">
                  <Link href="/sharelok/admin"><LogIn className="h-4 w-4" />Login Admin / CMS</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
