import type { ReactNode } from "react";

/** Shared input/textarea styling so every admin form field matches. */
export const textFieldClass =
  "w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3.5 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

/** Label row for a form field, with an optional required mark and right-aligned counter (e.g. "42/100"). */
export function FieldLabel({
  htmlFor,
  required,
  counter,
  children,
}: {
  /** Pairs the label with a specific input via `id`; omit for a group label (e.g. above a toggle). */
  htmlFor?: string;
  required?: boolean;
  counter?: string;
  children: ReactNode;
}) {
  const text = (
    <>
      {children} {required && <span className="text-error">*</span>}
    </>
  );

  return (
    <div className="flex justify-between items-center mb-1">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="block font-label-md text-[13px] font-semibold text-on-surface">
          {text}
        </label>
      ) : (
        <span className="block font-label-md text-[13px] font-semibold text-on-surface">{text}</span>
      )}
      {counter && <span className="font-body-sm text-[11px] text-outline">{counter}</span>}
    </div>
  );
}
