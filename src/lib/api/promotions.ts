import { apiFetch } from "@/lib/api-client";
import type { ApiPromotion } from "@/lib/api-types";

export function fetchPromotionByCode(code: string) {
  return apiFetch<{ promotion: ApiPromotion; isValid: boolean }>(
    `/promotions/code/${encodeURIComponent(code)}`,
  );
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
