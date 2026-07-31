import type { SelectHTMLAttributes } from "react";
import { Icon } from "@/components/ui/icon";

/** Styled `<select>` with a chevron affordance — native select underneath, so keyboard/type-to-search still works. */
export function SelectField({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={`w-full appearance-none bg-surface-container-low border-none rounded-lg p-md pr-10 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className ?? ""}`}
      >
        {children}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
      />
    </div>
  );
}
