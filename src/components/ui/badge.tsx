import type { ReactNode } from "react";

type Tone = "primary" | "tertiary" | "muted" | "outline" | "dark";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary text-on-primary",
  tertiary: "bg-tertiary text-on-tertiary",
  muted: "bg-surface-container-highest text-on-surface-variant",
  outline: "border border-outline-variant text-on-surface-variant bg-transparent",
  dark: "bg-on-surface text-surface",
};

export function Badge({
  children,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-block px-sm py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wide ${toneClasses[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
