"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchOrders } from "@/lib/api/orders";
import { EmptyState } from "@/components/store/empty-state";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/order-status-badge";
import { formatVnd } from "@/lib/format";
import type { ApiOrder } from "@/lib/api-types";

/** Order lookup for the "Giao hàng - Bảo hành" page — shows the signed-in customer's own orders and their status. */
export function MyOrdersSection() {
  const { user, isAuthLoading, openLoginModal } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no request to make while signed out
      setOrders(null);
      return;
    }
    let cancelled = false;
    fetchOrders({ pageSize: 50 })
      .then((res) => {
        if (!cancelled) setOrders(res.items);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isAuthLoading) return null;

  if (!user) {
    return (
      <EmptyState
        icon="lock"
        title="Đăng nhập để tra cứu đơn hàng"
        description="Đăng nhập bằng Google để xem trạng thái các đơn hàng bạn đã đặt tại ZENOS."
        action={<Button onClick={openLoginModal}>Đăng nhập với Google</Button>}
      />
    );
  }

  if (orders === null) return null;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="receipt_long"
        title="Chưa có đơn hàng nào"
        description="Các đơn hàng bạn đặt sẽ xuất hiện ở đây cùng trạng thái giao hàng và thanh toán."
        action={<Button href="/products">Khám phá sản phẩm</Button>}
      />
    );
  }

  return (
    <ul className="space-y-sm">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/order-confirmation?orderId=${order.id}`}
            className="block bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-md hover:border-primary/40 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-sm mb-xs">
              <span className="font-label-md text-label-md text-on-surface">Mã đơn: {order.id}</span>
              <div className="flex items-center gap-xs">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-sm text-label-sm text-on-surface-variant">
              <span>
                {new Date(order.placedAt).toLocaleDateString("vi-VN")} · {order.items.length} sản phẩm
              </span>
              <span className="font-bold text-on-surface">{formatVnd(order.total)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
