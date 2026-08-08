import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

/** Thrown for any non-2xx response from the backend, carrying its HTTP status. */
export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type BackendErrorBody = { error: string };

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

type ApiFetchInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

/**
 * Thin axios wrapper for the ZENOST backend: always sends the session cookie
 * (withCredentials), always speaks JSON, and turns `{ error }` responses into
 * ApiRequestError instead of leaving callers to guess at the response shape.
 */
export async function apiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  try {
    const res = await client.request<T>({
      url: path,
      method: init?.method ?? "GET",
      headers: init?.headers,
      data: init?.body,
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === undefined) {
        throw new ApiRequestError(
          0,
          `Không thể kết nối tới backend tại ${API_BASE_URL}${path}. Kiểm tra backend đã chạy và CORS_ORIGIN của backend đã cho phép origin của frontend.`,
        );
      }
      const errorBody = err.response?.data as BackendErrorBody | undefined;
      throw new ApiRequestError(status, errorBody ? errorBody.error : `Yêu cầu tới ${path} thất bại (${status})`);
    }
    throw err;
  }
}
