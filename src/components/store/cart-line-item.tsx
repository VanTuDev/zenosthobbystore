import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import type { Product } from "@/lib/types";

export function CartLineItem({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
  size = "md",
}: {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  size?: "sm" | "md";
}) {
  const imageSize = size === "sm" ? 80 : 112;

  return (
    <li className="flex gap-md">
      <Link
        href={`/products/${product.slug}`}
        className="bg-white rounded-lg overflow-hidden shrink-0 border border-surface-container-highest/50"
        style={{ width: imageSize, height: imageSize }}
      >
        <Image
          src={product.heroImage}
          alt={product.name}
          width={imageSize}
          height={imageSize}
          unoptimized={product.heroImage.startsWith("blob:")}
          className="w-full h-full object-contain p-2"
        />
      </Link>
      <div className="flex-grow min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-sm">
          <Link
            href={`/products/${product.slug}`}
            className={`font-label-md text-on-surface line-clamp-2 hover:text-primary transition-colors ${size === "sm" ? "text-label-sm" : "text-label-md"}`}
          >
            {product.name}
          </Link>
          <button
            type="button"
            aria-label={`Xóa ${product.name} khỏi giỏ hàng`}
            onClick={onRemove}
            className="shrink-0 p-1 rounded-full text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 transition-colors"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>
        <span className="text-label-sm text-outline uppercase tracking-tighter mt-1">
          {product.brand}
        </span>
        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="flex items-center gap-xs">
            <button
              type="button"
              aria-label={`Giảm số lượng ${product.name}`}
              onClick={onDecrement}
              className="w-6 h-6 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <Icon name="remove" className="text-sm" />
            </button>
            <span className="text-sm font-medium w-4 text-center">{quantity}</span>
            <button
              type="button"
              aria-label={`Tăng số lượng ${product.name}`}
              onClick={onIncrement}
              className="w-6 h-6 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <Icon name="add" className="text-sm" />
            </button>
          </div>
          <span className="font-bold text-on-surface">{formatVnd(product.price * quantity)}</span>
        </div>
      </div>
    </li>
  );
}
