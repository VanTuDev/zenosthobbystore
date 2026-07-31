export type StatusTone = "primary" | "tertiary" | "muted" | "outline";

const DOT_CLASS: Record<StatusTone, string> = {
  primary: "bg-primary",
  tertiary: "bg-tertiary",
  muted: "bg-outline-variant",
  outline: "bg-outline",
};

/**
 * Colored dot + label used for compact status cells in admin data tables
 * (Orders, Finance). Shares its tone vocabulary with `Badge` (`ui/badge.tsx`)
 * so the same semantic tone reads consistently as a pill elsewhere or a dot
 * here, whichever fits the table's density.
 */
export function StatusDot({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_CLASS[tone]}`} />
      {label}
    </span>
  );
}
