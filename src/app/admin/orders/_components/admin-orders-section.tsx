"use client";

import { useEffect, useState } from "react";
import { OrdersTable, type StatusTabKey } from "./orders-table";
import { StatCard } from "@/components/admin/stat-card";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import { fetchOrders } from "@/lib/api/orders";
import { fetchFinanceSummary } from "@/lib/api/finance";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder } from "@/lib/api-types";

const PAGE_SIZE = 50;

function tabToStatuses(tab: StatusTabKey): ApiOrder["status"][] | undefined {
  return tab === "all" ? undefined : [tab as ApiOrder["status"]];
}

export function AdminOrdersSection() {
  const [activeTab, setActiveTab] = useState<StatusTabKey>("all");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [stats, setStats] = useState({ total: 0, pendingCount: 0, deliveredCount: 0, revenue: 0 });

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the loading state for the fetch this same effect issues
    setIsLoading(true);
    fetchOrders({ status: tabToStatuses(activeTab), page: 1, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.items);
        setPage(1);
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
  }, [activeTab]);

  useEffect(() => {
    Promise.all([
      fetchOrders({ pageSize: 1 }),
      fetchOrders({ status: ["pending", "processing"], pageSize: 1 }),
      fetchOrders({ status: ["delivered"], pageSize: 1 }),
      fetchFinanceSummary(),
    ])
      .then(([all, pending, delivered, summary]) => {
        setStats({
          total: all.pagination.total,
          pendingCount: pending.pagination.total,
          deliveredCount: delivered.pagination.total,
          revenue: summary.revenue,
        });
      })
      .catch(() => undefined);
  }, []);

  async function loadMore() {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchOrders({ status: tabToStatuses(activeTab), page: nextPage, pageSize: PAGE_SIZE });
      setOrders((prev) => [...prev, ...res.items]);
      setPage(nextPage);
    } catch (err) {
      setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải thêm đơn hàng.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  const statTiles = [
    { label: "Tổng đơn hàng", value: stats.total.toLocaleString("vi-VN"), icon: "receipt_long" },
    { label: "Cần xử lý", value: stats.pendingCount.toLocaleString("vi-VN"), icon: "pending_actions" },
    { label: "Đã giao thành công", value: stats.deliveredCount.toLocaleString("vi-VN"), icon: "local_shipping" },
    { label: "Doanh thu đã thu", value: formatVnd(stats.revenue), icon: "payments" },
  ];

  return (
    <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        {statTiles.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
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
          onTabChange={setActiveTab}
          total={total}
          isLoadingMore={isLoadingMore}
          hasMore={page < totalPages}
          onLoadMore={loadMore}
        />
      )}
    </>
  );
}
