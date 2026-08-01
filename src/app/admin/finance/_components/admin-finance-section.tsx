"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/stat-card";
import { Icon } from "@/components/ui/icon";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { ORDER_STATUS_META } from "@/components/ui/order-status-badge";
import { formatVnd } from "@/lib/format";
import { fetchFinanceStats, fetchFinanceSummary, fetchFinanceTransactions } from "@/lib/api/finance";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiFinanceTransaction, FinanceStats, FinanceSummary } from "@/lib/api-types";
import { RevenueChart } from "./revenue-chart";
import { FinanceTable } from "./finance-table";

const RANGE_OPTIONS = [
  { value: "7" as const, label: "7 ngày" },
  { value: "30" as const, label: "30 ngày" },
  { value: "90" as const, label: "90 ngày" },
];

const STATUS_TONE_HEX: Record<string, string> = {
  primary: "bg-primary",
  tertiary: "bg-tertiary",
  outline: "bg-outline",
  muted: "bg-outline-variant",
};

export function AdminFinanceSection() {
  const [days, setDays] = useState<"7" | "30" | "90">("30");
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [transactions, setTransactions] = useState<ApiFinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the loading state for the fetch this same effect issues
    setIsLoading(true);
    Promise.all([
      fetchFinanceSummary(),
      fetchFinanceStats({ days: Number(days) as 7 | 30 | 90 }),
      fetchFinanceTransactions({ pageSize: 50 }),
    ])
      .then(([summaryRes, statsRes, txRes]) => {
        if (cancelled) return;
        setSummary(summaryRes);
        setStats(statsRes);
        setTransactions(txRes.items);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải dữ liệu tài chính.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (loadError) {
    return (
      <p className="flex items-center gap-xs text-error text-label-md p-sm bg-error-container/20 rounded-lg">
        <Icon name="error" />
        {loadError}
      </p>
    );
  }

  if (isLoading || !summary || !stats) {
    return <p className="text-on-surface-variant font-body-md">Đang tải dữ liệu tài chính…</p>;
  }

  const maxStatusCount = Math.max(...stats.ordersByStatus.map((s) => s.count), 1);
  const maxTopProductRevenue = Math.max(...stats.topProducts.map((p) => p.revenue), 1);

  return (
    <div className="space-y-sm">
      <div className="flex flex-wrap justify-between items-end gap-sm">
        <div>
          <h1 className="font-label-md text-label-md text-on-surface font-bold">Tổng quan tài chính</h1>
          <p className="text-on-surface-variant text-[12px]">
            Theo dõi dòng tiền và hiệu suất kinh doanh của cửa hàng.
          </p>
        </div>
        <SegmentedToggle options={RANGE_OPTIONS} value={days} onChange={setDays} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-sm">
        <StatCard icon="trending_up" label="Tổng doanh thu (lũy kế)" value={formatVnd(summary.revenue)} tone="primary" compact />
        <StatCard icon="receipt_long" label={`Đơn hàng (${days} ngày)`} value={stats.totals.totalOrders.toLocaleString("vi-VN")} compact />
        <StatCard icon="payments" label="Giá trị đơn TB" value={formatVnd(stats.totals.aov)} compact />
        <StatCard icon="savings" label="Lợi nhuận ròng (lũy kế)" value={formatVnd(summary.net)} filled />
      </div>

      {/* Chart & breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-sm">
        <div className="lg:col-span-2 bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/20">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-on-surface-variant mb-2">
            Doanh thu theo ngày
          </h3>
          <RevenueChart data={stats.revenueSeries} />
        </div>

        <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/20 space-y-1.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
            Đơn hàng theo trạng thái
          </h3>
          {stats.ordersByStatus.map((row) => {
            const meta = ORDER_STATUS_META[row.status];
            const pct = Math.round((row.count / maxStatusCount) * 100);
            return (
              <div key={row.status}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-on-surface-variant">{meta.label}</span>
                  <span className="text-on-surface font-bold">{row.count}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full ${STATUS_TONE_HEX[meta.tone]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {stats.ordersByStatus.length === 0 && (
            <p className="text-on-surface-variant text-[12px]">Chưa có đơn hàng nào.</p>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/20">
        <h3 className="text-[12px] font-bold uppercase tracking-wide text-on-surface-variant mb-2">
          Sản phẩm bán chạy ({days} ngày)
        </h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-on-surface-variant text-[12px]">Chưa có dữ liệu bán hàng.</p>
        ) : (
          <ul className="space-y-1.5">
            {stats.topProducts.map((p, i) => (
              <li key={p.productId} className="flex items-center gap-2.5">
                <span className="w-5 shrink-0 text-center text-[11px] font-bold text-on-surface-variant">{i + 1}</span>
                <div className="w-8 h-8 rounded-md bg-white border border-outline-variant/30 overflow-hidden relative shrink-0">
                  {p.image && <Image src={p.image} alt="" fill sizes="32px" className="object-contain p-0.5" />}
                </div>
                <span className="flex-1 min-w-0 truncate text-[12px] text-on-surface">{p.name}</span>
                <div className="w-24 shrink-0">
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.round((p.revenue / maxTopProductRevenue) * 100)}%` }} />
                  </div>
                </div>
                <span className="w-14 shrink-0 text-right text-[11px] text-on-surface-variant">{p.quantity} SP</span>
                <span className="w-24 shrink-0 text-right text-[12px] font-bold text-on-surface">{formatVnd(p.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <FinanceTable transactions={transactions} />
    </div>
  );
}
