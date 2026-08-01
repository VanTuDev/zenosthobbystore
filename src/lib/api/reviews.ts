import { apiFetch } from "@/lib/api-client";
import type { ApiReview, PaginatedResponse } from "@/lib/api-types";

export function fetchReviews(productId: string, params: { page?: number; pageSize?: number } = {}) {
  const search = new URLSearchParams({ productId });
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  return apiFetch<PaginatedResponse<ApiReview>>(`/reviews?${search.toString()}`);
}

export function createReview(productId: string, input: { rating: number; comment: string }) {
  return apiFetch<{ review: ApiReview }>("/reviews", {
    method: "POST",
    body: { productId, ...input },
  });
}

export function deleteReview(id: string) {
  return apiFetch<void>(`/reviews/${encodeURIComponent(id)}`, { method: "DELETE" });
}
