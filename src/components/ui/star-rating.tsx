"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

type StarRatingProps = {
  /** Current value, 0-5. In interactive mode this is the controlled value. */
  value: number;
  /** Omit for a read-only display; pass a setter to make the stars clickable. */
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "text-[14px]",
  md: "text-[18px]",
  lg: "text-[24px]",
};

/** Shared 1-5 star display used for both read-only ratings (product cards, review list) and the write-a-review input. */
export function StarRating({ value, onChange, size = "md", className }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = Boolean(onChange);
  const displayValue = hovered ?? value;

  return (
    <div
      className={`flex text-primary ${className ?? ""}`}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Chọn số sao đánh giá" : `${value.toFixed(1)} trên 5 sao`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(displayValue);
        if (!interactive) {
          return (
            <Icon key={starValue} name="star" filled={filled} className={SIZE_CLASS[size]} aria-hidden />
          );
        }
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={starValue === value}
            aria-label={`${starValue} sao`}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange?.(starValue)}
            className="p-0.5 -m-0.5 hover:scale-110 transition-transform"
          >
            <Icon name="star" filled={filled} className={SIZE_CLASS[size]} />
          </button>
        );
      })}
    </div>
  );
}
