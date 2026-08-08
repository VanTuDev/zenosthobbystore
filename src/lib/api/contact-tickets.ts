import { apiFetch } from "@/lib/api-client";
import type { ApiContactTicket, PaginatedResponse } from "@/lib/api-types";

export type CreateContactTicketInput = {
  subject: ApiContactTicket["subject"];
  orderCode?: string;
  customerName: string;
  customerEmail: string;
  message: string;
  images?: string[];
};

/** Public — the "Gửi yêu cầu hỗ trợ" form on /lien-he, no login required. */
export function createContactTicket(input: CreateContactTicketInput) {
  return apiFetch<{ ticket: ApiContactTicket }>("/contact-tickets", { method: "POST", body: input });
}

export type ContactTicketListParams = {
  status?: ApiContactTicket["status"];
  page?: number;
  pageSize?: number;
};

function buildQuery(params: ContactTicketListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.status) search.set("status", params.status);
  return search.toString();
}

/** Admin inbox for tickets submitted from the storefront contact form. */
export function fetchContactTickets(params: ContactTicketListParams = {}) {
  const qs = buildQuery(params);
  return apiFetch<PaginatedResponse<ApiContactTicket>>(`/contact-tickets${qs ? `?${qs}` : ""}`);
}

export function fetchContactTicket(id: string) {
  return apiFetch<{ ticket: ApiContactTicket }>(`/contact-tickets/${encodeURIComponent(id)}`);
}

export function updateContactTicketStatus(id: string, status: ApiContactTicket["status"]) {
  return apiFetch<{ ticket: ApiContactTicket }>(`/contact-tickets/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function deleteContactTicket(id: string) {
  return apiFetch<void>(`/contact-tickets/${encodeURIComponent(id)}`, { method: "DELETE" });
}
