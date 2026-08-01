"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchOrder } from "@/lib/api/orders";
import { formatVnd } from "@/lib/format";
import { Icon } from "@/components/ui/icon";
import { OrderStatusEditor } from "../../_components/order-status-editor";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder } from "@/lib/api-types";

export function AdminOrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<ApiOrder | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOrder(orderId)
      .then(({ order }) => {
        if (!cancelled) setOrder(order);
      })
      .catch((err) => {
        if (cancelled) return;
        setOrder(null);
        setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải đơn hàng.");
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (order === undefined) {
    return <p className="text-on-surface-variant font-body-md">Đang tải đơn hàng…</p>;
  }

  if (!order) {
    return (
      <p className="flex items-center gap-xs text-error text-label-md p-sm bg-error-container/20 rounded-lg">
        <Icon name="error" />
        {loadError ?? "Không tìm thấy đơn hàng."}
      </p>
    );
  }

  return (
    <>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors mb-sm"
      >
        <Icon name="arrow_back" className="!text-[18px]" />
        <span className="font-label-md text-label-md">Đơn hàng</span>
      </Link>

      <div className="mb-lg space-y-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-xs">
            Đơn hàng #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-on-surface-variant font-body-md">
            Đặt ngày {new Date(order.placedAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <OrderStatusEditor order={order} onUpdated={setOrder} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 space-y-lg">
          <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant/20">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Sản phẩm</h2>
            </div>
            <ul className="divide-y divide-outline-variant/10">
              {order.items.map((item, index) => (
                <li key={`${item.productId ?? item.slug}-${index}`} className="flex items-center gap-md px-lg py-md">
                  <div className="w-14 h-14 rounded-lg bg-white border border-outline-variant/30 overflow-hidden relative shrink-0">
                    <Image
                      src={item.image || "/placeholder-product.svg"}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.slug ? (
                      <Link
                        href={`/products/${item.slug}`}
                        target="_blank"
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
                  <span>Giảm giá{order.promotionCode ? ` (${order.promotionCode})` : ""}</span>
                  <span>-{formatVnd(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-headline-sm text-headline-sm text-on-surface pt-xs border-t border-outline-variant/20 mt-xs">
                <span>Tổng cộng</span>
                <span>{formatVnd(order.total)}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-lg">
          <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Khách hàng</h2>
            <div className="flex items-center gap-sm">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                {order.customerName.charAt(0)}
              </span>
              <div>
                <p className="font-label-md text-on-surface">{order.customerName}</p>
                <p className="text-label-sm text-on-surface-variant">{order.customerEmail}</p>
                <p className="text-label-sm text-on-surface-variant">{order.phone}</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Giao hàng</h2>
            <p className="flex items-start gap-sm text-body-md text-on-surface-variant">
              <Icon name="location_on" className="text-primary shrink-0" />
              {order.shippingAddress}
            </p>
          </section>

          <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Thanh toán</h2>
            <p className="flex items-center gap-sm text-body-md text-on-surface-variant">
              <Icon name="credit_card" className="text-primary" />
              {order.paymentMethod}
            </p>
            {order.paymentProvider === "payos" && (
              <p className="flex items-center gap-sm text-label-sm text-on-surface-variant">
                <Icon name="qr_code_2" className="text-primary !text-[18px]" />
                Cổng PayOS · Mã GD: {order.paymentRef}
              </p>
            )}
            {order.paidAt && (
              <p className="flex items-center gap-sm text-label-sm text-on-surface-variant">
                <Icon name="event_available" className="text-primary !text-[18px]" />
                Thanh toán lúc {new Date(order.paidAt).toLocaleString("vi-VN")}
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
