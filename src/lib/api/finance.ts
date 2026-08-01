import { apiFetch } from "@/lib/api-client";
import type { ApiFinanceTransaction, FinanceStats, FinanceSummary, PaginatedResponse } from "@/lib/api-types";

export function fetchFinanceSummary() {
  return apiFetch<FinanceSummary>("/finance/summary");
}

export function fetchFinanceStats(params: { days?: 7 | 30 | 90 } = {}) {
  const qs = params.days ? `?days=${params.days}` : "";
  return apiFetch<FinanceStats>(`/finance/stats${qs}`);
}

export type FinanceTransactionListParams = {
  type?: ApiFinanceTransaction["type"];
  status?: ApiFinanceTransaction["status"];
  page?: number;
  pageSize?: number;
};

export function fetchFinanceTransactions(params: FinanceTransactionListParams = {}) {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString();
  return apiFetch<PaginatedResponse<ApiFinanceTransaction>>(`/finance/transactions${qs ? `?${qs}` : ""}`);
}
