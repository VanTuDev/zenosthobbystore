import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export type Crumb = { label: string; href?: string };

/**
 * `Trang chủ / Category / Current page` trail. Items without `href` render
 * as plain text (used for the current page, last in the list).
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-8 flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm flex-wrap ${className ?? ""}`}
    >
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-xs">
          {index > 0 && <Icon name="chevron_right" className="text-[14px]" />}
          {item.href ? (
            <Link className="hover:text-primary" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span className="text-on-surface">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
