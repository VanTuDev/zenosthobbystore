"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCart, useCartLines } from "@/components/providers/cart-provider";
import { CartLineItem } from "@/components/store/cart-line-item";
import { EmptyState } from "@/components/store/empty-state";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format";

export function CartView() {
  const { setQuantity, removeItem } = useCart();
  const { lines, isLoading } = useCartLines();

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    [lines],
  );

  if (isLoading) return null;

  if (lines.length === 0) {
    return (
      <EmptyState
        icon="shopping_cart"
        title="Giỏ hàng trống"
        description="Thêm mô hình yêu thích vào giỏ hàng để tiến hành đặt mua."
        action={<Button href="/products">Khám phá sản phẩm</Button>}
      />
    );
  }

  return (
    <>
      <p className="text-on-surface-variant font-body-md mb-lg">
        {lines.reduce((sum, line) => sum + line.quantity, 0)} sản phẩm trong giỏ hàng của bạn.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <ul className="lg:col-span-8 space-y-lg">
          {lines.map((line) => (
            <CartLineItem
              key={line.product.id}
              product={line.product}
              quantity={line.quantity}
              onIncrement={() => setQuantity(line.product.id, line.quantity + 1)}
              onDecrement={() => setQuantity(line.product.id, line.quantity - 1)}
              onRemove={() => removeItem(line.product.id)}
            />
          ))}
        </ul>

        <aside className="lg:col-span-4" aria-label="Tóm tắt giỏ hàng">
          <div className="sticky top-28 bg-surface-container-low p-lg rounded-xl border border-surface-container-highest shadow-sm">
            <h2 className="font-headline-sm text-headline-sm mb-md">Tóm tắt</h2>
            <div className="flex justify-between text-on-surface-variant mb-xs">
              <span>Tạm tính</span>
              <span>{formatVnd(subtotal)}</span>
            </div>
            <p className="text-label-sm text-on-surface-variant mb-md">
              Phí vận chuyển và mã giảm giá được áp dụng ở bước thanh toán.
            </p>
            <Button href="/checkout" className="w-full justify-center">
              Tiến hành thanh toán
            </Button>
          </div>
        </aside>
      </div>
      <div className="mt-lg">
        <Link href="/products" className="font-label-md text-label-md text-primary hover:underline">
          Tiếp tục mua sắm →
        </Link>
      </div>
    </>
  );
}
