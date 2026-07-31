"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from "@/components/ui/order-status-badge";
import { TabGroup, type Tab } from "@/components/admin/tab-group";
import { StatusDot } from "@/components/admin/status-dot";
import type { ApiOrder } from "@/lib/api-types";

export const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xử lý" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipped", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
] as const satisfies readonly Tab<string>[];

export type StatusTabKey = (typeof STATUS_TABS)[number]["key"];

function formatDateVn(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export function OrdersTable({
  orders,
  activeTab,
  onTabChange,
  total,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: {
  orders: ApiOrder[];
  activeTab: StatusTabKey;
  onTabChange: (tab: StatusTabKey) => void;
  total: number;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <section className="bg-surface-container-lowest rounded-lg border border-outline-variant/40 overflow-hidden">
      <div className="px-md py-sm border-b border-outline-variant/40 flex flex-wrap gap-sm justify-between items-center bg-surface-container-low">
        <h3 className="font-label-md text-label-md text-on-surface font-bold">Danh sách đơn hàng</h3>
        <TabGroup tabs={STATUS_TABS} active={activeTab} onChange={onTabChange} size="sm" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wide font-bold">
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Mã đơn</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Khách hàng</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Email</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Ngày đặt</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">SL SP</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">Tổng tiền</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Thanh toán</th>
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
                  <td className="px-sm py-xs border border-outline-variant/30 font-bold text-on-surface whitespace-nowrap">
                    {order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface whitespace-nowrap">
                    {order.customerName}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {order.customerEmail}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {formatDateVn(order.placedAt)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant text-right">
                    {order.items.reduce((sum, i2) => sum + i2.quantity, 0)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 font-bold text-on-surface text-right whitespace-nowrap">
                    {formatVnd(order.total)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30">
                    <StatusDot tone={paymentMeta.tone} label={paymentMeta.label} />
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
                <td colSpan={9} className="px-md py-lg border border-outline-variant/30 text-center text-on-surface-variant font-body-md">
                  Không có đơn hàng nào ở trạng thái này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-md py-xs bg-surface-container-low flex justify-between items-center border-t border-outline-variant/40">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Hiển thị {orders.length} trên {total} đơn hàng
        </span>
        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="font-label-sm text-label-sm text-primary font-bold hover:underline disabled:opacity-50"
          >
            {isLoadingMore ? "Đang tải..." : "Tải thêm"}
          </button>
        )}
      </div>
    </section>
  );
}
