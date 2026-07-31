import { Icon } from "@/components/ui/icon";

/**
 * Common "still working on it" indicator — an absolutely-positioned dimmed overlay with a
 * spinner, meant to sit over stale content while it's being replaced (filtering, refetching, ...)
 * instead of letting content swap abruptly. Parent must be `relative` (or similarly positioned).
 */
export function LoadingOverlay({ label = "Đang tải..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-sm bg-surface/70 backdrop-blur-[1px] rounded-2xl animate-fade-in"
    >
      <Icon name="progress_activity" className="animate-spin text-primary text-[32px]" />
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
    </div>
  );
}
