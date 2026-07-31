import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FinanceTable } from "./_components/finance-table";
import { StatCard } from "@/components/admin/stat-card";
import { transactions } from "@/lib/data/finance";
import { formatVnd } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tài chính",
  description: "Theo dõi dòng tiền, doanh thu và chi phí của Zenos Hobby Store.",
};

function formatDateVn(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const EXPENSE_CATEGORIES = [
  { label: "Nhập hàng (NCC)", keywords: ["NCC", "Nhập hàng"] },
  { label: "Vận hành & Mặt bằng", keywords: ["mặt bằng", "Chi nhánh"] },
  { label: "Marketing & Quảng cáo", keywords: ["quảng cáo", "Ads"] },
] as const;

export default function AdminFinancePage() {
  const revenueTx = transactions.filter((t) => t.type === "revenue");
  const payoutTx = transactions.filter((t) => t.type === "payout");
  const refundTx = transactions.filter((t) => t.type === "refund");

  const totalRevenue = revenueTx.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = payoutTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalRefund = refundTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netProfit = totalRevenue - totalExpense - totalRefund;
  const availableBalance = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const statCards = [
    {
      label: "Tổng doanh thu",
      value: formatVnd(totalRevenue),
      icon: "trending_up",
      tone: "primary" as const,
    },
    {
      label: "Chi phí",
      value: formatVnd(totalExpense),
      icon: "payments",
      tone: "tertiary" as const,
    },
    {
      label: "Lợi nhuận ròng",
      value: formatVnd(netProfit),
      icon: "account_balance_wallet",
      tone: "primary" as const,
    },
  ];

  // Daily net revenue for the CSS bar chart, derived from mock transactions (revenue-type only).
  const revenueByDate = [...revenueTx].sort((a, b) => a.date.localeCompare(b.date));
  const maxRevenue = Math.max(...revenueByDate.map((t) => t.amount), 1);

  // Expense breakdown by category, derived from payout transactions.
  const breakdown = EXPENSE_CATEGORIES.map((cat) => {
    const amount = payoutTx
      .filter((t) => cat.keywords.some((k) => t.customer.includes(k)))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { label: cat.label, amount };
  }).filter((c) => c.amount > 0);
  const breakdownTotal = breakdown.reduce((sum, c) => sum + c.amount, 0) || 1;

  const barTones = ["bg-primary", "bg-secondary", "bg-tertiary"];

  return (
    <div className="space-y-sm">
        <div className="flex flex-wrap justify-between items-end gap-sm">
          <div>
            <h1 className="font-label-md text-label-md text-on-surface font-bold">Tổng quan tài chính</h1>
            <p className="text-on-surface-variant text-[12px]">
              Theo dõi dòng tiền và hiệu suất kinh doanh của cửa hàng.
            </p>
          </div>
          <div className="flex gap-xs">
            <Button variant="secondary" size="sm" className="!py-1 !px-sm !text-[12px]">
              <Icon name="file_download" className="!text-[16px]" /> Xuất báo cáo
            </Button>
            <Button variant="primary" size="sm" className="!py-1 !px-sm !text-[12px]">
              <Icon name="add" className="!text-[16px]" /> Thêm giao dịch
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-sm">
          {statCards.map((card) => (
            <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} tone={card.tone} compact />
          ))}
          <StatCard icon="savings" label="Số dư khả dụng" value={formatVnd(availableBalance)} filled />
        </div>

        {/* Chart & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-sm">
          {/* CSS Bar Chart: daily revenue */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/20">
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-on-surface-variant mb-2">
              Doanh thu theo ngày
            </h3>
            <div className="h-28 flex items-end gap-xs px-1">
              {revenueByDate.map((tx) => {
                const heightPct = Math.max(6, Math.round((tx.amount / maxRevenue) * 100));
                return (
                  <div key={tx.id} className="flex-1 flex flex-col items-center justify-end h-full group" title={formatVnd(tx.amount)}>
                    <div
                      className="w-full rounded-t bg-primary hover:bg-primary-container transition-colors"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-xs mt-1 px-1">
              {revenueByDate.map((tx) => (
                <span key={tx.id} className="flex-1 text-center text-[10px] text-on-surface-variant">
                  {formatDateVn(tx.date).slice(0, 5)}
                </span>
              ))}
            </div>
          </div>

          {/* Expense breakdown */}
          <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/20 space-y-1.5">
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              Phân bổ chi phí
            </h3>
            {breakdown.map((cat, i) => {
              const pct = Math.round((cat.amount / breakdownTotal) * 100);
              return (
                <div key={cat.label}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-on-surface-variant">{cat.label}</span>
                    <span className="text-on-surface font-bold">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${barTones[i % barTones.length]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {breakdown.length === 0 && (
              <p className="text-on-surface-variant text-[12px]">Chưa có dữ liệu chi phí.</p>
            )}
          </div>
        </div>

      <FinanceTable transactions={transactions} />
    </div>
  );
}
