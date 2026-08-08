"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Fills the viewport below the fixed header and locks page scroll — this route is meant to be a
 * single, self-contained "contact card" screen, not a normal scrolling page. Each panel still
 * scrolls internally as a safety net on short viewports, so content never gets clipped/unreachable.
 */
export function ContactFullscreenShell({ left, right }: { left: ReactNode; right: ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 h-screen bg-white pt-28 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pb-md flex flex-col">
        <div className="shrink-0 mb-md">
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Liên hệ</h1>
          <p className="text-on-surface-variant font-body-sm text-body-sm">
            Gửi yêu cầu hỗ trợ hoặc liên hệ trực tiếp qua các kênh dưới đây.
          </p>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-md">
          <div className="lg:col-span-2 min-h-0 overflow-y-auto">{left}</div>
          <div className="lg:col-span-3 min-h-0 overflow-y-auto">{right}</div>
        </div>
      </div>
    </div>
  );
}
