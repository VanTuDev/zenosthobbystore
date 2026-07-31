"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for destructive actions (delete) — red confirm button + warning icon. */
  tone?: "default" | "danger";
};

type PendingConfirm = ConfirmOptions & { resolve: (confirmed: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

/** Promise-based replacement for `window.confirm` — see CONTRIBUTING.md's "no window.confirm/alert" rule. */
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  function settle(confirmed: boolean) {
    pending?.resolve(confirmed);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <Modal
          onClose={() => settle(false)}
          labelledBy="confirm-dialog-title"
          icon={pending.tone === "danger" ? "warning" : "help"}
          iconClassName={pending.tone === "danger" ? "bg-error/10 text-error" : undefined}
          title={pending.title}
          maxWidthClassName="max-w-96"
        >
          <div className="px-4 sm:px-6 py-4">
            {pending.description && (
              <p className="font-body-md text-body-sm text-on-surface-variant">{pending.description}</p>
            )}
          </div>
          <div className="shrink-0 border-t border-outline-variant/30 px-4 sm:px-6 py-3 bg-surface-container-lowest flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => settle(false)}
              className="px-4 py-2 font-label-md text-xs sm:text-sm text-on-surface-variant hover:bg-surface-container border border-outline-variant/60 rounded-xl transition-colors"
            >
              {pending.cancelLabel ?? "Hủy"}
            </button>
            <Button
              type="button"
              variant={pending.tone === "danger" ? "danger" : "primary"}
              onClick={() => settle(true)}
              className="px-5 py-2 text-xs sm:text-sm font-medium rounded-xl shadow-xs"
            >
              {pending.confirmLabel ?? "Xác nhận"}
            </Button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

/** Must be used within a <ConfirmDialogProvider> (mounted once in AppProviders). Awaits the user's choice. */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  return confirm;
}
