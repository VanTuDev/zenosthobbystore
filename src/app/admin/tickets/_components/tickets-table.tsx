"use client";

import { Icon } from "@/components/ui/icon";
import { TabGroup, type Tab } from "@/components/admin/tab-group";
import { StatusDot } from "@/components/admin/status-dot";
import type { ApiContactTicket } from "@/lib/api-types";

export const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "open", label: "Mới" },
  { key: "in_progress", label: "Đang xử lý" },
  { key: "resolved", label: "Đã xử lý" },
] as const satisfies readonly Tab<string>[];

export type StatusTabKey = (typeof STATUS_TABS)[number]["key"];

export const SUBJECT_LABEL: Record<ApiContactTicket["subject"], string> = {
  product: "Hỏi thông tin sản phẩm",
  order: "Hỏi về PRE-ORDER",
  return_warranty: "Bảo hành sản phẩm",
  payment: "Hợp tác quảng bá / Affiliate",
  other: "Link, video lỗi / Nội dung khác",
};

export const TICKET_STATUS_META: Record<ApiContactTicket["status"], { label: string; tone: "primary" | "tertiary" | "muted" | "outline" }> = {
  open: { label: "Mới", tone: "outline" },
  in_progress: { label: "Đang xử lý", tone: "primary" },
  resolved: { label: "Đã xử lý", tone: "muted" },
};

function formatDateVn(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function TicketsTable({
  tickets,
  activeTab,
  onTabChange,
  total,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onOpenTicket,
}: {
  tickets: ApiContactTicket[];
  activeTab: StatusTabKey;
  onTabChange: (tab: StatusTabKey) => void;
  total: number;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onOpenTicket: (ticket: ApiContactTicket) => void;
}) {
  return (
    <section className="bg-surface-container-lowest rounded-lg border border-outline-variant/40 overflow-hidden">
      <div className="px-md py-sm border-b border-outline-variant/40 flex flex-wrap gap-sm justify-between items-center bg-surface-container-low">
        <h3 className="font-label-md text-label-md text-on-surface font-bold">Yêu cầu hỗ trợ</h3>
        <TabGroup tabs={STATUS_TABS} active={activeTab} onChange={onTabChange} size="sm" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wide font-bold">
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Ngày gửi</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Khách hàng</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Email</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Chủ đề</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Mã tham chiếu</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Trạng thái</th>
              <th className="px-sm py-xs border border-outline-variant/30 w-8" />
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, i) => {
              const statusMeta = TICKET_STATUS_META[ticket.status];
              return (
                <tr
                  key={ticket.id}
                  onClick={() => onOpenTicket(ticket)}
                  className={`cursor-pointer hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-surface-container-low/40" : ""}`}
                >
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {formatDateVn(ticket.createdAt)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 font-bold text-on-surface whitespace-nowrap">
                    {ticket.customerName}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {ticket.customerEmail}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {SUBJECT_LABEL[ticket.subject]}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {ticket.orderCode || "—"}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30">
                    <StatusDot tone={statusMeta.tone} label={statusMeta.label} />
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-center">
                    <Icon name="chevron_right" className="!text-[18px] text-on-surface-variant" />
                  </td>
                </tr>
              );
            })}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-md py-lg border border-outline-variant/30 text-center text-on-surface-variant font-body-md">
                  Không có yêu cầu hỗ trợ nào ở trạng thái này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-md py-xs bg-surface-container-low flex justify-between items-center border-t border-outline-variant/40">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Hiển thị {tickets.length} trên {total} yêu cầu
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
