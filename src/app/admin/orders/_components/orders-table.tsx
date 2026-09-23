"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from "@/components/ui/order-status-badge";
import { TabGroup, type Tab } from "@/components/admin/tab-group";
import { StatusDot } from "@/components/admin/status-dot";
import { PaymentProofModal } from "./payment-proof-modal";
import type { ApiOrder } from "@/lib/api-types";

export const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang xử lý" },
  { key: "shipped", label: "Đã hoàn thành" },
] as const satisfies readonly Tab<string>[];

export type StatusTabKey = (typeof STATUS_TABS)[number]["key"];

export function OrdersTable({
  orders,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isRefreshing,
  onOrderUpdated,
}: {
  orders: ApiOrder[];
  activeTab: StatusTabKey;
  onTabChange: (tab: StatusTabKey) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isRefreshing: boolean;
  onOrderUpdated: (order: ApiOrder) => void;
}) {
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [proofOrder, setProofOrder] = useState<ApiOrder | null>(null);

  async function copyShareLink(order: ApiOrder) {
    if (!order.publicCode) return;
    const trackingUrl = `https://zenosthobbystore.com/theo-doi-don-hang/${order.publicCode}`;
    const message = `Đây là link theo dõi trên website. Bạn vui lòng vào link để điền đầy đủ thông tin chính xác, tiếp theo là thời gian và trạng thái đơn hàng. Sau đó kéo xuống kiểm tra chi tiết đơn hàng: Sản phẩm, giá tiền, số tiền đã đặt cọc...\n\n(Copy và mở trong trình duyệt để dễ thao tác)\n(Link): ${trackingUrl}`;
    await navigator.clipboard.writeText(message);
    setCopiedOrderId(order.id);
    window.setTimeout(() => setCopiedOrderId((current) => current === order.id ? null : current), 1800);
  }

  return (
    <>
    <section className="bg-surface-container-lowest rounded-lg border border-outline-variant/40 overflow-hidden">
      <div className="px-md py-sm border-b border-outline-variant/40 flex flex-wrap gap-sm justify-between items-center bg-surface-container-low">
        <h3 className="font-label-md text-label-md text-on-surface font-bold">Danh sách đơn hàng</h3>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {isRefreshing && <span className="inline-flex items-center gap-1 text-xs text-primary"><Icon name="progress_activity" className="animate-spin !text-[16px]" />Đang tìm…</span>}
          <label className="relative min-w-[220px] sm:max-w-xs sm:flex-1"><Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant !text-[17px]" /><input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm theo tên Facebook..." className="w-full rounded-lg bg-white py-2 pl-9 pr-9 text-sm outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary" />{searchQuery && <button type="button" onClick={() => onSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-on-surface-variant hover:text-primary" aria-label="Xóa từ khóa tìm kiếm"><Icon name="close" className="!text-[16px]" /></button>}</label>
          <TabGroup tabs={STATUS_TABS} active={activeTab} onChange={onTabChange} size="sm" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wide font-bold">
              <th className="w-12 border border-outline-variant/30 px-2 py-xs text-center whitespace-nowrap">Share</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Khách hàng</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">SL SP</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">Tổng tiền</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">Tiền cọc</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">Còn lại</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Thanh toán</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-center">Giao dịch</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Trạng thái</th>
              <th className="px-sm py-xs border border-outline-variant/30 w-8" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => {
              const statusMeta = ORDER_STATUS_META[order.status];
              const paymentMeta = PAYMENT_STATUS_META[order.paymentStatus];
              return (
                <tr
                  key={order.id}
                  className={`hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-surface-container-low/40" : ""}`}
                >
                  <td className="border border-outline-variant/30 px-2 py-xs text-center">
                    <button type="button" disabled={!order.publicCode} onClick={() => void copyShareLink(order)} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${copiedOrderId === order.id ? "bg-[#dcfce7] text-[#15803d]" : "text-primary hover:bg-primary/10"} disabled:cursor-not-allowed disabled:opacity-30`} aria-label={`Sao chép link đơn ${(order.publicCode || order.id.slice(-6)).toUpperCase()}`} title={copiedOrderId === order.id ? "Đã sao chép" : "Sao chép link theo dõi"}>
                      <Icon name={copiedOrderId === order.id ? "check" : "share"} className="!text-[18px]" />
                    </button>
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface whitespace-nowrap">
                    {order.facebookName || order.customerName}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant text-right">
                    {order.items.reduce((sum, i2) => sum + i2.quantity, 0)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 font-bold text-on-surface text-right whitespace-nowrap">
                    {formatVnd(order.total)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 font-medium text-primary text-right whitespace-nowrap">
                    {formatVnd(order.depositAmount ?? 0)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 font-medium text-on-surface text-right whitespace-nowrap">
                    {formatVnd(Math.max(0, order.total - (order.depositAmount ?? 0)))}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30">
                    <StatusDot tone={paymentMeta.tone} label={paymentMeta.label} />
                  </td>
                  <td className="px-2 py-xs border border-outline-variant/30 text-center">
                    <button
                      type="button"
                      onClick={() => setProofOrder(order)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold transition-colors ${
                        order.paymentProofImages?.length
                          ? "bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0]"
                          : "border border-primary/25 text-primary hover:bg-primary/5"
                      }`}
                      title={order.paymentProofImages?.length ? "Xem hoặc quản lý ảnh giao dịch" : "Thêm ảnh giao dịch"}
                    >
                      <Icon name={order.paymentProofImages?.length ? "photo_library" : "add_photo_alternate"} className="!text-[17px]" />
                      {order.paymentProofImages?.length ? `${order.paymentProofImages.length} ảnh` : "Thêm ảnh"}
                    </button>
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30">
                    <StatusDot tone={statusMeta.tone} label={statusMeta.label} />
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-on-surface-variant hover:text-primary transition-colors inline-flex"
                      aria-label={`Xem chi tiết đơn ${order.id}`}
                    >
                      <Icon name="chevron_right" className="!text-[18px]" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={10} className="px-md py-lg border border-outline-variant/30 text-center text-on-surface-variant font-body-md">
                  Không có đơn hàng nào ở trạng thái này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-md py-xs bg-surface-container-low flex flex-wrap justify-between items-center gap-2 border-t border-outline-variant/40">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Hiển thị {orders.length} trên {total} đơn hàng
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            Hiển thị
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-lg border border-outline-variant/50 bg-white px-2 text-xs text-on-surface outline-none focus:border-primary"
              aria-label="Số đơn hàng hiển thị trên một trang"
            >
              {[10, 20, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            đơn
          </label>
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface-variant hover:bg-white disabled:cursor-not-allowed disabled:opacity-35" aria-label="Trang trước"><Icon name="chevron_left" className="!text-[18px]" /></button>
          <span className="min-w-20 text-center text-xs font-medium text-on-surface-variant">Trang {page}/{totalPages}</span>
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface-variant hover:bg-white disabled:cursor-not-allowed disabled:opacity-35" aria-label="Trang sau"><Icon name="chevron_right" className="!text-[18px]" /></button>
        </div>
      </div>
    </section>
    {proofOrder && (
      <PaymentProofModal
        order={proofOrder}
        onClose={() => setProofOrder(null)}
        onUpdated={(updatedOrder) => {
          setProofOrder(updatedOrder);
          onOrderUpdated(updatedOrder);
        }}
      />
    )}
    </>
  );
}
