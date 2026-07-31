import { API_BASE_URL } from "@/lib/config";
import { ApiRequestError } from "@/lib/api-client";

type UploadImageResponse = { url: string; publicId: string };
type BackendErrorBody = { error: string };

/**
 * Multipart upload — deliberately not routed through apiFetch's axios instance,
 * which defaults to a JSON Content-Type that would clash with the multipart
 * boundary FormData needs. Plain fetch lets the browser set that header itself.
 */
export async function uploadProductImage(file: File): Promise<UploadImageResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = body as BackendErrorBody | null;
    throw new ApiRequestError(res.status, errorBody ? errorBody.error : `Tải ảnh lên thất bại (${res.status})`);
  }

  return body as UploadImageResponse;
}

export async function deleteProductImage(publicId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/uploads/image/${encodeURIComponent(publicId)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok && res.status !== 404) {
    const body: unknown = await res.json().catch(() => null);
    const errorBody = body as BackendErrorBody | null;
    throw new ApiRequestError(res.status, errorBody ? errorBody.error : `Xóa ảnh thất bại (${res.status})`);
  }
}
