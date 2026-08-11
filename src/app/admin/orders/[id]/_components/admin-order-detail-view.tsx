"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteOrder, fetchOrder } from "@/lib/api/orders";
import { formatVnd } from "@/lib/format";
import { Icon } from "@/components/ui/icon";
import { OrderStatusEditor } from "../../_components/order-status-editor";
import { OrderDetailsEditor } from "../../_components/order-details-editor";
import { OrderFulfillmentManager } from "../../_components/order-fulfillment-manager";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder } from "@/lib/api-types";

export function AdminOrderDetailView({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<ApiOrder | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!order || !window.confirm(`Xóa vĩnh viễn đơn #${(order.publicCode || order.id.slice(-6)).toUpperCase()}? Thao tác này không thể hoàn tác.`)) return;
    setDeleting(true);
    try {
      await deleteOrder(order.id);
      router.push("/admin/orders");
      router.refresh();
    } catch (err) {
      setLoadError(err instanceof ApiRequestError ? err.message : "Không thể xóa đơn hàng.");
      setDeleting(false);
    }
  }

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
            Đơn hàng #{(order.publicCode || order.id.slice(-6)).toUpperCase()}
          </h1>
          <p className="text-on-surface-variant font-body-md">
            Đặt ngày {new Date(order.placedAt).toLocaleDateString("vi-VN")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
          {order.publicCode && (
            <button
              type="button"
              onClick={async () => {
                const trackingUrl = `https://zenosthobbystore.com/theo-doi-don-hang/${order.publicCode}`;
                const message = `Shop đang đồng bộ đơn hàng lên web để dễ quản lý và khách dễ theo dõi trạng thái. Ae hãy kéo xuống dưới kiểm tra tên, chi tiết đơn hàng, số lượng, tổng tiền và tiền đặt cọc giúp mình nhé, nếu có sai sót báo lại để mình kiểm tra.\n\n(copy link mở bằng trình duyệt để theo dõi dễ hơn)\n${trackingUrl}`;
                await navigator.clipboard.writeText(message);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition hover:brightness-110"
            >
              <Icon name="share" className="!text-[16px]" />
              {copied ? "Đã sao chép nội dung" : "Copy link đơn hàng"}
            </button>
          )}
            <button type="button" disabled={deleting} onClick={() => void handleDelete()} className="inline-flex items-center gap-1.5 rounded-xl border border-error/40 px-4 py-2.5 text-sm font-bold text-error transition hover:bg-error/5 disabled:opacity-50">
              <Icon name={deleting ? "progress_activity" : "delete"} className={`!text-[17px] ${deleting ? "animate-spin" : ""}`} />
              {deleting ? "Đang xóa..." : "Xóa đơn hàng"}
            </button>
          </div>
          {loadError && <p className="mt-2 text-sm text-error">{loadError}</p>}
          {(order.sourceOrderCode || order.splitOrderCodes?.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {order.sourceOrderCode && <Link href={`/theo-doi-don-hang/${order.sourceOrderCode}`} target="_blank" className="rounded-full bg-surface-container-low px-3 py-1.5 text-primary">Tách từ đơn #{order.sourceOrderCode.toUpperCase()}</Link>}
              {order.splitOrderCodes?.map((code) => <Link key={code} href={`/theo-doi-don-hang/${code}`} target="_blank" className="rounded-full bg-surface-container-low px-3 py-1.5 text-primary">Đơn đã tách #{code.toUpperCase()}</Link>)}
            </div>
          )}
        </div>
        <OrderStatusEditor key={`${order.orderType}-${order.status}-${order.statusMode}-${order.paymentStatus}-${order.trackingCode}`} order={order} onUpdated={setOrder} />
        <OrderDetailsEditor order={order} onUpdated={setOrder} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 space-y-lg">
          <OrderFulfillmentManager order={order} onUpdated={setOrder} />
          <section className="hidden bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
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
                    {item.variantName && <p className="text-label-sm font-medium text-primary">Biến thể: {item.variantName}</p>}
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
              <div className="flex justify-between text-label-md text-primary">
                <span>Đã đặt cọc</span>
                <span>{formatVnd(order.depositAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-on-surface">
                <span>Còn lại</span>
                <span>{formatVnd(order.remainingAmount ?? order.total)}</span>
              </div>
            </div>
          </section>
          <section className="space-y-2 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 font-headline-sm text-headline-sm">Tổng kết thanh toán</h2>
            <div className="flex justify-between text-sm text-on-surface-variant"><span>Giá trị sản phẩm</span><span>{formatVnd(order.subtotal)}</span></div>
            <div className="flex justify-between border-t border-outline-variant/20 pt-2 font-bold"><span>Tổng đơn</span><span>{formatVnd(order.total)}</span></div>
            <div className="flex justify-between text-sm text-primary"><span>Đã đặt cọc</span><span>{formatVnd(order.depositAmount ?? 0)}</span></div>
            <div className="flex justify-between text-sm font-bold"><span>Còn lại</span><span>{formatVnd(order.remainingAmount ?? order.total)}</span></div>
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
                <a href={order.facebookUrl} target="_blank" rel="noopener noreferrer" className="font-label-md text-primary hover:underline">
                  {order.facebookName || order.customerName}
                </a>
                {order.phone && <p className="text-label-sm text-on-surface-variant">{order.phone}</p>}
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Giao hàng</h2>
            <p className="flex items-start gap-sm text-body-md text-on-surface-variant">
              <Icon name="location_on" className="text-primary shrink-0" />
              {order.shippingAddress || "Chưa cập nhật địa chỉ"}
            </p>
          </section>

          <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/20 space-y-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Thông tin vận chuyển</h2>
            <p className="flex items-center gap-sm text-body-md text-on-surface-variant">
              <Icon name="local_shipping" className="text-primary" />
              {order.trackingCode || "Chưa có mã vận đơn"}
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
