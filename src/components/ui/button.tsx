import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "danger";
type Size = "md" | "sm";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:brightness-110 active:scale-95",
  secondary:
    "bg-transparent text-on-surface border-2 border-on-surface hover:bg-on-surface hover:text-surface active:scale-95",
  dark: "bg-on-surface text-surface hover:bg-primary active:scale-95",
  ghost:
    "bg-transparent text-primary hover:opacity-80 active:scale-95 font-bold",
  danger: "bg-error text-on-error hover:brightness-110 active:scale-95",
};

const sizeClasses: Record<Size, string> = {
  md: "px-lg py-base rounded-lg",
  sm: "px-md py-sm rounded-lg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = `inline-flex items-center justify-center gap-xs font-label-md text-label-md transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ""}`;

  if (props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, href: _h, ...buttonRest } = props;
  void _v;
  void _s;
  void _c;
  void _h;

  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
