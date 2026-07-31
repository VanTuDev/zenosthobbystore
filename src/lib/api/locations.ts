import { apiFetch } from "@/lib/api-client";
import type { ApiProvince, ApiWard } from "@/lib/api-types";

export async function fetchProvinces(query?: string): Promise<ApiProvince[]> {
  const qs = query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
  const body = await apiFetch<{ provinces: ApiProvince[] }>(`/locations/provinces${qs}`);
  return body.provinces;
}

export async function fetchWards(provinceCode: string, query?: string): Promise<ApiWard[]> {
  const params = new URLSearchParams({ provinceCode });
  if (query?.trim()) params.set("q", query.trim());
  const body = await apiFetch<{ wards: ApiWard[] }>(`/locations/wards?${params.toString()}`);
  return body.wards;
}
