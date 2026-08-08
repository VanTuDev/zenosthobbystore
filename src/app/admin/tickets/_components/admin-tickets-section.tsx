"use client";

import { useEffect, useState } from "react";
import { TicketsTable, type StatusTabKey } from "./tickets-table";
import { TicketDetailModal } from "./ticket-detail-modal";
import { StatCard } from "@/components/admin/stat-card";
import { Icon } from "@/components/ui/icon";
import { fetchContactTickets } from "@/lib/api/contact-tickets";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiContactTicket } from "@/lib/api-types";

const PAGE_SIZE = 50;

function tabToStatus(tab: StatusTabKey): ApiContactTicket["status"] | undefined {
  return tab === "all" ? undefined : tab;
}

export function AdminTicketsSection() {
  const [activeTab, setActiveTab] = useState<StatusTabKey>("all");
  const [tickets, setTickets] = useState<ApiContactTicket[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ApiContactTicket | null>(null);

  const [stats, setStats] = useState({ total: 0, openCount: 0, inProgressCount: 0, resolvedCount: 0 });

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the loading state for the fetch this same effect issues
    setIsLoading(true);
    fetchContactTickets({ status: tabToStatus(activeTab), page: 1, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setTickets(res.items);
        setPage(1);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải danh sách yêu cầu hỗ trợ.");
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
      fetchContactTickets({ pageSize: 1 }),
      fetchContactTickets({ status: "open", pageSize: 1 }),
      fetchContactTickets({ status: "in_progress", pageSize: 1 }),
      fetchContactTickets({ status: "resolved", pageSize: 1 }),
    ])
      .then(([all, open, inProgress, resolved]) => {
        setStats({
          total: all.pagination.total,
          openCount: open.pagination.total,
          inProgressCount: inProgress.pagination.total,
          resolvedCount: resolved.pagination.total,
        });
      })
      .catch(() => undefined);
  }, []);

  async function loadMore() {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchContactTickets({ status: tabToStatus(activeTab), page: nextPage, pageSize: PAGE_SIZE });
      setTickets((prev) => [...prev, ...res.items]);
      setPage(nextPage);
    } catch (err) {
      setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải thêm yêu cầu hỗ trợ.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handleTicketUpdated(updated: ApiContactTicket) {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(updated);
    setStats((prev) => {
      const wasOpen = selectedTicket?.status === "open";
      const wasInProgress = selectedTicket?.status === "in_progress";
      const wasResolved = selectedTicket?.status === "resolved";
      return {
        total: prev.total,
        openCount: prev.openCount - (wasOpen ? 1 : 0) + (updated.status === "open" ? 1 : 0),
        inProgressCount: prev.inProgressCount - (wasInProgress ? 1 : 0) + (updated.status === "in_progress" ? 1 : 0),
        resolvedCount: prev.resolvedCount - (wasResolved ? 1 : 0) + (updated.status === "resolved" ? 1 : 0),
      };
    });
  }

  const statTiles = [
    { label: "Tổng yêu cầu", value: stats.total.toLocaleString("vi-VN"), icon: "confirmation_number" },
    { label: "Mới", value: stats.openCount.toLocaleString("vi-VN"), icon: "mark_email_unread" },
    { label: "Đang xử lý", value: stats.inProgressCount.toLocaleString("vi-VN"), icon: "pending_actions" },
    { label: "Đã xử lý", value: stats.resolvedCount.toLocaleString("vi-VN"), icon: "task_alt" },
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
        <p className="text-on-surface-variant font-body-md">Đang tải yêu cầu hỗ trợ…</p>
      ) : (
        <TicketsTable
          tickets={tickets}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          total={total}
          isLoadingMore={isLoadingMore}
          hasMore={page < totalPages}
          onLoadMore={loadMore}
          onOpenTicket={setSelectedTicket}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdated={handleTicketUpdated} />
      )}
    </>
  );
}
