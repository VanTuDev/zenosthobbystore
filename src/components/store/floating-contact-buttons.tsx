"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { BUSINESS_INFO, SOCIAL_LINKS } from "@/lib/business-info";

/** Material Symbols has no brand glyphs — hand-drawn outlines sized to match. */
const BRAND_ICON_PATHS: Record<"facebook" | "tiktok" | "shopee", string> = {
  facebook:
    "M14 13.5h2.5l.5-3.5h-3v-2c0-.97 0-1.87 1.87-1.87H17V3.14C16.7 3.1 15.55 3 14.34 3 11.81 3 10 4.55 10 7.39V10H7v3.5h3V21h4z",
  tiktok:
    "M16.5 3h-3v12.3a2.7 2.7 0 1 1-2.06-2.62V9.3a5.7 5.7 0 1 0 5.06 5.66V9.24a6.9 6.9 0 0 0 4 1.28V7.52a4 4 0 0 1-4-4z",
  shopee:
    "M7.5 8h9l1 12.2a1.8 1.8 0 0 1-1.8 1.8H8.3a1.8 1.8 0 0 1-1.8-1.8L7.5 8zm2-2a2.5 2.5 0 0 1 5 0",
};

const PHONE_ICON_PATH =
  "M6.6 10.8c1.4 2.8 3.7 5.1 6.5 6.5l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8z";

const BUBBLES: {
  key: "facebook" | "tiktok" | "shopee" | "phone";
  href: string;
  label: string;
  bg: string;
  path: string;
  external: boolean;
  pulse?: boolean;
}[] = [
  { key: "facebook", href: SOCIAL_LINKS.facebook, label: "Facebook", bg: "bg-[#1877F2]", path: BRAND_ICON_PATHS.facebook, external: true },
  { key: "tiktok", href: SOCIAL_LINKS.tiktok, label: "TikTok", bg: "bg-black", path: BRAND_ICON_PATHS.tiktok, external: true },
  { key: "shopee", href: SOCIAL_LINKS.shopee, label: "Shopee", bg: "bg-[#EE4D2D]", path: BRAND_ICON_PATHS.shopee, external: true },
  {
    key: "phone",
    href: `tel:${BUSINESS_INFO.phone.replace(/\s+/g, "")}`,
    label: `Gọi ${BUSINESS_INFO.phone}`,
    bg: "bg-[#25D366]",
    path: PHONE_ICON_PATH,
    external: false,
    pulse: true,
  },
];

/**
 * Floating "boxchat"-style contact bubbles fixed to the right edge of the viewport (Facebook /
 * TikTok / Shopee / hotline). On phones (below `sm`) they'd stack tall enough to cover real
 * content, so they start collapsed behind one toggle button and expand on tap; tablet/desktop
 * have the screen space to just show all four straight away, same as before.
 */
export function FloatingContactButtons() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-24 sm:bottom-8 z-40 flex flex-col items-center gap-sm">
      {BUBBLES.map((bubble) => (
        <a
          key={bubble.key}
          href={bubble.href}
          {...(bubble.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={bubble.label}
          title={bubble.label}
          className={`relative ${open ? "flex" : "hidden"} sm:flex items-center justify-center w-12 h-12 rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-transform ${bubble.bg}`}
        >
          {bubble.pulse && (
            <span className={`absolute inset-0 rounded-full ${bubble.bg} opacity-60 animate-ping`} aria-hidden="true" />
          )}
          <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor" className="relative" aria-hidden="true">
            <path d={bubble.path} />
          </svg>
        </a>
      ))}

      {/* Mobile-only toggle — tablet/desktop always show all four bubbles above, no toggle needed. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Ẩn các nút liên hệ" : "Hiện các nút liên hệ"}
        aria-expanded={open}
        className="sm:hidden relative flex items-center justify-center w-12 h-12 rounded-full bg-primary text-on-primary shadow-xl active:scale-95 transition-transform"
      >
        {!open && <span className="absolute inset-0 rounded-full bg-primary opacity-60 animate-ping" aria-hidden="true" />}
        <Icon name={open ? "close" : "chat"} filled={!open} className="relative !text-[22px]" />
      </button>
    </div>
  );
}
