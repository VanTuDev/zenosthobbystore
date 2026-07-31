import { apiFetch } from "@/lib/api-client";
import type { FinanceSummary } from "@/lib/api-types";

export function fetchFinanceSummary() {
  return apiFetch<FinanceSummary>("/finance/summary");
}
