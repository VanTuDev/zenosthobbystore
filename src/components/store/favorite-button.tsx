"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { Icon } from "@/components/ui/icon";

export function FavoriteButton({
  productId,
  productName,
  disabled = false,
  size = "md",
}: {
  productId: string;
  productName: string;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const { user, openLoginModal } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);
  const [justAdded, setJustAdded] = useState(false);
  const popTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? `Bỏ yêu thích ${productName}` : `Thêm ${productName} vào yêu thích`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!user) {
          openLoginModal();
          return;
        }
        if (!active) {
          clearTimeout(popTimeout.current);
          setJustAdded(true);
          popTimeout.current = setTimeout(() => setJustAdded(false), 400);
        }
        toggleFavorite(productId);
      }}
      className={`group/fav relative rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        size === "sm" ? "p-1.5" : "p-2"
      }`}
    >
      <Icon
        name="favorite"
        filled={active}
        className={`transition-transform duration-200 group-active/fav:scale-75 ${justAdded ? "animate-pop" : ""} ${
          active
            ? "text-tertiary"
            : "text-on-surface-variant group-hover/fav:text-tertiary"
        }`}
      />
    </button>
  );
}
