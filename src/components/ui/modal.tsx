"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * Shared dialog shell: backdrop, Escape-to-close, body-scroll lock, and the
 * icon/title/close header. Bottom-sheet on mobile, centered card on desktop.
 * `children` renders below the header — typically a <form> owning its own
 * scrollable body + footer, since those vary too much to standardize here.
 */
export function Modal({
  onClose,
  closeDisabled = false,
  labelledBy,
  icon,
  iconClassName = "bg-primary/10 text-primary",
  title,
  subtitle,
  headerActions,
  maxWidthClassName = "max-w-128",
  children,
}: {
  onClose: () => void;
  /** Disables Escape/backdrop/header-close while a save or delete is in flight. */
  closeDisabled?: boolean;
  labelledBy: string;
  icon?: string;
  /** Background/text color classes for the icon badge — defaults to the primary tint. */
  iconClassName?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Extra buttons in the header, left of the close button (e.g. a delete action). */
  headerActions?: ReactNode;
  maxWidthClassName?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !closeDisabled) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, closeDisabled]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative w-full shrink-0 ${maxWidthClassName} max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
      >
        <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-outline-variant/60" />
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <span
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 ${iconClassName}`}
              >
                <Icon name={icon} className="!text-[20px]" />
              </span>
            )}
            <div className="min-w-0">
              <h2
                id={labelledBy}
                className="font-headline-sm text-base sm:text-lg font-bold text-on-surface leading-tight truncate"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="font-body-sm text-xs text-on-surface-variant truncate mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              disabled={closeDisabled}
              aria-label="Đóng"
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors shrink-0 disabled:opacity-50"
            >
              <Icon name="close" className="!text-[20px]" />
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
