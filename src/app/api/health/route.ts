import { API_BASE_URL } from "@/lib/config";

/** Always evaluated per request — a cached "ok" would defeat the purpose of a health check. */
export const dynamic = "force-dynamic";

const BACKEND_TIMEOUT_MS = 5000;

type BackendStatus = { ok: boolean; status?: number; latencyMs: number; error?: string };

/** One probe of the backend. Bounded by a timeout and never throws. */
async function probeBackend(path: string): Promise<BackendStatus> {
  const startedAt = Date.now();
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - startedAt };
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: timedOut ? `timeout sau ${BACKEND_TIMEOUT_MS}ms` : "không kết nối được",
    };
  }
}

/**
 * Frontend health check.
 *   GET /api/health            → liveness of the Next.js app only (instant, never calls the backend)
 *   GET /api/health?deep=1     → also probes the backend (/health) and its database (/health/ready);
 *                                503 if either is down, so a monitor can alert on it
 */
export async function GET(request: Request) {
  const deep = new URL(request.url).searchParams.get("deep") === "1";
  const frontend = { ok: true, time: new Date().toISOString() };

  if (!deep) return Response.json({ ok: true, frontend }, { headers: { "Cache-Control": "no-store" } });

  const [backend, database] = await Promise.all([probeBackend("/health"), probeBackend("/health/ready")]);
  const ok = backend.ok && database.ok;
  return Response.json(
    { ok, frontend, backend: { url: API_BASE_URL, ...backend }, database },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
