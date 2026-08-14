import { apiFetch } from "@/lib/api-client";
import type { ApiProduct, ApiProductVariant, ApiProductVideo, PaginatedResponse, ProductFacets } from "@/lib/api-types";

export type ProductListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  categoryIds?: string[];
  brands?: string[];
  scale?: string;
  productType?: ApiProduct["productType"];
  minPrice?: number;
  maxPrice?: number;
  badge?: string;
  stockStatus?: string;
  /** One of the backend's SORT_OPTIONS keys: moi-nhap | gia-thap-cao | gia-cao-thap | pho-bien */
  sort?: string;
};

function buildQuery(params: ProductListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.scale) search.set("scale", params.scale);
  if (params.productType) search.set("productType", params.productType);
  if (params.minPrice !== undefined) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) search.set("maxPrice", String(params.maxPrice));
  if (params.badge) search.set("badge", params.badge);
  if (params.stockStatus) search.set("stockStatus", params.stockStatus);
  if (params.sort) search.set("sort", params.sort);
  for (const categoryId of params.categoryIds ?? []) search.append("categoryId", categoryId);
  for (const brand of params.brands ?? []) search.append("brand", brand);
  return search.toString();
}

export function fetchProducts(params: ProductListParams = {}) {
  const qs = buildQuery(params);
  return apiFetch<PaginatedResponse<ApiProduct>>(`/products${qs ? `?${qs}` : ""}`);
}

export function fetchProductBySlug(slug: string) {
  return apiFetch<{ product: ApiProduct }>(`/products/${encodeURIComponent(slug)}`);
}

export function fetchProductFacets() {
  return apiFetch<ProductFacets>("/products/facets");
}

/** Mirrors the backend's `productSchema` (src/routes/products.routes.ts) — admin create/update payload. */
export type ProductInput = {
  name: string;
  slug?: string;
  brand?: string;
  universe?: string;
  scale?: string;
  price: number;
  compareAtPrice?: number | null;
  sellingPrice?: number | null;
  originalPrice?: number | null;
  promoPrice?: number | null;
  costPrice?: number | null;
  stockStatus?: ApiProduct["stockStatus"];
  stockCount?: number;
  badges?: string[];
  rating?: number;
  reviewCount?: number;
  description?: string;
  highlights?: string[];
  specs?: { label: string; value: string }[];
  images?: string[];
  heroImage?: string;
  videos?: ApiProductVideo[];
  /** Up to 100 — backend rejects more. */
  variants?: ApiProductVariant[];
  categoryId?: string | null;
};

export function createProduct(input: ProductInput) {
  return apiFetch<{ product: ApiProduct }>("/products", { method: "POST", body: input });
}

export function updateProduct(id: string, input: Partial<ProductInput>) {
  return apiFetch<{ product: ApiProduct }>(`/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteProduct(id: string) {
  return apiFetch<void>(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** Admin pastes a TikTok/YouTube link — backend resolves the provider's oEmbed cover image. */
export function resolveProductVideo(url: string) {
  return apiFetch<{ provider: ApiProductVideo["provider"]; thumbnail: string }>("/products/resolve-video", {
    method: "POST",
    body: { url },
  });
}
