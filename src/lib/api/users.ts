import { apiFetch } from "@/lib/api-client";
import type { ApiUser, PaginatedResponse } from "@/lib/api-types";

export type UserListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: ApiUser["role"];
};

function buildQuery(params: UserListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.role) search.set("role", params.role);
  return search.toString();
}

export function fetchUsers(params: UserListParams = {}) {
  const qs = buildQuery(params);
  return apiFetch<PaginatedResponse<ApiUser>>(`/users${qs ? `?${qs}` : ""}`);
}

export function updateUserRole(id: string, role: ApiUser["role"]) {
  return apiFetch<{ user: ApiUser }>(`/users/${encodeURIComponent(id)}/role`, {
    method: "PATCH",
    body: { role },
  });
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}
