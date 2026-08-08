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

const AUTH_TOKEN_KEY = "zenos.auth_token";

/**
 * Fallback session storage for when the browser blocks the cross-site session cookie outright
 * (frontend and backend are different registrable domains) — see auth-provider.tsx, which
 * captures the token Google-login/dev-login hand back and calls this. Cookie auth still works
 * wherever the browser allows it; this only kicks in via the request interceptor below when a
 * token has actually been stored.
 */
export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  else window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

type ApiFetchInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

// The hosted backend (Render free tier) spins down after ~15min idle and can take up to
// 30-50s to wake back up on the next request — during that window requests fail with no
// response at all (which the browser reports as a misleading CORS error) or a raw 5xx from
// the platform, not from our own Express error handler. Retrying a few times with backoff
// covers most of that window without making a warm (the common case) request any slower.
const RETRY_DELAYS_MS = [2000, 4000, 8000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableFailure(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status;
  return status === undefined || status >= 500;
}

/**
 * Thin axios wrapper for the ZENOST backend: always sends the session cookie
 * (withCredentials), always speaks JSON, and turns `{ error }` responses into
 * ApiRequestError instead of leaving callers to guess at the response shape.
 */
export async function apiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const isRetryableMethod = method === "GET"; // side-effect-free — safe to retry blind

  for (let attempt = 0; ; attempt++) {
    try {
      const res = await client.request<T>({
        url: path,
        method,
        headers: init?.headers,
        data: init?.body,
      });
      return res.data;
    } catch (err) {
      if (isRetryableMethod && attempt < RETRY_DELAYS_MS.length && isRetryableFailure(err)) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }

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
}
