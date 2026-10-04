"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CartItem {
  id: string;
  merchantId: string;
  merchantName: string;
  areaId: string | null;
  areaName: string;
  name: string;
  imageUrl: string | null;
  price: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "qty">) => { ok: boolean; error?: string };
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  syncWithProducts: (products: Omit<CartItem, "qty">[]) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// Increment the key when the cart payload or product catalogue identity changes.
// This intentionally leaves the old demo cart behind instead of submitting its
// non-database product IDs to PostgreSQL UUID columns.
const STORAGE_KEY = "sharelok-cart-v3";
const LEGACY_STORAGE_KEY = "sharelok-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item?.id === "string" &&
        typeof item?.merchantId === "string" &&
        (typeof item?.areaId === "string" || item?.areaId === null) &&
        typeof item?.areaName === "string" &&
        typeof item?.qty === "number"
    );
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently fail
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    if (items.length > 0 && items[0].merchantId !== item.merchantId) {
      return {
        ok: false,
        error: "Selesaikan atau kosongkan keranjang dari mitra sebelumnya terlebih dahulu.",
      };
    }
    if (items.length > 0 && items[0].areaId !== item.areaId) {
      return { ok: false, error: "Keranjang berisi pesanan dari area layanan lain." };
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    return { ok: true };
  }, [items]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const syncWithProducts = useCallback((products: Omit<CartItem, "qty">[]) => {
    const byId = new Map(products.map((product) => [product.id, product]));
    setItems((prev) =>
      prev.flatMap((item) => {
        const product = byId.get(item.id);
        if (!product || product.merchantId !== item.merchantId) return [];
        return [{ ...product, qty: item.qty }];
      })
    );
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        syncWithProducts,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
