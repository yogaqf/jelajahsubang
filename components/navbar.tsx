"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "Blog", href: "/blog" },
  { label: "Destinasi", href: "/destinasi" },
  { label: "Kuliner", href: "/kuliner" },
  { label: "Shop", href: "/shop" },
  { label: "Tentang", href: "/tentang" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 w-full ${isTransparent
        ? "border-transparent bg-transparent"
        : "border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur"
        }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.PNG" alt="Jelajah Subang" width={40} height={40} />
          <Link
            href="/"
            className={`text-base font-semibold tracking-tight transition-colors duration-300 ${isTransparent ? "text-white" : "text-zinc-900"}`}
          >
            Jelajah Subang
          </Link>
        </div>


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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
