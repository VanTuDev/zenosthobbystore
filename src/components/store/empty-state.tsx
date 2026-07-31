import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

type EmptyStateProps = {
  icon: string;
  iconFilled?: boolean;
  title: ReactNode;
  /** Render the title as the page's `<h1>` (only one per page) or a plain `<p>` for a sub-section. */
  titleAs?: "h1" | "p";
  description?: ReactNode;
  action?: ReactNode;
  /** `lg` is for full-page states (404); `md` fits inline within a page that already has its own `<h1>`. */
  size?: "md" | "lg";
  tone?: "neutral" | "primary";
  className?: string;
};

const SIZE_CLASSES = {
  md: { circle: "w-16 h-16", icon: "!text-[32px]", title: "font-headline-sm text-headline-sm" },
  lg: {
    circle: "w-20 h-20",
    icon: "!text-[40px]",
    title: "font-display-lg text-display-lg-mobile md:text-display-lg",
  },
};

const TONE_CLASSES = {
  neutral: "bg-surface-container-low text-outline",
  primary: "bg-primary/10 text-primary",
};

/**
 * Centered icon + message + optional CTA, used for every "nothing to show"
 * or confirmation state in the storefront (empty wishlist, no search
 * results, missing order, 404, order-placed success).
 */
export function EmptyState({
  icon,
  iconFilled,
  title,
  titleAs = "p",
  description,
  action,
  size = "md",
  tone = "neutral",
  className,
}: EmptyStateProps) {
  const sizeClasses = SIZE_CLASSES[size];
  const TitleTag = titleAs;

  return (
    <div className={`flex flex-col items-center text-center gap-md py-xl ${className ?? ""}`}>
      <span
        className={`flex items-center justify-center ${sizeClasses.circle} rounded-full ${TONE_CLASSES[tone]}`}
      >
        <Icon name={icon} filled={iconFilled} className={sizeClasses.icon} />
      </span>
      <div>
        <TitleTag className={`${sizeClasses.title} text-on-surface mb-xs`}>{title}</TitleTag>
        {description && (
          <p className="text-on-surface-variant font-body-md max-w-112">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
