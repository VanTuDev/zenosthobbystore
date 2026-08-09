"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import type { Product, StockStatus } from "@/lib/types";

const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: "Còn hàng",
  pre_order: "Đặt trước",
  sold_out: "Hết hàng",
  coming_soon: "Sắp ra mắt",
};

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
  const variantOutOfStock = selectedVariant ? selectedVariant.stockCount <= 0 : false;

  return (
    <div className="mb-8 py-6 border-y border-surface-container-highest">
      {hasVariants && (
        <div className="mb-5">
          <p className="font-label-md text-label-md text-on-surface mb-2 uppercase tracking-wider">
            Biến thể
          </p>
          <div
            className="grid max-h-[248px] grid-cols-3 gap-x-3 gap-y-4 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 scrollbar-thin sm:grid-cols-5"
            aria-label="Danh sách biến thể"
          >
            {product.variants.map((variant, index) => {
              const isActive = index === selectedVariantIndex;
              const outOfStock = variant.stockCount <= 0;

              return (
                <button
                  key={`${variant.name}-${index}`}
                  type="button"
                  onClick={() => onSelectVariant(index)}
                  aria-pressed={isActive}
                  className="flex w-20 justify-self-center flex-col items-center gap-1.5"
                >
                  <span
                    className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-primary shadow-sm"
                        : "border-surface-container-highest hover:border-primary/40"
                    } ${outOfStock ? "opacity-50" : ""}`}
                  >
                    {variant.image ? (
                      <Image src={variant.image} alt={variant.name} fill unoptimized sizes="80px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-surface-container-low text-on-surface-variant">
                        <Icon name="style" className="!text-[22px]" />
                      </span>
                    )}
                  </span>
                  <span
                    className={`w-full text-center text-[12px] leading-tight line-clamp-2 ${
                      isActive ? "font-bold text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {variant.name}
                    {outOfStock && " (Hết)"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-baseline gap-md mb-2 flex-wrap">
        <span className="w-full font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
          Giá tham khảo
        </span>
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
              : "CÒN HÀNG"}
      </p>
      <p className="mt-2 font-body-sm text-xs leading-relaxed text-on-surface-variant">
        Giá và tình trạng sản phẩm có thể thay đổi. Vui lòng liên hệ ZENOST để xác nhận thông tin mới nhất.
      </p>
    </div>
  );
}
