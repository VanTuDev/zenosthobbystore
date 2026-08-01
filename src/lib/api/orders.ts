import { apiFetch } from "@/lib/api-client";
import type { ApiOrder, PaginatedResponse } from "@/lib/api-types";

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  addressDetail: string;
  items: { productId?: string; slug: string; name: string; image: string; price: number; quantity: number }[];
  shippingFee: number;
  tax?: number;
  promotionCode?: string;
  paymentMethod: ApiOrder["paymentMethod"];
  paymentStatus: ApiOrder["paymentStatus"];
};

/**
 * subtotal/total/status/id/shippingAddress/discount are intentionally absent — the backend
 * always computes those (a `promotionCode` is validated and priced server-side, never a
 * raw discount number from the client).
 */
export function createOrder(input: CreateOrderInput) {
  return apiFetch<{ order: ApiOrder }>("/orders", {
    method: "POST",
    body: input,
  });
}

export function fetchOrder(id: string) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}`);
}

export type OrderListParams = {
  status?: ApiOrder["status"][];
  page?: number;
  pageSize?: number;
};

function buildQuery(params: OrderListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  for (const status of params.status ?? []) search.append("status", status);
  return search.toString();
}

export function fetchOrders(params: OrderListParams = {}) {
  const qs = buildQuery(params);
  return apiFetch<PaginatedResponse<ApiOrder>>(`/orders${qs ? `?${qs}` : ""}`);
}

export function updateOrderStatus(id: string, status: ApiOrder["status"]) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function updateOrderPaymentStatus(id: string, paymentStatus: ApiOrder["paymentStatus"]) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}/payment-status`, {
    method: "PATCH",
    body: { paymentStatus },
  });
}
