import { apiFetch } from "@/lib/api-client";
import type { ApiPromotion, PaginatedResponse } from "@/lib/api-types";

export function fetchPromotionByCode(code: string) {
  return apiFetch<{ promotion: ApiPromotion; isValid: boolean }>(
    `/promotions/code/${encodeURIComponent(code)}`,
  );
}

/** Admin — the discount table on /admin/promotions. */
export function fetchPromotions(params: { page?: number; pageSize?: number } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString();
  return apiFetch<PaginatedResponse<ApiPromotion>>(`/promotions${qs ? `?${qs}` : ""}`);
}

export function deletePromotion(id: string) {
  return apiFetch<void>(`/promotions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** Mirrors the backend's `promotionSchema` (src/routes/promotions.routes.ts) — admin create payload. */
export type CreatePromotionInput = {
  name: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  appliesTo?: string;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled";
  usageLimit?: number;
};

export function createPromotion(input: CreatePromotionInput) {
  return apiFetch<{ promotion: ApiPromotion }>("/promotions", {
    method: "POST",
    body: input,
  });
}
