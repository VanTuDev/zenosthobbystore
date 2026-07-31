"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

type ToastVariant = "success" | "error" | "info";
type ToastItem = { id: number; message: string; variant: ToastVariant };

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: "bg-on-surface text-surface",
  error: "bg-error text-on-error",
  info: "bg-on-surface text-surface",
};

const DURATION_MS = 4000;

const ToastContext = createContext<{ showToast: (message: string, variant?: ToastVariant) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-96"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === "error" ? "alert" : "status"}
            className={`flex items-start gap-2 px-4 py-3 rounded-xl shadow-2xl font-label-md text-label-sm ${VARIANT_CLASS[t.variant]}`}
          >
            <Icon name={VARIANT_ICON[t.variant]} className="!text-[18px] shrink-0 mt-0.5" />
            <span className="leading-snug flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Đóng thông báo"
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <Icon name="close" className="!text-[16px]" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Must be used within a <ToastProvider> (mounted once in AppProviders). */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
