"use client";

import { useEffect, useState } from "react";
import { OrdersTable, type StatusTabKey } from "./orders-table";
import { CreateOrderModal } from "./create-order-modal";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import { fetchOrders, fetchOrderSummary } from "@/lib/api/orders";
import { fetchFinanceSummary } from "@/lib/api/finance";
import { ApiRequestError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { ApiOrder } from "@/lib/api-types";

const PAGE_SIZE = 10;

function tabToStatuses(tab: StatusTabKey): ApiOrder["status"][] | undefined {
  if (tab === "all") return undefined;
  if (tab === "shipped") return ["shipped"];
  return ["packing", "deposit_received", "factory_ordered", "factory_shipped", "transit_warehouse", "vietnam_warehouse", "shop_warehouse"];
}

export function AdminOrdersSection() {
  const { showToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTabKey>("all");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [stats, setStats] = useState({ total: 0, pendingCount: 0, deliveredCount: 0, revenue: 0 });
  const [moneyTotals, setMoneyTotals] = useState({ totalAmount: 0, depositAmount: 0, remainingAmount: 0 });

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the loading state for the fetch this same effect issues
    setIsLoading(true);
    fetchOrders({ status: tabToStatuses(activeTab), page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.items);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải danh sách đơn hàng.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, page]);

  useEffect(() => {
    Promise.all([
      fetchOrders({ pageSize: 1 }),
      fetchOrders({ status: tabToStatuses("active"), pageSize: 1 }),
      fetchOrders({ status: ["shipped"], pageSize: 1 }),
      fetchFinanceSummary(),
      fetchOrderSummary(),
    ])
      .then(([all, pending, delivered, summary, orderSummary]) => {
        setStats({
          total: all.pagination.total,
          pendingCount: pending.pagination.total,
          deliveredCount: delivered.pagination.total,
          revenue: summary.revenue,
        });
        setMoneyTotals(orderSummary);
      })
      .catch(() => undefined);
  }, []);

  const statTiles = [
    { label: "Tổng đơn hàng", value: stats.total.toLocaleString("vi-VN"), icon: "receipt_long" },
    { label: "Cần xử lý", value: stats.pendingCount.toLocaleString("vi-VN"), icon: "pending_actions" },
    { label: "Đã vận chuyển", value: stats.deliveredCount.toLocaleString("vi-VN"), icon: "local_shipping" },
    { label: "Doanh thu đã thu", value: formatVnd(stats.revenue), icon: "payments" },
  ];

  return (
    <>
      <div className="flex justify-end mb-md">
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Icon name="add" className="!text-[18px]" />
          Tạo đơn hàng
        </Button>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        {statTiles.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="mb-xl grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <StatCard icon="inventory_2" label="Tổng tiền hàng" value={formatVnd(moneyTotals.totalAmount)} />
        <StatCard icon="account_balance_wallet" label="Tổng tiền cọc" value={formatVnd(moneyTotals.depositAmount)} />
        <StatCard icon="payments" label="Tổng tiền còn lại" value={formatVnd(moneyTotals.remainingAmount)} />
      </section>

      {loadError && (
        <p className="flex items-center gap-xs text-error text-label-md mb-md p-sm bg-error-container/20 rounded-lg">
          <Icon name="error" />
          {loadError}
        </p>
      )}

      {isLoading ? (
        <p className="text-on-surface-variant font-body-md">Đang tải đơn hàng…</p>
      ) : (
        <OrdersTable
          orders={orders}
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setPage(1); }}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(order) => {
            setOrders((prev) => page === totalPages && prev.length < PAGE_SIZE ? [...prev, order] : prev);
            setTotal((prev) => {
              const nextTotal = prev + 1;
              setTotalPages(Math.max(1, Math.ceil(nextTotal / PAGE_SIZE)));
              return nextTotal;
            });
            setStats((prev) => ({
              ...prev,
              total: prev.total + 1,
              pendingCount: order.status !== "shipped" ? prev.pendingCount + 1 : prev.pendingCount,
              revenue: order.paymentStatus === "paid" ? prev.revenue + order.total : prev.revenue,
            }));
            setMoneyTotals((prev) => ({
              totalAmount: prev.totalAmount + order.total,
              depositAmount: prev.depositAmount + order.depositAmount,
              remainingAmount: prev.remainingAmount + Math.max(0, order.total - order.depositAmount),
            }));
            showToast(`Đã tạo đơn hàng cho ${order.customerName}.`, "success");
          }}
        />
      )}
    </>
  );
}
