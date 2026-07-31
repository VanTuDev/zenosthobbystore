"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchOrder } from "@/lib/api/orders";
import { formatVnd } from "@/lib/format";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/store/empty-state";
import type { ApiOrder } from "@/lib/api-types";

export function OrderConfirmationView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<ApiOrder | null | undefined>(undefined);

  useEffect(() => {
    if (!orderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no request to make without an id
      setOrder(null);
      return;
    }
    let cancelled = false;
    fetchOrder(orderId)
      .then(({ order }) => {
        if (!cancelled) setOrder(order);
      })
      .catch(() => {
        if (!cancelled) setOrder(null);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (order === undefined) return null;

  if (!order) {
    return (
      <EmptyState
        icon="receipt_long"
        title="Không tìm thấy đơn hàng"
        description="Đơn hàng không tồn tại, hoặc bạn không có quyền xem đơn hàng này."
        action={<Button href="/products">Khám phá sản phẩm</Button>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <EmptyState
        icon="check_circle"
        iconFilled
        tone="primary"
        size="lg"
        title="Đặt hàng thành công!"
        titleAs="h1"
        className="mb-xl py-0"
        description={
          <>
            Cảm ơn bạn đã tin tưởng ZENOS. Mã đơn hàng của bạn là{" "}
            <span className="font-bold text-on-surface">{order.id}</span>.
          </>
        }
      />

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="px-lg py-md border-b border-outline-variant/20 flex flex-wrap justify-between gap-sm">
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Mã đơn</p>
            <p className="font-label-md text-label-md text-on-surface font-bold">{order.id}</p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Ngày đặt</p>
            <p className="font-label-md text-label-md text-on-surface">
              {new Date(order.placedAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Thanh toán</p>
            <p className="font-label-md text-label-md text-on-surface">{order.paymentMethod}</p>
          </div>
        </div>

        <ul className="divide-y divide-outline-variant/10">
          {order.items.map((item, index) => (
            <li key={`${item.productId ?? item.slug}-${index}`} className="flex items-center gap-md px-lg py-md">
              <div className="w-16 h-16 rounded-lg bg-white border border-outline-variant/30 overflow-hidden relative shrink-0">
                <Image
                  src={item.image || "/placeholder-product.svg"}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                {item.slug ? (
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-label-md text-on-surface hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <p className="font-label-md text-on-surface line-clamp-1">{item.name}</p>
                )}
                <p className="text-label-sm text-on-surface-variant">Số lượng: {item.quantity}</p>
              </div>
              <p className="font-bold text-on-surface">{formatVnd(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="px-lg py-md bg-surface-container-low space-y-xs">
          <div className="flex justify-between text-label-md text-on-surface-variant">
            <span>Tạm tính</span>
            <span>{formatVnd(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-label-md text-on-surface-variant">
            <span>Phí vận chuyển</span>
            <span>{order.shippingFee > 0 ? formatVnd(order.shippingFee) : "Miễn phí"}</span>
          </div>
          {!!order.tax && (
            <div className="flex justify-between text-label-md text-on-surface-variant">
              <span>Thuế VAT</span>
              <span>{formatVnd(order.tax)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-label-md text-primary">
              <span>Giảm giá</span>
              <span>-{formatVnd(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-headline-sm text-headline-sm text-on-surface pt-xs border-t border-outline-variant/20 mt-xs">
            <span>Tổng cộng</span>
            <span>{formatVnd(order.total)}</span>
          </div>
        </div>

        <div className="px-lg py-md flex items-start gap-sm">
          <Icon name="location_on" className="text-primary shrink-0" />
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">
              Giao hàng đến
            </p>
            <p className="text-body-md text-on-surface">
              {order.customerName} — {order.shippingAddress}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-sm justify-center mt-lg">
        <Button href="/products">Tiếp tục mua sắm</Button>
        <Button href="/" variant="secondary">
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
