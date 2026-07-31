"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { Icon } from "@/components/ui/icon";

export function CartNavLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Giỏ hàng${count ? `, ${count} sản phẩm` : ""}`}
      className="relative text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
    >
      <Icon name="shopping_cart" filled={count > 0} className={count > 0 ? "text-primary" : undefined} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-tertiary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
