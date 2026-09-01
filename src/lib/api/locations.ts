import { apiFetch } from "@/lib/api-client";
import type { ApiProvince, ApiWard } from "@/lib/api-types";

export type LegacyLocationOption = { code: string; name: string; fullName: string };

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

export async function fetchLegacyProvinces(query?: string): Promise<LegacyLocationOption[]> {
  const qs = query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
  const body = await apiFetch<{ provinces: LegacyLocationOption[] }>(`/locations/legacy/provinces${qs}`);
  return body.provinces;
}

export async function fetchLegacyDistricts(provinceCode: string, query?: string): Promise<LegacyLocationOption[]> {
  const params = new URLSearchParams({ provinceCode });
  if (query?.trim()) params.set("q", query.trim());
  const body = await apiFetch<{ districts: LegacyLocationOption[] }>(`/locations/legacy/districts?${params.toString()}`);
  return body.districts;
}

export async function fetchLegacyWards(districtCode: string, query?: string): Promise<LegacyLocationOption[]> {
  const params = new URLSearchParams({ districtCode });
  if (query?.trim()) params.set("q", query.trim());
  const body = await apiFetch<{ wards: LegacyLocationOption[] }>(`/locations/legacy/wards?${params.toString()}`);
  return body.wards;
}
