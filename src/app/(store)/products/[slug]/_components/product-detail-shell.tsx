"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ProductGallery } from "./product-gallery";
import { ProductPricePanel } from "./product-price-panel";
import { ProductCtaButtons } from "./product-cta-buttons";
import { StockNotifyForm } from "./stock-notify-form";
import type { Product } from "@/lib/types";

/**
 * Owns the state shared between the gallery (left) and the variant picker (right) — picking a
 * variant with its own image swaps the gallery's main viewer to it, so this can't be split across
 * two independent components the way ProductGallery/ProductPricePanel used to be.
 */
export function ProductDetailShell({
  product,
  isPreOrder,
  isSoldOut,
  discountPercent,
}: {
  product: Product;
  isPreOrder: boolean;
  isSoldOut: boolean;
  discountPercent: number | null;
}) {
  const [activeImage, setActiveImage] = useState(product.images[0] ?? product.heroImage);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(
    product.variants.length > 0 ? 0 : null,
  );

  function handleSelectVariant(index: number) {
    setSelectedVariantIndex(index);
    const image = product.variants[index]?.image;
    if (image) setActiveImage(image);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-xl items-start">
      <ProductGallery
        images={product.images}
        videos={product.videos}
        name={product.name}
        badgeLabel={isPreOrder ? "Pre-order" : undefined}
        activeImage={activeImage}
        onSelectImage={setActiveImage}
      />

      {/* Right: Product info & CTAs */}
      <div className="w-full lg:w-[35%] flex flex-col">
        <div className="mb-6">
          <p className="font-label-md text-label-md text-primary tracking-widest uppercase mb-2">
            Nhà sản xuất: {product.brand}
          </p>
          <h1 className="font-display-lg text-display-lg-mobile md:text-[40px] text-on-surface leading-tight mb-2">
            {product.name}
          </h1>
          <p className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">
            {product.category}
            {product.scale !== "Không tỷ lệ" ? ` ${product.scale}` : ""} | {product.universe}
          </p>
        </div>

        <ProductPricePanel
          product={product}
          isPreOrder={isPreOrder}
          isSoldOut={isSoldOut}
          discountPercent={discountPercent}
          selectedVariantIndex={selectedVariantIndex}
          onSelectVariant={handleSelectVariant}
        />

        <div className="mb-8">
          <h2 className="font-label-md text-label-md text-on-surface mb-3 uppercase tracking-wider">
            Mô tả sản phẩm
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {product.description}
          </p>
          {product.highlights.length > 0 && (
            <ul className="mt-4 space-y-2">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                  <Icon name="check_circle" className="text-primary text-[18px] mt-0.5" />
                  {highlight}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CTAs */}
        <ProductCtaButtons hasVideos={product.videos.length > 0} isSoldOut={isSoldOut} />

        {isSoldOut && <StockNotifyForm productName={product.name} />}

        {/* Trust badges */}
        <div className="space-y-4">
          <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-highest/50 flex items-start gap-4">
            <Icon name="local_shipping" className="text-primary text-[28px]" />
            <div>
              <p className="font-label-sm text-label-sm text-on-surface font-bold uppercase">
                Giao hàng &amp; Bảo quản
              </p>
              <p className="font-body-md text-[13px] text-on-surface-variant">
                Đóng gói 2 lớp hộp chống sốc chuyên dụng. Miễn phí vận chuyển cho đơn hàng đặt trước.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
