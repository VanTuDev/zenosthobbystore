import { apiFetch } from "@/lib/api-client";
import type { ApiOrder, PaginatedResponse, PublicOrder } from "@/lib/api-types";

export type CreateOrderInput = {
  orderType: ApiOrder["orderType"];
  facebookName: string;
  facebookUrl: string;
  phone?: string;
  addressDetail: string;
  items: { productId?: string; slug: string; name: string; variantName?: string; image: string; price: number; quantity: number }[];
  total?: number;
  depositAmount: number;
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

export function fetchPublicOrder(code: string) {
  return apiFetch<{ order: PublicOrder }>(`/orders/public/${encodeURIComponent(code.toLowerCase())}`);
}

export type OrderListParams = {
  status?: ApiOrder["status"][];
  q?: string;
  page?: number;
  pageSize?: number;
};

function buildQuery(params: OrderListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.q?.trim()) search.set("q", params.q.trim());
  for (const status of params.status ?? []) search.append("status", status);
  return search.toString();
}

export function fetchOrders(params: OrderListParams = {}) {
  const qs = buildQuery(params);
  return apiFetch<PaginatedResponse<ApiOrder>>(`/orders${qs ? `?${qs}` : ""}`);
}

export function fetchOrderSummary() {
  return apiFetch<{ totalAmount: number; depositAmount: number; remainingAmount: number }>("/orders/summary");
}

export type OrderedProductSummary = {
  productId: string | null;
  slug: string;
  name: string;
  variantName: string;
  image: string;
  quantity: number;
  orderCount: number;
  factoryOrderedQuantity: number;
  surplusQuantity: number;
};

export type OrderedProductOrder = {
  id: string;
  publicCode: string;
  facebookName: string;
  status: ApiOrder["status"];
  quantity: number;
};

export function fetchOrderedProductsSummary() {
  return apiFetch<{ items: OrderedProductSummary[]; totalQuantity: number; totalFactoryOrderedQuantity: number }>("/orders/ordered-products-summary");
}

export function fetchOrdersForOrderedProduct(productKey: string, variantName: string) {
  const search = new URLSearchParams({ productKey, variantName });
  return apiFetch<{ orders: OrderedProductOrder[] }>(`/orders/ordered-products-summary/orders?${search.toString()}`);
}

export function updateFactoryOrderedQuantity(productKey: string, variantName: string, orderedQuantity: number) {
  return apiFetch<{ quantity: { orderedQuantity: number } }>("/orders/ordered-products-summary/factory-quantity", {
    method: "PUT",
    body: { productKey, variantName, orderedQuantity },
  });
}

export function updateOrderStatus(id: string, status: ApiOrder["status"], trackingCode?: string) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status, trackingCode },
  });
}

export function updateOrderPaymentStatus(id: string, paymentStatus: ApiOrder["paymentStatus"]) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}/payment-status`, {
    method: "PATCH",
    body: { paymentStatus },
  });
}

export function enableAutomaticOrderStatus(id: string) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}/status/automatic`, { method: "PATCH" });
}

export function updateOrderItemStatus(id: string, itemIndex: number, status: ApiOrder["status"]) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}/items/${itemIndex}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function updateOrderItems(id: string, items: ApiOrder["items"]) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}/items`, {
    method: "PUT",
    body: { items },
  });
}

export type SplitOrderInput = {
  selections: { itemIndex: number; quantity: number }[];
  newTotal: number;
  newDepositAmount: number;
  originalTotal: number;
  originalDepositAmount: number;
};

export function splitOrder(id: string, input: SplitOrderInput) {
  return apiFetch<{ originalOrder: ApiOrder; newOrder: ApiOrder }>(`/orders/${encodeURIComponent(id)}/split`, {
    method: "POST",
    body: input,
  });
}

export function updateOrderDetails(
  id: string,
  input: Partial<Pick<ApiOrder, "orderType" | "facebookName" | "facebookUrl" | "phone" | "addressDetail" | "total" | "depositAmount">>,
) {
  return apiFetch<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}/details`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteOrder(id: string) {
  return apiFetch<void>(`/orders/${encodeURIComponent(id)}`, { method: "DELETE" });
}
