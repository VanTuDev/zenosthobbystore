"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFavorites } from "@/components/providers/favorites-provider";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids";

const PREVIEW_LIMIT = 4;

export function WishlistNavLink() {
  const { favoriteIds } = useFavorites();
  const { products: favoriteProducts } = useProductsByIds(favoriteIds.slice(0, PREVIEW_LIMIT));
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const remaining = favoriteIds.length - favoriteProducts.length;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Sản phẩm yêu thích${favoriteIds.length ? `, ${favoriteIds.length} sản phẩm` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
      >
        <Icon name="favorite" filled={favoriteIds.length > 0} className={favoriteIds.length > 0 ? "text-tertiary" : undefined} />
        {favoriteIds.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-tertiary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {favoriteIds.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="fixed left-4 right-4 top-16 mt-sm overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-2xl z-50 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-80"
        >
          <div className="px-md py-sm border-b border-outline-variant/20">
            <p className="font-label-md text-label-md text-on-surface font-bold">Sản phẩm yêu thích</p>
          </div>

          {favoriteProducts.length === 0 ? (
            <div className="p-lg flex flex-col items-center text-center gap-sm">
              <Icon name="favorite_border" className="text-on-surface-variant text-[32px]" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                Chưa có sản phẩm yêu thích nào.
              </p>
            </div>
          ) : (
            <ul className="p-xs max-h-96 overflow-y-auto">
              {favoriteProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-sm px-sm py-xs rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-outline-variant/20">
                      <Image
                        src={product.heroImage}
                        alt={product.name}
                        width={48}
                        height={48}
                        unoptimized={product.heroImage.startsWith("blob:")}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-label-sm text-on-surface line-clamp-1">
                        {product.name}
                      </p>
                      <p className="font-bold text-label-sm text-primary">{formatVnd(product.price)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {remaining > 0 && (
            <p className="px-md pb-xs text-label-sm text-on-surface-variant">
              và {remaining} sản phẩm khác...
            </p>
          )}

          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-xs px-md py-sm border-t border-outline-variant/20 font-label-md text-label-md text-primary hover:bg-surface-container-low transition-colors"
          >
            Xem tất cả
            <Icon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      )}
    </div>
  );
}
