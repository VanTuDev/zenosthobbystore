import { apiFetch } from "@/lib/api-client";
import type { ApiCategory } from "@/lib/api-types";

export async function fetchCategories(): Promise<ApiCategory[]> {
  const body = await apiFetch<{ categories: ApiCategory[] }>("/categories");
  return body.categories;
}

/** Mirrors the backend's `categorySchema` (src/routes/categories.routes.ts) — admin create/update payload. */
export type CategoryInput = {
  name: string;
  slug?: string;
  status?: ApiCategory["status"];
  description?: string;
  image?: string;
  parentId?: string | null;
};

export function createCategory(input: CategoryInput) {
  return apiFetch<{ category: ApiCategory }>("/categories", { method: "POST", body: input });
}

export function updateCategory(id: string, input: Partial<CategoryInput>) {
  return apiFetch<{ category: ApiCategory }>(`/categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteCategory(id: string) {
  return apiFetch<void>(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
}
