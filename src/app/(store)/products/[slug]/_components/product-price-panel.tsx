"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import type { Product, ProductVariant, StockStatus } from "@/lib/types";

const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: "Còn hàng",
  pre_order: "Đặt trước",
  sold_out: "Hết hàng",
  coming_soon: "Sắp ra mắt",
};

type IndexedVariant = { variant: ProductVariant; index: number };

/**
 * Below `singleRowMax` items, one row is enough. Above it, split into exactly 2 rows (never 3+)
 * as evenly as possible — each row still scrolls horizontally on its own if it's still too wide.
 */
function splitVariantRows(items: IndexedVariant[], singleRowMax: number): IndexedVariant[][] {
  if (items.length <= singleRowMax) return [items];
  const firstRowCount = Math.ceil(items.length / 2);
  return [items.slice(0, firstRowCount), items.slice(firstRowCount)];
}

export function ProductPricePanel({
  product,
  isPreOrder,
  isSoldOut,
  discountPercent,
  selectedVariantIndex,
  onSelectVariant,
}: {
  product: Product;
  isPreOrder: boolean;
  isSoldOut: boolean;
  discountPercent: number | null;
  /** Controlled from the parent shell — selecting a variant can also swap the gallery's main image. */
  selectedVariantIndex: number | null;
  onSelectVariant: (index: number) => void;
}) {
  const hasVariants = product.variants.length > 0;
  const selectedVariant = hasVariants && selectedVariantIndex !== null ? product.variants[selectedVariantIndex] : null;

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayStockCount = selectedVariant ? selectedVariant.stockCount : product.stockCount;
  const variantOutOfStock = selectedVariant ? selectedVariant.stockCount <= 0 : false;

  const indexedVariants = product.variants.map((variant, index) => ({ variant, index }));
  const mobileRows = splitVariantRows(indexedVariants, 4);
  const desktopRows = splitVariantRows(indexedVariants, 5);

  function renderTile({ variant, index }: IndexedVariant) {
    const isActive = index === selectedVariantIndex;
    const outOfStock = variant.stockCount <= 0;
    return (
      <button
        key={`${variant.name}-${index}`}
        type="button"
        onClick={() => onSelectVariant(index)}
        aria-pressed={isActive}
        className="shrink-0 w-20 flex flex-col items-center gap-1.5"
      >
        <span
          className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
            isActive ? "border-primary shadow-sm" : "border-surface-container-highest hover:border-primary/40"
          } ${outOfStock ? "opacity-50" : ""}`}
        >
          {variant.image ? (
            <Image src={variant.image} alt={variant.name} fill unoptimized sizes="80px" className="object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center bg-surface-container-low text-on-surface-variant">
              <Icon name="style" className="!text-[22px]" />
            </span>
          )}
        </span>
        <span
          className={`w-full text-center text-[12px] leading-tight line-clamp-2 ${
            isActive ? "text-primary font-bold" : "text-on-surface-variant"
          }`}
        >
          {variant.name}
          {outOfStock && " (Hết)"}
        </span>
      </button>
    );
  }

  function renderRows(rows: IndexedVariant[][]) {
    return (
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {row.map(renderTile)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 py-6 border-y border-surface-container-highest">
      {hasVariants && (
        <div className="mb-5">
          <p className="font-label-md text-label-md text-on-surface mb-2 uppercase tracking-wider">
            Biến thể
          </p>
          {/* Row-split threshold differs by breakpoint (4 on phones, 5 on tablet/desktop), so both
              layouts render and CSS picks the right one — the split itself isn't achievable with
              pure flex-wrap since the two breakpoints group the same variants differently. */}
          <div className="sm:hidden">{renderRows(mobileRows)}</div>
          <div className="hidden sm:block">{renderRows(desktopRows)}</div>
        </div>
      )}

      <div className="flex items-baseline gap-md mb-2 flex-wrap">
        <span className="font-display-lg text-[36px] text-on-surface">{formatVnd(displayPrice)}</span>
        {!hasVariants && product.compareAtPrice && (
          <span className="font-body-md text-body-md text-on-surface-variant line-through">
            {formatVnd(product.compareAtPrice)}
          </span>
        )}
        {!hasVariants && discountPercent !== null && (
          <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded font-label-md text-label-sm">
            -{discountPercent}%
          </span>
        )}
      </div>
      <p
        className={`font-label-md text-label-md flex items-center gap-1 ${
          isSoldOut || variantOutOfStock ? "text-outline" : isPreOrder ? "text-tertiary" : "text-primary"
        }`}
      >
        <Icon name={isPreOrder ? "calendar_today" : "inventory_2"} className="text-[18px]" />
        {isSoldOut
          ? STOCK_LABEL.sold_out.toUpperCase()
          : variantOutOfStock
            ? "BIẾN THỂ NÀY TẠM HẾT HÀNG"
            : isPreOrder
              ? "DỰ KIẾN PHÁT HÀNH: SẮP CẬP NHẬT"
              : `CÒN ${displayStockCount} SẢN PHẨM`}
      </p>
    </div>
  );
}
