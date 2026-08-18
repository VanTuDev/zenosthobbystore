"use client";

import Image from "next/image";
import Link from "next/link";
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
  const selectedCanOrder = variantOutOfStock && !isPreOrder;

  return (
    <div className="mb-8 py-6 border-y border-surface-container-highest">
      {hasVariants && (
        <div className="mb-5">
          <p className="mb-3 rounded-lg bg-surface-container-low px-3 py-2 text-xs leading-5 text-on-surface-variant">
            Vui lòng đọc kỹ các chính sách trong mục{" "}
            <Link href="/faq" className="font-semibold text-primary underline underline-offset-2 hover:brightness-75">
              FAQ/Bảo hành
            </Link>
            .
          </p>
          <p className="font-label-md text-label-md text-on-surface mb-2 uppercase tracking-wider">
            Biến thể
          </p>
          <div
            className="grid max-h-[652px] grid-cols-3 gap-x-3 gap-y-4 overflow-x-hidden overflow-y-auto overscroll-contain py-1 pl-1 pr-2 scrollbar-thin sm:grid-cols-5"
            aria-label="Danh sách biến thể"
          >
            {product.variants.map((variant, index) => {
              const isActive = index === selectedVariantIndex;
              const outOfStock = variant.stockCount <= 0;
              const canOrder = outOfStock && !isPreOrder;

              return (
                <button
                  key={`${variant.name}-${index}`}
                  type="button"
                  onClick={() => onSelectVariant(index)}
                  aria-pressed={isActive}
                  className="flex min-h-[116px] w-20 justify-self-center flex-col items-center gap-1.5"
                >
                  <span
                    className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-primary shadow-sm"
                        : "border-surface-container-highest hover:border-primary/40"
                    } ${outOfStock ? "opacity-70" : ""}`}
                  >
                    {variant.image ? (
                      <Image src={variant.image} alt={variant.name} fill unoptimized sizes="80px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-surface-container-low text-on-surface-variant">
                        <Icon name="style" className="!text-[22px]" />
                      </span>
                    )}
                  </span>
                  <span className="flex w-full flex-col items-center gap-[3px]">
                    <span
                      className={`min-h-[30px] w-full text-center text-[12px] leading-[15px] line-clamp-2 ${
                        isActive ? "font-bold text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {variant.name}
                    </span>
                    {canOrder && (
                      <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-semibold leading-4 text-tertiary">
                        Có thể order
                      </span>
                    )}
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
          selectedCanOrder || isPreOrder ? "text-tertiary" : isSoldOut ? "text-outline" : "text-primary"
        }`}
      >
        <Icon name={isPreOrder || selectedCanOrder ? "calendar_today" : "inventory_2"} className="text-[18px]" />
        {selectedCanOrder
          ? "CÓ THỂ ORDER"
          : isSoldOut
            ? STOCK_LABEL.sold_out.toUpperCase()
            : isPreOrder
              ? "DỰ KIẾN VỀ HÀNG: KHOẢNG 1-2 TUẦN"
              : "CÒN HÀNG"}
      </p>
      <p className="mt-2 font-body-sm text-xs leading-relaxed text-on-surface-variant">
        Giá sản phẩm có thể thay đổi tùy thời điểm. Vui lòng liên hệ ZENOST để xác nhận thông tin mới nhất.
      </p>
    </div>
  );
}
