import { apiFetch } from "@/lib/api-client";
import type { ApiPromotion } from "@/lib/api-types";

export function fetchPromotionByCode(code: string) {
  return apiFetch<{ promotion: ApiPromotion; isValid: boolean }>(
    `/promotions/code/${encodeURIComponent(code)}`,
  );
}
