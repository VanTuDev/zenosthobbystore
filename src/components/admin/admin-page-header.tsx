import type { ReactNode } from "react";

/**
 * `<h1>` + description (+ optional right-aligned action button) used at the
 * top of every admin page. Keeps title styling consistent and gives every
 * admin page exactly one semantic `<h1>`.
 */
export function AdminPageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-end mb-lg gap-md flex-wrap ${className ?? ""}`}>
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-xs">{title}</h1>
        {description && <p className="text-on-surface-variant font-body-md">{description}</p>}
      </div>
      {action}
    </div>
  );
}
