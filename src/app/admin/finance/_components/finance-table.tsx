"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import { TabGroup } from "@/components/admin/tab-group";
import { StatusDot, type StatusTone } from "@/components/admin/status-dot";
import type { FinanceTransaction } from "@/lib/types";

const TYPE_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "revenue", label: "Doanh thu" },
  { key: "payout", label: "Chi phí" },
  { key: "refund", label: "Hoàn tiền" },
] as const;

type TypeKey = (typeof TYPE_TABS)[number]["key"];

const TYPE_ICON: Record<FinanceTransaction["type"], string> = {
  revenue: "payments",
  refund: "assignment_return",
  payout: "shopping_cart",
};

const STATUS_META: Record<FinanceTransaction["status"], { label: string; tone: StatusTone }> = {
  completed: { label: "Thành công", tone: "primary" },
  pending: { label: "Đang xử lý", tone: "outline" },
  failed: { label: "Thất bại", tone: "tertiary" },
};

function formatDateVn(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function FinanceTable({ transactions }: { transactions: FinanceTransaction[] }) {
  const [activeTab, setActiveTab] = useState<TypeKey>("all");

  const filtered = useMemo(
    () => (activeTab === "all" ? transactions : transactions.filter((t) => t.type === activeTab)),
    [transactions, activeTab],
  );

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/40 overflow-hidden">
      <div className="px-md py-sm border-b border-outline-variant/40 flex flex-wrap gap-sm justify-between items-center bg-surface-container-low">
        <h3 className="font-label-md text-label-md text-on-surface font-bold">Giao dịch gần đây</h3>
        <TabGroup tabs={TYPE_TABS} active={activeTab} onChange={setActiveTab} size="sm" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wide font-bold">
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Mã GD</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Nội dung</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Mã đơn</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Ngày</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Phương thức</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">Số tiền</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, i) => {
              const status = STATUS_META[tx.status];
              const isPositive = tx.amount >= 0;
              return (
                <tr
                  key={tx.id}
                  className={`hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-surface-container-low/40" : ""}`}
                >
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {tx.id}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        name={TYPE_ICON[tx.type]}
                        className={`!text-[15px] shrink-0 ${isPositive ? "text-primary" : "text-tertiary"}`}
                      />
                      <span className="text-on-surface whitespace-nowrap">{tx.customer}</span>
                    </div>
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {tx.orderId}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {formatDateVn(tx.date)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {tx.method}
                  </td>
                  <td
                    className={`px-sm py-xs border border-outline-variant/30 font-bold text-right whitespace-nowrap ${isPositive ? "text-primary" : "text-tertiary"}`}
                  >
                    {isPositive ? "+" : "-"}
                    {formatVnd(Math.abs(tx.amount))}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30">
                    <StatusDot tone={status.tone} label={status.label} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-md py-lg border border-outline-variant/30 text-center text-on-surface-variant font-body-md">
                  Không có giao dịch nào ở loại này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
