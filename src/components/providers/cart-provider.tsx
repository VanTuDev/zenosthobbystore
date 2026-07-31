"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "zenos.cart";
const MAX_QUANTITY = 9;

export type CartLine = { productId: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage, see favorites-provider for rationale.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setLines(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (!existing) {
        return [...current, { productId, quantity: Math.min(MAX_QUANTITY, quantity) }];
      }
      return current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
          : line,
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) }
              : line,
          ),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);

  const value = useMemo(
    () => ({ lines, count, addItem, removeItem, setQuantity, clear }),
    [lines, count, addItem, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export type CartProductLine = { product: Product; quantity: number };

/**
 * Joins cart lines with real product data from the backend (dropping any
 * line whose product no longer exists there), and reports whether that
 * fetch is still in flight so callers can avoid flashing an "empty cart"
 * state before the real lines arrive.
 */
export function useCartLines(): { lines: CartProductLine[]; isLoading: boolean } {
  const { lines } = useCart();
  const { products, isLoading } = useProductsByIds(lines.map((l) => l.productId));

  const productLines = useMemo(() => {
    const quantityByProductId = new Map(lines.map((l) => [l.productId, l.quantity]));
    return products.map((product) => ({ product, quantity: quantityByProductId.get(product.id) ?? 0 }));
  }, [products, lines]);

  return { lines: productLines, isLoading };
}
