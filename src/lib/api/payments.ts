import { apiFetch } from "@/lib/api-client";
import type { ApiOrder, PayosPaymentSession } from "@/lib/api-types";

/** Simulated PayOS gateway — no real payment provider involved, see backend src/routes/payments.routes.ts. */
export function createPayosPayment(orderId: string) {
  return apiFetch<PayosPaymentSession>(`/payments/payos/${encodeURIComponent(orderId)}`, { method: "POST" });
}

export function confirmPayosPayment(orderId: string) {
  return apiFetch<{ order: ApiOrder }>(`/payments/payos/${encodeURIComponent(orderId)}/confirm`, {
    method: "POST",
  });
}
