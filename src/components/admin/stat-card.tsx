import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  /** Icon chip color when `iconClassName` isn't given. */
  tone?: "primary" | "tertiary";
  /** Full override for the icon chip's classes (e.g. a per-item tone in a list). */
  iconClassName?: string;
  /** Small text in the top-right corner, e.g. a trend ("+12% so với tháng trước"). */
  trend?: ReactNode;
  /** Denser padding/type scale — used where several cards must fit one screen. */
  compact?: boolean;
  /** Primary-filled card style, e.g. a "Số dư khả dụng" highlight. */
  filled?: boolean;
  /** Override the value text's size/weight classes (default `font-headline-md text-headline-md`). */
  valueClassName?: string;
  className?: string;
};

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary-container/10 text-primary",
  tertiary: "bg-tertiary/10 text-tertiary",
};

/**
 * Icon + label + value stat tile, used across every admin overview section
 * (orders, promotions, customers, finance). Two density levels: the default
 * matches the standard admin card size; `compact` matches denser dashboards
 * (e.g. Finance) where several sections must fit without scrolling.
 */
export function StatCard({
  icon,
  label,
  value,
  tone = "primary",
  iconClassName,
  trend,
  compact = false,
  filled = false,
  valueClassName,
  className,
}: StatCardProps) {
  if (filled) {
    return (
      <div className={`bg-primary text-on-primary p-sm rounded-lg ${className ?? ""}`}>
        <div className="inline-flex p-1 bg-white/20 text-on-primary rounded-md mb-1">
          <Icon name={icon} className="!text-[16px]" />
        </div>
        <p className="text-on-primary/80 text-[10px] uppercase tracking-wide">{label}</p>
        <p className="font-label-md text-label-md text-on-primary font-bold">{value}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/20 ${className ?? ""}`}>
        <div className={`inline-flex p-1 rounded-md mb-1 ${iconClassName ?? TONE_CLASSES[tone]}`}>
          <Icon name={icon} className="!text-[16px]" />
        </div>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-wide">{label}</p>
        <p className="font-label-md text-label-md text-on-surface font-bold">{value}</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 premium-shadow ${className ?? ""}`}
    >
      <div className="flex justify-between items-start mb-sm">
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${iconClassName ?? TONE_CLASSES[tone]}`}>
          <Icon name={icon} />
        </span>
        {trend}
      </div>
      <p className="text-on-surface-variant font-label-md text-label-sm uppercase tracking-wider">{label}</p>
      <p className={valueClassName ?? "font-headline-md text-headline-md text-on-surface mt-xs"}>{value}</p>
    </div>
  );
}
