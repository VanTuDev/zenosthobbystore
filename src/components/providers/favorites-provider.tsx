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
import { useAuth } from "@/components/providers/auth-provider";
import { apiFetch } from "@/lib/api-client";

type FavoritesContextValue = {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      setFavoriteIds([]);
      return;
    }

    let cancelled = false;
    apiFetch<{ favoriteIds: string[] }>("/favorites")
      .then((body) => {
        if (!cancelled) setFavoriteIds(body.favoriteIds);
      })
      .catch((error) => console.error("Không thể tải danh sách yêu thích:", error));

    return () => {
      cancelled = true;
    };
  }, [user, isAuthLoading]);

  const toggleFavorite = useCallback((productId: string) => {
    const previous = favoriteIds;
    setFavoriteIds(
      previous.includes(productId) ? previous.filter((id) => id !== productId) : [...previous, productId],
    );

    apiFetch<{ favoriteIds: string[] }>(`/favorites/${encodeURIComponent(productId)}`, { method: "PUT" })
      .then((body) => setFavoriteIds(body.favoriteIds))
      .catch((error) => {
        setFavoriteIds(previous);
        console.error("Không thể cập nhật sản phẩm yêu thích:", error);
      });
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
