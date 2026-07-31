import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/components/store/favorite-button";
import type { Product, ProductBadge } from "@/lib/types";
import { formatVnd } from "@/lib/format";

const BADGE_LABELS: Record<ProductBadge, string> = {
  pre_order: "Đặt trước",
  limited: "Giới hạn",
  best_seller: "Bán chạy",
  new_arrival: "Mới về lại",
  exclusive: "Độc quyền",
  sold_out: "Hết hàng",
  recommended: "Gợi ý",
};

const BADGE_CLASSES: Record<ProductBadge, string> = {
  pre_order: "bg-primary text-white",
  limited: "bg-tertiary-container text-on-tertiary-container",
  best_seller: "bg-on-surface-variant text-white",
  new_arrival: "bg-secondary text-white",
  exclusive: "bg-primary text-white",
  sold_out: "bg-tertiary text-white",
  recommended: "bg-on-surface-variant text-white",
};

export function ProductCard({ product }: { product: Product }) {
  const isSoldOut = product.stockStatus === "sold_out";

  return (
    <article className="group relative flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 pb-md shadow-sm transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-outline-variant/50 hover:shadow-xl">
      <Link
        href={`/products/${product.slug}`}
        className="relative overflow-hidden bg-white mb-sm aspect-square p-md block"
      >
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          unoptimized={product.heroImage.startsWith("blob:")}
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`object-contain transition-transform duration-700 ease-premium ${isSoldOut ? "" : "group-hover:scale-110"}`}
        />
        {product.badges.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-col gap-xs">
            {product.badges
              .filter((b) => b !== "sold_out")
              .map((badge) => (
                <span
                  key={badge}
                  className={`px-3 py-1 text-label-sm rounded-full uppercase shadow-sm ${BADGE_CLASSES[badge]}`}
                >
                  {BADGE_LABELS[badge]}
                </span>
              ))}
            {isSoldOut && (
              <span className={`px-3 py-1 text-label-sm rounded-full uppercase shadow-sm ${BADGE_CLASSES.sold_out}`}>
                {BADGE_LABELS.sold_out}
              </span>
            )}
          </div>
        )}
        {!isSoldOut && (
          <span className="absolute inset-0 flex items-end justify-center pb-md bg-linear-to-t from-black/45 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-white text-on-surface px-lg py-sm rounded-full font-label-md text-label-sm uppercase tracking-widest shadow-xl transition-transform duration-300 ease-premium translate-y-3 group-hover:translate-y-0">
              Xem nhanh
            </span>
          </span>
        )}
      </Link>
      <div className="px-md">
        <span className="text-label-sm text-outline uppercase tracking-tighter">{product.brand}</span>
        <h3 className="mt-1 mb-base min-h-24">
          <Link
            href={`/products/${product.slug}`}
            className="font-headline-sm text-[18px] leading-6 text-on-surface line-clamp-4 tracking-tight hover:text-primary transition-colors duration-200"
          >
            {product.name}
          </Link>
        </h3>
        <div className={`flex items-end justify-between transition-opacity duration-300 ${isSoldOut ? "opacity-50" : ""}`}>
          <div className="flex flex-col min-h-12 justify-end">
            <span
              className={`text-on-surface-variant line-through text-label-sm ${product.compareAtPrice ? "" : "invisible"}`}
            >
              {formatVnd(product.compareAtPrice ?? product.price)}
            </span>
            <span
              className={`font-bold ${product.compareAtPrice ? "text-headline-md text-primary" : "text-headline-md text-on-background"}`}
            >
              {formatVnd(product.price)}
            </span>
          </div>
          <FavoriteButton productId={product.id} productName={product.name} disabled={isSoldOut} />
        </div>
      </div>
    </article>
  );
}
